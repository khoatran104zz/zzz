package com.taskflow.modules.dashboard.service.impl;

import com.taskflow.modules.dashboard.dto.ActivityItemDto;
import com.taskflow.modules.dashboard.dto.DashboardSummaryDto;
import com.taskflow.modules.dashboard.dto.ProductivityStatsDto;
import com.taskflow.modules.dashboard.service.DashboardService;
import com.taskflow.modules.project.dto.ProjectDto;
import com.taskflow.modules.project.service.ProjectService;
import com.taskflow.modules.task.dto.TaskDto;
import com.taskflow.modules.task.service.TaskService;
import com.taskflow.modules.workspace.dto.WorkspaceDto;
import com.taskflow.modules.workspace.service.WorkspaceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final WorkspaceService workspaceService;
    private final ProjectService projectService;
    private final TaskService taskService;

    public DashboardServiceImpl(
            WorkspaceService workspaceService,
            ProjectService projectService,
            TaskService taskService) {
        this.workspaceService = workspaceService;
        this.projectService = projectService;
        this.taskService = taskService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(UUID userId) {
        List<TaskDto> allUserTasks = getAllUserTasks(userId);

        LocalDate today = LocalDate.now();
        Instant now = Instant.now();

        long todayTasksCount = allUserTasks.stream()
                .filter(t -> t.getDueDate() != null && toLocalDate(t.getDueDate()).equals(today))
                .count();

        long upcomingTasksCount = allUserTasks.stream()
                .filter(t -> t.getDueDate() != null && toLocalDate(t.getDueDate()).isAfter(today) && !isTaskCompleted(t.getStatus()))
                .count();

        long overdueTasksCount = allUserTasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && !isTaskCompleted(t.getStatus()))
                .count();

        long completedTasksCount = allUserTasks.stream()
                .filter(t -> isTaskCompleted(t.getStatus()))
                .count();

        long totalTasksCount = allUserTasks.size();
        double completionRate = totalTasksCount > 0 ? (double) completedTasksCount / totalTasksCount * 100.0 : 0.0;

        List<ActivityItemDto> activities = new ArrayList<>();
        for (TaskDto task : allUserTasks.stream().limit(5).collect(Collectors.toList())) {
            activities.add(new ActivityItemDto(
                    task.getId(),
                    isTaskCompleted(task.getStatus()) ? "TASK_COMPLETED" : "TASK_CREATED",
                    task.getTitle(),
                    "Status: " + task.getStatus() + " | Priority: " + task.getPriority(),
                    task.getUpdatedAt() != null ? task.getUpdatedAt() : task.getCreatedAt()
            ));
        }

        return new DashboardSummaryDto(
                todayTasksCount,
                upcomingTasksCount,
                overdueTasksCount,
                completedTasksCount,
                totalTasksCount,
                Math.round(completionRate * 10.0) / 10.0,
                activities
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getTodayTasks(UUID userId) {
        LocalDate today = LocalDate.now();
        return getAllUserTasks(userId).stream()
                .filter(t -> t.getDueDate() != null && toLocalDate(t.getDueDate()).equals(today))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getUpcomingTasks(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        return getAllUserTasks(userId).stream()
                .filter(t -> t.getDueDate() != null && toLocalDate(t.getDueDate()).isAfter(today) && !toLocalDate(t.getDueDate()).isAfter(nextWeek) && !isTaskCompleted(t.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getOverdueTasks(UUID userId) {
        Instant now = Instant.now();
        return getAllUserTasks(userId).stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && !isTaskCompleted(t.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductivityStatsDto> getProductivityStats(UUID userId) {
        List<TaskDto> allTasks = getAllUserTasks(userId);
        List<ProductivityStatsDto> stats = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long completed = allTasks.stream()
                    .filter(t -> isTaskCompleted(t.getStatus()) && t.getUpdatedAt() != null && toLocalDate(t.getUpdatedAt()).equals(date))
                    .count();
            long created = allTasks.stream()
                    .filter(t -> t.getCreatedAt() != null && toLocalDate(t.getCreatedAt()).equals(date))
                    .count();
            stats.add(new ProductivityStatsDto(date.toString(), completed, created));
        }

        return stats;
    }

    private List<TaskDto> getAllUserTasks(UUID userId) {
        List<TaskDto> allTasks = new ArrayList<>();
        List<WorkspaceDto> userWorkspaces = workspaceService.getUserWorkspaces(userId);

        for (WorkspaceDto workspace : userWorkspaces) {
            List<ProjectDto> workspaceProjects = projectService.getWorkspaceProjects(userId, workspace.getId(), false, null);
            for (ProjectDto project : workspaceProjects) {
                List<TaskDto> projectTasks = taskService.getProjectTasks(userId, project.getId(), null, null, null, false);
                allTasks.addAll(projectTasks);
            }
        }
        return allTasks;
    }

    private boolean isTaskCompleted(String status) {
        if (status == null) return false;
        return "COMPLETED".equalsIgnoreCase(status) || "DONE".equalsIgnoreCase(status);
    }

    private LocalDate toLocalDate(Instant instant) {
        return instant.atZone(ZoneId.systemDefault()).toLocalDate();
    }
}
