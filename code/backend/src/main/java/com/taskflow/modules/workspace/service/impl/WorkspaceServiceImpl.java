package com.taskflow.modules.workspace.service.impl;

import com.taskflow.common.AppException;
import com.taskflow.common.ResultCode;
import com.taskflow.modules.user.dto.UserDto;
import com.taskflow.modules.user.service.UserService;
import com.taskflow.modules.workspace.dto.CreateWorkspaceRequest;
import com.taskflow.modules.workspace.dto.UpdateWorkspaceRequest;
import com.taskflow.modules.workspace.dto.WorkspaceDto;
import com.taskflow.modules.workspace.dto.WorkspaceMemberDto;
import com.taskflow.modules.workspace.entity.WorkspaceEntity;
import com.taskflow.modules.workspace.entity.WorkspaceMemberEntity;
import com.taskflow.modules.workspace.mapper.WorkspaceMapper;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import com.taskflow.modules.workspace.service.WorkspaceService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.taskflow.modules.workspace.dto.InviteMemberRequest;
import com.taskflow.modules.workspace.dto.UpdateMemberRoleRequest;
import com.taskflow.modules.workspace.dto.WorkspaceInvitationDto;
import com.taskflow.modules.workspace.entity.WorkspaceInvitationEntity;
import com.taskflow.modules.workspace.repository.WorkspaceInvitationRepository;
import com.taskflow.modules.notification.dto.CreateNotificationRequest;
import com.taskflow.modules.notification.service.NotificationService;
import com.taskflow.modules.user.entity.UserEntity;
import com.taskflow.modules.user.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class WorkspaceServiceImpl implements WorkspaceService {

    private static final Logger log = LoggerFactory.getLogger(WorkspaceServiceImpl.class);

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceInvitationRepository invitationRepository;
    private final UserService userService;
    private final WorkspaceMapper workspaceMapper;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WorkspaceServiceImpl(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            WorkspaceInvitationRepository invitationRepository,
            UserService userService,
            WorkspaceMapper workspaceMapper,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.invitationRepository = invitationRepository;
        this.userService = userService;
        this.workspaceMapper = workspaceMapper;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public WorkspaceDto createWorkspace(UUID ownerId, CreateWorkspaceRequest request) {
        String slug = generateSlug(request.getName(), request.getSlug());

        if (workspaceRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        WorkspaceEntity workspace = new WorkspaceEntity();
        workspace.setName(request.getName().trim());
        workspace.setSlug(slug);
        workspace.setDescription(request.getDescription());
        workspace.setOwnerId(ownerId);
        workspace.setIconUrl(request.getIconUrl());
        if (request.getThemeColor() != null) {
            workspace.setThemeColor(request.getThemeColor());
        }

        WorkspaceEntity savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMemberEntity ownerMember = new WorkspaceMemberEntity(
                savedWorkspace.getId(),
                ownerId,
                "OWNER",
                "ACTIVE"
        );
        workspaceMemberRepository.save(ownerMember);

        return workspaceMapper.toDto(savedWorkspace, 1, "OWNER");
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(UUID userId) {
        List<WorkspaceEntity> entities = workspaceRepository.findAllWorkspacesByUserId(userId);
        return entities.stream().map(entity -> {
            long count = workspaceMemberRepository.countByWorkspaceIdAndStatus(entity.getId(), "ACTIVE");
            String role = getUserRoleInWorkspace(entity, userId);
            return workspaceMapper.toDto(entity, count, role);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "workspaces", key = "#workspaceId + ':' + #userId")
    public WorkspaceDto getWorkspaceDetails(UUID userId, UUID workspaceId) {
        WorkspaceEntity workspace = workspaceRepository.findByIdAndIsDeletedFalse(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        verifyMembership(workspace, userId);

        long count = workspaceMemberRepository.countByWorkspaceIdAndStatus(workspace.getId(), "ACTIVE");
        String role = getUserRoleInWorkspace(workspace, userId);

        return workspaceMapper.toDto(workspace, count, role);
    }

    @Override
    @Transactional
    @CacheEvict(value = "workspaces", allEntries = true)
    public WorkspaceDto updateWorkspace(UUID userId, UUID workspaceId, UpdateWorkspaceRequest request) {
        WorkspaceEntity workspace = workspaceRepository.findByIdAndIsDeletedFalse(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        String role = getUserRoleInWorkspace(workspace, userId);
        if (!"OWNER".equals(role) && !"ADMIN".equals(role)) {
            throw new AppException(ResultCode.FORBIDDEN, "Only workspace owners or admins can update settings");
        }

        workspace.setName(request.getName().trim());
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }
        if (request.getIconUrl() != null) {
            workspace.setIconUrl(request.getIconUrl());
        }
        if (request.getThemeColor() != null) {
            workspace.setThemeColor(request.getThemeColor());
        }

        WorkspaceEntity updated = workspaceRepository.save(workspace);
        long count = workspaceMemberRepository.countByWorkspaceIdAndStatus(updated.getId(), "ACTIVE");

        return workspaceMapper.toDto(updated, count, role);
    }

    @Override
    @Transactional
    @CacheEvict(value = "workspaces", allEntries = true)
    public void deleteWorkspace(UUID userId, UUID workspaceId) {
        WorkspaceEntity workspace = workspaceRepository.findByIdAndIsDeletedFalse(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        if (!workspace.getOwnerId().equals(userId)) {
            throw new AppException(ResultCode.FORBIDDEN, "Only the workspace owner can delete this workspace");
        }

        workspace.setIsDeleted(true);
        workspace.setDeletedAt(Instant.now());
        workspaceRepository.save(workspace);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> getWorkspaceMembers(UUID userId, UUID workspaceId) {
        WorkspaceEntity workspace = workspaceRepository.findByIdAndIsDeletedFalse(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        verifyMembership(workspace, userId);

        List<WorkspaceMemberEntity> memberEntities = workspaceMemberRepository.findByWorkspaceId(workspaceId);
        List<WorkspaceMemberDto> members = new ArrayList<>();

        for (WorkspaceMemberEntity entity : memberEntities) {
            UserDto userDto = null;
            try {
                userDto = userService.getCurrentUserProfile(entity.getUserId());
            } catch (Exception ignored) {
            }
            members.add(workspaceMapper.toMemberDto(entity, userDto));
        }

        return members;
    }

    @Override
    @Transactional
    public WorkspaceInvitationDto inviteMember(UUID userId, UUID workspaceId, InviteMemberRequest request) {
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Không tìm thấy Workspace"));

        String userRole = getUserRoleInWorkspace(workspace, userId);
        if (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole) && !"MANAGER".equals(userRole)) {
            throw new AppException(ResultCode.FORBIDDEN, "Chỉ Owner, Admin hoặc Manager mới có quyền mời thành viên");
        }

        String targetEmail = request.getEmail().trim().toLowerCase();
        log.info("Processing workspace invitation for email: {} to workspace: {}", targetEmail, workspaceId);

        // Check if user is ALREADY an active workspace member
        Optional<UserEntity> targetUserOpt = userRepository.findByEmailIgnoreCase(targetEmail);
        if (targetUserOpt.isPresent()) {
            UserEntity targetUser = targetUserOpt.get();
            log.info("Found user for target email {}: userId={}", targetEmail, targetUser.getId());
            if (workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUser.getId()).isPresent()) {
                log.warn("User {} is already an active member of workspace {}", targetEmail, workspaceId);
                throw new AppException(ResultCode.DATA_ALREADY_EXISTS, "Thành viên với email '" + targetEmail + "' đã tham gia Workspace này rồi.");
            }
        } else {
            log.info("Target email {} is not registered in system yet.", targetEmail);
        }

        // Save Invitation record with PENDING status
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS);
        String invitationRole = request.getRole() != null ? request.getRole().toUpperCase() : "MEMBER";

        WorkspaceInvitationEntity invitation = new WorkspaceInvitationEntity(
                workspaceId,
                targetEmail,
                invitationRole,
                token,
                expiresAt
        );

        WorkspaceInvitationEntity saved = invitationRepository.save(invitation);
        log.info("Saved workspace invitation id={} for target email {}", saved.getId(), targetEmail);

        // Send in-app Notification to target user account if registered
        if (targetUserOpt.isPresent()) {
            UserEntity targetUser = targetUserOpt.get();
            try {
                notificationService.createNotification(new CreateNotificationRequest(
                        "Lời mời tham gia Không gian làm việc",
                        "Bạn nhận được lời mời tham gia Workspace '" + workspace.getName() + "' với vai trò " + invitationRole + ". Vui lòng nhấn vào đây để chấp nhận tham gia.",
                        targetUser.getId(),
                        "WORKSPACE_INVITATION",
                        "/invite/" + saved.getToken()
                ));
                log.info("Successfully created WORKSPACE_INVITATION notification for target userId={}", targetUser.getId());
            } catch (Exception e) {
                log.error("Failed to create in-app notification for target userId={}", targetUser.getId(), e);
            }
        }

        return new WorkspaceInvitationDto(
                saved.getId(),
                saved.getWorkspaceId(),
                saved.getEmail(),
                saved.getRole(),
                saved.getToken(),
                saved.getStatus(),
                saved.getExpiresAt(),
                saved.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public WorkspaceMemberDto updateMemberRole(UUID userId, UUID workspaceId, UUID memberId, UpdateMemberRoleRequest request) {
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        String userRole = getUserRoleInWorkspace(workspace, userId);
        if (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new AppException(ResultCode.FORBIDDEN, "Only Owner or Admin can update member roles");
        }

        WorkspaceMemberEntity member = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace member not found"));

        if ("OWNER".equals(member.getRole()) && !"OWNER".equals(userRole)) {
            throw new AppException(ResultCode.FORBIDDEN, "Only Workspace Owner can change Owner role");
        }

        member.setRole(request.getRole().toUpperCase());
        WorkspaceMemberEntity saved = workspaceMemberRepository.save(member);
        UserDto userDto = null;
        try {
            userDto = userService.getCurrentUserProfile(saved.getUserId());
        } catch (Exception ignored) {
        }
        return workspaceMapper.toMemberDto(saved, userDto);
    }

    @Override
    @Transactional
    public void removeMember(UUID userId, UUID workspaceId, UUID memberId) {
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        String userRole = getUserRoleInWorkspace(workspace, userId);
        if (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new AppException(ResultCode.FORBIDDEN, "Only Owner or Admin can remove members");
        }

        WorkspaceMemberEntity member = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace member not found"));

        if ("OWNER".equals(member.getRole())) {
            throw new AppException(ResultCode.FORBIDDEN, "Workspace Owner cannot be removed");
        }

        workspaceMemberRepository.delete(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceInvitationDto> getPendingInvitations(UUID userId, UUID workspaceId) {
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));
        verifyMembership(workspace, userId);

        List<WorkspaceInvitationEntity> invitations = invitationRepository.findByWorkspaceIdAndStatus(workspaceId, "PENDING");
        return invitations.stream().map(inv -> new WorkspaceInvitationDto(
                inv.getId(),
                inv.getWorkspaceId(),
                inv.getEmail(),
                inv.getRole(),
                inv.getToken(),
                inv.getStatus(),
                inv.getExpiresAt(),
                inv.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WorkspaceMemberDto acceptInvitation(UUID userId, String token) {
        WorkspaceInvitationEntity invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Invitation not found or expired"));

        if (!"PENDING".equals(invitation.getStatus()) || invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ResultCode.BAD_REQUEST, "Invitation is invalid or expired");
        }

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        Optional<WorkspaceMemberEntity> existing = workspaceMemberRepository.findByWorkspaceIdAndUserId(invitation.getWorkspaceId(), userId);
        WorkspaceMemberEntity member = existing.orElseGet(() -> new WorkspaceMemberEntity(
                invitation.getWorkspaceId(),
                userId,
                invitation.getRole(),
                "ACTIVE"
        ));

        WorkspaceMemberEntity saved = workspaceMemberRepository.save(member);
        UserDto userDto = null;
        try {
            userDto = userService.getCurrentUserProfile(userId);
        } catch (Exception ignored) {
        }

        // Notify Workspace Owner that user has accepted
        WorkspaceEntity workspace = workspaceRepository.findById(invitation.getWorkspaceId()).orElse(null);
        if (workspace != null && !workspace.getOwnerId().equals(userId)) {
            try {
                String memberName = (userDto != null && userDto.getFullName() != null) ? userDto.getFullName() : "Mới";
                notificationService.createNotification(new CreateNotificationRequest(
                        "Thành viên mới tham gia Workspace",
                        "Thành viên " + memberName + " đã chấp nhận lời mời và chính thức tham gia Workspace '" + workspace.getName() + "'.",
                        workspace.getOwnerId(),
                        "WORKSPACE_MEMBER_JOINED",
                        "/workspaces/" + workspace.getId()
                ));
            } catch (Exception ignored) {
            }
        }

        return workspaceMapper.toMemberDto(saved, userDto);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkspaceInvitationDto getInvitationByToken(String token) {
        WorkspaceInvitationEntity invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Invitation not found or expired"));

        return new WorkspaceInvitationDto(
                invitation.getId(),
                invitation.getWorkspaceId(),
                invitation.getEmail(),
                invitation.getRole(),
                invitation.getToken(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public void cancelInvitation(UUID userId, UUID invitationId) {
        WorkspaceInvitationEntity invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Invitation not found"));

        WorkspaceEntity workspace = workspaceRepository.findById(invitation.getWorkspaceId())
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "Workspace not found"));

        String userRole = getUserRoleInWorkspace(workspace, userId);
        if (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new AppException(ResultCode.FORBIDDEN, "Only Owner or Admin can cancel invitations");
        }

        invitation.setStatus("EXPIRED");
        invitationRepository.save(invitation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> searchWorkspaceMembers(UUID userId, UUID workspaceId, String query) {
        List<WorkspaceMemberDto> allMembers = getWorkspaceMembers(userId, workspaceId);
        if (query == null || query.isBlank()) {
            return allMembers;
        }

        String lowerQ = query.trim().toLowerCase();
        return allMembers.stream().filter(m -> {
            String name = m.getFullName() != null ? m.getFullName().toLowerCase() : "";
            String email = m.getEmail() != null ? m.getEmail().toLowerCase() : "";
            return name.contains(lowerQ) || email.contains(lowerQ);
        }).collect(Collectors.toList());
    }

    private String generateSlug(String name, String customSlug) {
        if (customSlug != null && !customSlug.isBlank()) {
            return customSlug.toLowerCase().replaceAll("[^a-z0-9-]", "-").replaceAll("-+", "-");
        }
        return name.toLowerCase().replaceAll("[^a-z0-9-]", "-").replaceAll("-+", "-");
    }

    private void verifyMembership(WorkspaceEntity workspace, UUID userId) {
        if (workspace.getOwnerId().equals(userId)) {
            return;
        }
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getRoles() != null) {
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equalsIgnoreCase(r.getName()));
            if (isAdmin) {
                return;
            }
        }
        boolean isMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId);
        if (!isMember) {
            throw new AppException(ResultCode.FORBIDDEN, "Access denied to this workspace");
        }
    }

    private String getUserRoleInWorkspace(WorkspaceEntity workspace, UUID userId) {
        if (workspace.getOwnerId().equals(userId)) {
            return "OWNER";
        }
        Optional<WorkspaceMemberEntity> member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), userId);
        return member.map(WorkspaceMemberEntity::getRole).orElse("MEMBER");
    }
}
