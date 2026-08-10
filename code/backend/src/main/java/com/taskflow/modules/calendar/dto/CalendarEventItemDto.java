package com.taskflow.modules.calendar.dto;

import java.time.Instant;
import java.util.UUID;

public class CalendarEventItemDto {

    private UUID id;
    private String title;
    private String description;
    private String location;
    private Instant startTime;
    private Instant endTime;
    private Boolean isAllDay;
    private String color;
    private String eventType; // "CUSTOM" or "TASK"
    private UUID taskId;
    private String status;
    private String priority;
    private UUID workspaceId;
    private String workspaceName;
    private String meetingLink;
    private Instant createdAt;

    public CalendarEventItemDto() {
    }

    public CalendarEventItemDto(UUID id, String title, String description, String location, Instant startTime, Instant endTime, Boolean isAllDay, String color, String eventType, UUID taskId, String status, String priority, UUID workspaceId, String workspaceName, String meetingLink, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isAllDay = isAllDay;
        this.color = color;
        this.eventType = eventType;
        this.taskId = taskId;
        this.status = status;
        this.priority = priority;
        this.workspaceId = workspaceId;
        this.workspaceName = workspaceName;
        this.meetingLink = meetingLink;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsAllDay() {
        return isAllDay;
    }

    public void setIsAllDay(Boolean isAllDay) {
        this.isAllDay = isAllDay;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
