package com.taskflow.modules.calendar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class CreateCalendarEventRequest {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;
    private String location;

    @NotNull(message = "Start time must not be null")
    private Instant startTime;

    @NotNull(message = "End time must not be null")
    private Instant endTime;

    private UUID taskId;
    
    @NotNull(message = "Workspace ID must not be null")
    private UUID workspaceId;

    private String meetingLink;
    private String color = "#4F46E5";
    private Boolean isAllDay = false;

    public CreateCalendarEventRequest() {
    }

    public CreateCalendarEventRequest(String title, String description, String location, Instant startTime, Instant endTime, UUID taskId, UUID workspaceId, String meetingLink, String color, Boolean isAllDay) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.taskId = taskId;
        this.workspaceId = workspaceId;
        this.meetingLink = meetingLink;
        this.color = (color != null && !color.isBlank()) ? color : "#4F46E5";
        this.isAllDay = isAllDay != null ? isAllDay : false;
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

    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getIsAllDay() {
        return isAllDay;
    }

    public void setIsAllDay(Boolean isAllDay) {
        this.isAllDay = isAllDay;
    }
}
