package com.taskflow.modules.calendar.scheduler;

import com.taskflow.modules.calendar.entity.CalendarEventEntity;
import com.taskflow.modules.calendar.repository.CalendarEventRepository;
import com.taskflow.modules.notification.dto.CreateNotificationRequest;
import com.taskflow.modules.notification.service.NotificationService;
import com.taskflow.modules.workspace.entity.WorkspaceEntity;
import com.taskflow.modules.workspace.entity.WorkspaceMemberEntity;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class MeetingReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(MeetingReminderScheduler.class);

    private final CalendarEventRepository calendarEventRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final NotificationService notificationService;

    public MeetingReminderScheduler(
            CalendarEventRepository calendarEventRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            WorkspaceRepository workspaceRepository,
            NotificationService notificationService) {
        this.calendarEventRepository = calendarEventRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.notificationService = notificationService;
    }

    /**
     * Periodically check for meetings scheduled to start in the next 15 minutes.
     * Runs every 1 minute.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void sendUpcomingMeetingReminders() {
        Instant now = Instant.now();
        Instant windowEnd = now.plus(15, ChronoUnit.MINUTES);

        List<CalendarEventEntity> upcomingMeetings = calendarEventRepository.findUpcomingMeetingsToRemind(now, windowEnd);

        if (upcomingMeetings.isEmpty()) {
            return;
        }

        for (CalendarEventEntity meeting : upcomingMeetings) {
            try {
                if (meeting.getWorkspaceId() == null) {
                    // Send to creator if no workspace attached
                    notificationService.createNotification(new CreateNotificationRequest(
                            "Lịch họp sắp diễn ra",
                            "Cuộc họp '" + meeting.getTitle() + "' sắp diễn ra trong 15 phút nữa. Vui lòng chuẩn bị tham gia!",
                            meeting.getUserId(),
                            "MEETING_REMINDER",
                            "/calendar"
                    ));
                } else {
                    String wsName = workspaceRepository.findById(meeting.getWorkspaceId())
                            .map(WorkspaceEntity::getName)
                            .orElse("Workspace");

                    List<WorkspaceMemberEntity> members = workspaceMemberRepository.findByWorkspaceId(meeting.getWorkspaceId());
                    for (WorkspaceMemberEntity member : members) {
                        notificationService.createNotification(new CreateNotificationRequest(
                                "Lịch họp sắp diễn ra",
                                "Cuộc họp '" + meeting.getTitle() + "' trong workspace '" + wsName + "' sẽ bắt đầu sau 15 phút nữa. Vui lòng chuẩn bị tham gia!",
                                member.getUserId(),
                                "MEETING_REMINDER",
                                "/calendar"
                        ));
                    }
                }

                meeting.setReminderSent(true);
                calendarEventRepository.save(meeting);
                log.info("Sent meeting reminder for event ID: {} - Title: {}", meeting.getId(), meeting.getTitle());
            } catch (Exception e) {
                log.error("Failed to send reminder for meeting ID: {}", meeting.getId(), e);
            }
        }
    }
}
