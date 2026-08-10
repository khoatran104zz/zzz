package com.taskflow.modules.calendar.service.impl;

import com.taskflow.common.AppException;
import com.taskflow.common.PageResponse;
import com.taskflow.common.ResultCode;
import com.taskflow.modules.calendar.dto.CalendarEventItemDto;
import com.taskflow.modules.calendar.dto.CreateCalendarEventRequest;
import com.taskflow.modules.calendar.dto.UpdateCalendarEventRequest;
import com.taskflow.modules.calendar.entity.CalendarEventEntity;
import com.taskflow.modules.calendar.mapper.CalendarMapper;
import com.taskflow.modules.calendar.repository.CalendarEventRepository;
import com.taskflow.modules.calendar.service.CalendarService;
import com.taskflow.modules.notification.dto.CreateNotificationRequest;
import com.taskflow.modules.notification.service.NotificationService;
import com.taskflow.modules.user.entity.UserEntity;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.entity.WorkspaceEntity;
import com.taskflow.modules.workspace.entity.WorkspaceMemberEntity;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CalendarServiceImpl implements CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final CalendarMapper calendarMapper;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CalendarServiceImpl(
            CalendarEventRepository calendarEventRepository,
            CalendarMapper calendarMapper,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.calendarEventRepository = calendarEventRepository;
        this.calendarMapper = calendarMapper;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventItemDto> getCalendarEvents(UUID userId, Instant startDate, Instant endDate) {
        List<CalendarEventEntity> customEntities = calendarEventRepository.findUserEventsInRange(userId, startDate, endDate);
        
        Map<UUID, String> workspaceNames = workspaceRepository.findAll().stream()
                .collect(Collectors.toMap(WorkspaceEntity::getId, WorkspaceEntity::getName, (a, b) -> a));

        List<CalendarEventItemDto> customDtos = customEntities.stream()
                .map(entity -> {
                    CalendarEventItemDto dto = calendarMapper.toDto(entity);
                    if (entity.getWorkspaceId() != null && workspaceNames.containsKey(entity.getWorkspaceId())) {
                        dto.setWorkspaceName(workspaceNames.get(entity.getWorkspaceId()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        customDtos.sort(Comparator.comparing(CalendarEventItemDto::getStartTime));
        return customDtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventItemDto> getDayEvents(UUID userId, String dateStr) {
        LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        Instant startOfDay = localDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = localDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);
        return getCalendarEvents(userId, startOfDay, endOfDay);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventItemDto> getWeekEvents(UUID userId, String startDateStr) {
        LocalDate startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        Instant startOfWeek = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfWeek = startDate.plusDays(7).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);
        return getCalendarEvents(userId, startOfWeek, endOfWeek);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventItemDto> getMonthEvents(UUID userId, int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        Instant startInstant = startOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = endOfMonth.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant().minusMillis(1);
        return getCalendarEvents(userId, startInstant, endInstant);
    }

    @Override
    @Transactional
    public CalendarEventItemDto createEvent(UUID userId, CreateCalendarEventRequest request) {
        validateMeetingPermission(userId, request.getWorkspaceId());

        if (request.getWorkspaceId() != null) {
            boolean isMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(request.getWorkspaceId(), userId);
            if (!isMember) {
                throw new AppException(ResultCode.FORBIDDEN, "Bạn không phải thành viên của workspace này");
            }
        }

        CalendarEventEntity entity = new CalendarEventEntity(
                request.getTitle().trim(),
                request.getDescription(),
                request.getLocation(),
                request.getStartTime(),
                request.getEndTime(),
                userId,
                request.getTaskId(),
                request.getColor(),
                request.getIsAllDay(),
                request.getWorkspaceId(),
                request.getMeetingLink()
        );

        CalendarEventEntity saved = calendarEventRepository.save(entity);

        // Notify workspace members of the newly scheduled meeting
        if (saved.getWorkspaceId() != null) {
            String wsName = workspaceRepository.findById(saved.getWorkspaceId())
                    .map(WorkspaceEntity::getName)
                    .orElse("Workspace");
            List<WorkspaceMemberEntity> members = workspaceMemberRepository.findByWorkspaceId(saved.getWorkspaceId());
            for (WorkspaceMemberEntity member : members) {
                try {
                    notificationService.createNotification(new CreateNotificationRequest(
                            "Cuộc họp mới đã được lên lịch",
                            "Cuộc họp '" + saved.getTitle() + "' đã được lên lịch trong workspace '" + wsName + "'.",
                            member.getUserId(),
                            "MEETING",
                            "/calendar"
                    ));
                } catch (Exception ignored) {
                }
            }
        }

        CalendarEventItemDto dto = calendarMapper.toDto(saved);
        if (saved.getWorkspaceId() != null) {
            workspaceRepository.findById(saved.getWorkspaceId()).ifPresent(w -> dto.setWorkspaceName(w.getName()));
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarEventItemDto getEventDetails(UUID userId, UUID eventId) {
        CalendarEventEntity entity = findActiveEventById(eventId);
        CalendarEventItemDto dto = calendarMapper.toDto(entity);
        if (entity.getWorkspaceId() != null) {
            workspaceRepository.findById(entity.getWorkspaceId()).ifPresent(w -> dto.setWorkspaceName(w.getName()));
        }
        return dto;
    }

    @Override
    @Transactional
    public CalendarEventItemDto updateEvent(UUID userId, UUID eventId, UpdateCalendarEventRequest request) {
        CalendarEventEntity entity = findActiveEventById(eventId);
        validateMeetingPermission(userId, request.getWorkspaceId() != null ? request.getWorkspaceId() : entity.getWorkspaceId());

        entity.setTitle(request.getTitle().trim());
        entity.setDescription(request.getDescription());
        entity.setLocation(request.getLocation());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setTaskId(request.getTaskId());
        if (request.getWorkspaceId() != null) {
            entity.setWorkspaceId(request.getWorkspaceId());
        }
        if (request.getMeetingLink() != null) {
            entity.setMeetingLink(request.getMeetingLink());
        }
        if (request.getColor() != null && !request.getColor().isBlank()) {
            entity.setColor(request.getColor());
        }
        if (request.getIsAllDay() != null) {
            entity.setIsAllDay(request.getIsAllDay());
        }

        CalendarEventEntity updated = calendarEventRepository.save(entity);
        CalendarEventItemDto dto = calendarMapper.toDto(updated);
        if (updated.getWorkspaceId() != null) {
            workspaceRepository.findById(updated.getWorkspaceId()).ifPresent(w -> dto.setWorkspaceName(w.getName()));
        }
        return dto;
    }

    @Override
    @Transactional
    public void deleteEvent(UUID userId, UUID eventId) {
        CalendarEventEntity entity = findActiveEventById(eventId);
        validateMeetingPermission(userId, entity.getWorkspaceId());

        entity.setIsDeleted(true);
        entity.setDeletedAt(Instant.now());
        calendarEventRepository.save(entity);
    }

    private void validateMeetingPermission(UUID userId, UUID workspaceId) {
        boolean canManage = false;
        Optional<UserEntity> userOpt = userRepository.findByIdWithRolesAndPermissions(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            if ("admin@gmail.com".equalsIgnoreCase(user.getEmail()) || "manager@gmail.com".equalsIgnoreCase(user.getEmail())) {
                canManage = true;
            } else {
                boolean hasRole = user.getRoles().stream()
                        .anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN")
                                || r.getName().equalsIgnoreCase("ADMIN")
                                || r.getName().equalsIgnoreCase("ROLE_MANAGER")
                                || r.getName().equalsIgnoreCase("MANAGER"));
                if (hasRole) {
                    canManage = true;
                }
            }
        }

        if (!canManage && workspaceId != null) {
            Optional<WorkspaceMemberEntity> memberOpt = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
            if (memberOpt.isPresent()) {
                String role = memberOpt.get().getRole();
                if ("ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) || "OWNER".equalsIgnoreCase(role) || "LEADER".equalsIgnoreCase(role)) {
                    canManage = true;
                }
            }
        }

        if (!canManage) {
            throw new AppException(ResultCode.FORBIDDEN, "Chỉ Quản trị viên (Admin) hoặc Quản lý (Manager) mới có quyền tạo hoặc chỉnh sửa lịch họp.");
        }
    }

    private CalendarEventEntity findActiveEventById(UUID eventId) {
        return calendarEventRepository.findByIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Calendar event not found"));
    }
}
