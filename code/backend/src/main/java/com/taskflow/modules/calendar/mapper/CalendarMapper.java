package com.taskflow.modules.calendar.mapper;

import com.taskflow.modules.calendar.dto.CalendarEventItemDto;
import com.taskflow.modules.calendar.entity.CalendarEventEntity;
import com.taskflow.modules.task.dto.TaskDto;
import org.springframework.stereotype.Component;

@Component
public class CalendarMapper {

    public CalendarEventItemDto toDto(CalendarEventEntity entity) {
        if (entity == null) {
            return null;
        }

        return new CalendarEventItemDto(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getLocation(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getIsAllDay(),
                entity.getColor(),
                "CUSTOM",
                entity.getTaskId(),
                null,
                null,
                entity.getWorkspaceId(),
                null,
                entity.getMeetingLink(),
                entity.getCreatedAt()
        );
    }

    public CalendarEventItemDto fromTask(TaskDto task) {
        if (task == null || task.getDueDate() == null) {
            return null;
        }

        String taskColor = resolveTaskColor(task.getPriority());

        return new CalendarEventItemDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                null,
                task.getDueDate(),
                task.getDueDate(),
                true,
                taskColor,
                "TASK",
                task.getId(),
                task.getStatus(),
                task.getPriority(),
                null,
                null,
                null,
                task.getCreatedAt()
        );
    }

    private String resolveTaskColor(String priority) {
        if (priority == null) return "#3B82F6"; // Default Blue
        return switch (priority.toUpperCase()) {
            case "URGENT" -> "#EF4444"; // Red
            case "HIGH" -> "#F97316";   // Orange
            case "MEDIUM" -> "#3B82F6"; // Blue
            case "LOW" -> "#10B981";    // Green
            default -> "#6B7280";
        };
    }
}
