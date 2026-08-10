package com.taskflow.modules.task.service.impl;

import com.taskflow.common.AppException;
import com.taskflow.common.ResultCode;
import com.taskflow.modules.project.dto.ProjectDto;
import com.taskflow.modules.project.service.ProjectService;
import com.taskflow.modules.task.dto.CreateTaskDependencyRequest;
import com.taskflow.modules.task.dto.CreateTaskRequest;
import com.taskflow.modules.task.dto.TaskDependencyDto;
import com.taskflow.modules.task.dto.TaskDto;
import com.taskflow.modules.task.dto.UpdateTaskRequest;
import com.taskflow.modules.task.dto.UpdateTaskTimelineRequest;
import com.taskflow.modules.task.entity.TaskDependencyEntity;
import com.taskflow.modules.task.entity.TaskEntity;
import com.taskflow.modules.task.mapper.TaskMapper;
import com.taskflow.modules.task.repository.TaskDependencyRepository;
import com.taskflow.modules.task.repository.TaskRepository;
import com.taskflow.modules.task.service.TaskService;
import com.taskflow.modules.user.dto.UserDto;
import com.taskflow.modules.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.taskflow.modules.realtime.service.RealtimePublisher;
import com.taskflow.modules.automation.engine.AutomationEngine;
import com.taskflow.modules.notification.dto.CreateNotificationRequest;
import com.taskflow.modules.notification.service.NotificationService;
import com.taskflow.modules.workspace.entity.WorkspaceMemberEntity;
import com.taskflow.modules.workspace.repository.WorkspaceMemberRepository;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskDependencyRepository dependencyRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final TaskMapper taskMapper;
    private final RealtimePublisher realtimePublisher;
    private final AutomationEngine automationEngine;
    private final NotificationService notificationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public TaskServiceImpl(
            TaskRepository taskRepository,
            TaskDependencyRepository dependencyRepository,
            ProjectService projectService,
            UserService userService,
            TaskMapper taskMapper,
            RealtimePublisher realtimePublisher,
            AutomationEngine automationEngine,
            NotificationService notificationService,
            WorkspaceMemberRepository workspaceMemberRepository) {
        this.taskRepository = taskRepository;
        this.dependencyRepository = dependencyRepository;
        this.projectService = projectService;
        this.userService = userService;
        this.taskMapper = taskMapper;
        this.realtimePublisher = realtimePublisher;
        this.automationEngine = automationEngine;
        this.notificationService = notificationService;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    @Override
    @Transactional
    public TaskDto createWorkspaceTask(UUID userId, UUID workspaceId, CreateTaskRequest request) {
        ProjectDto defaultProject = projectService.getOrCreateDefaultProject(userId, workspaceId);
        TaskDto result = createTask(userId, defaultProject.getId(), request);

        // Notify Managers and Admins for Task Approval Request
        try {
            UserDto creator = userService.getCurrentUserProfile(userId);
            String creatorName = (creator != null && creator.getFullName() != null) ? creator.getFullName() : "Nhân viên";

            List<WorkspaceMemberEntity> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);
            for (WorkspaceMemberEntity member : members) {
                String role = member.getRole() != null ? member.getRole().toUpperCase() : "";
                if (("OWNER".equals(role) || "ADMIN".equals(role) || "MANAGER".equals(role)) && !member.getUserId().equals(userId)) {
                    notificationService.createNotification(new CreateNotificationRequest(
                            "Yêu cầu phê duyệt công việc mới",
                            "Nhân viên " + creatorName + " vừa đề xuất công việc mới: '" + result.getTitle() + "' và gửi yêu cầu phê duyệt.",
                            member.getUserId(),
                            "TASK_APPROVAL_REQUEST",
                            "/workspaces/" + workspaceId
                    ));
                }
            }
        } catch (Exception ignored) {
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getWorkspaceTasks(UUID userId, UUID workspaceId, String status, String priority, UUID assigneeId, String search, Boolean archived) {
        ProjectDto defaultProject = projectService.getOrCreateDefaultProject(userId, workspaceId);
        return getProjectTasks(userId, defaultProject.getId(), status, priority, assigneeId, search, archived);
    }

    @Override
    @Transactional
    public TaskDto createTask(UUID userId, UUID projectId, CreateTaskRequest request) {
        projectService.getProjectDetails(userId, projectId);

        Double maxPosition = taskRepository.findMaxPositionByProjectId(projectId);
        Double position = request.getPosition() != null ? request.getPosition() : maxPosition + 1000.0;

        TaskEntity task = new TaskEntity(
                request.getTitle().trim(),
                request.getDescription(),
                request.getStatus() != null ? request.getStatus() : "TODO",
                request.getPriority() != null ? request.getPriority() : "MEDIUM",
                request.getDueDate(),
                projectId,
                request.getAssigneeId(),
                position
        );

        TaskEntity saved = taskRepository.save(task);
        UserDto assignee = resolveAssignee(saved.getAssigneeId());
        TaskDto result = taskMapper.toDto(saved, assignee);
        automationEngine.evaluateTaskEvent(projectId, "TASK_CREATED", result);

        if (saved.getAssigneeId() != null && !saved.getAssigneeId().equals(userId)) {
            try {
                notificationService.createNotification(new CreateNotificationRequest(
                        "Nhiệm vụ mới được giao",
                        "Bạn vừa được giao nhiệm vụ: '" + saved.getTitle() + "'",
                        saved.getAssigneeId(),
                        "TASK_ASSIGNED",
                        "/tasks/" + saved.getId()
                ));
            } catch (Exception ignored) {
            }
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getProjectTasks(UUID userId, UUID projectId, String status, String priority, String search, Boolean archived) {
        return getProjectTasks(userId, projectId, status, priority, null, search, archived);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getProjectTasks(UUID userId, UUID projectId, String status, String priority, UUID assigneeId, String search, Boolean archived) {
        projectService.getProjectDetails(userId, projectId);

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;
        List<TaskEntity> tasks = taskRepository.searchTasks(projectId, status, priority, assigneeId, archived, searchPattern);

        return tasks.stream().map(task -> {
            UserDto assignee = resolveAssignee(task.getAssigneeId());
            return taskMapper.toDto(task, assignee);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskDto assignTask(UUID userId, UUID taskId, UUID assigneeId) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        if (assigneeId != null) {
            userService.getCurrentUserProfile(assigneeId);
        }

        task.setAssigneeId(assigneeId);
        TaskEntity saved = taskRepository.save(task);
        UserDto assignee = resolveAssignee(saved.getAssigneeId());

        if (saved.getAssigneeId() != null && !saved.getAssigneeId().equals(userId)) {
            try {
                notificationService.createNotification(new CreateNotificationRequest(
                        "Nhiệm vụ mới được giao",
                        "Bạn vừa được giao nhiệm vụ: '" + saved.getTitle() + "'",
                        saved.getAssigneeId(),
                        "TASK_ASSIGNED",
                        "/tasks/" + saved.getId()
                ));
            } catch (Exception ignored) {
            }
        }

        return taskMapper.toDto(saved, assignee);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDto getTaskDetails(UUID userId, UUID taskId) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        UserDto assignee = resolveAssignee(task.getAssigneeId());
        return taskMapper.toDto(task, assignee);
    }

    @Override
    @Transactional
    public TaskDto updateTask(UUID userId, UUID taskId, UpdateTaskRequest request) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        UUID oldAssigneeId = task.getAssigneeId();

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getAssigneeId() != null) {
            task.setAssigneeId(request.getAssigneeId());
        }

        TaskEntity updated = taskRepository.save(task);
        UserDto assignee = resolveAssignee(updated.getAssigneeId());
        TaskDto result = taskMapper.toDto(updated, assignee);
        realtimePublisher.publishTaskEvent(task.getProjectId(), "TASK_UPDATED", result);
        automationEngine.evaluateTaskEvent(task.getProjectId(), "TASK_UPDATED", result);

        if (updated.getAssigneeId() != null && !updated.getAssigneeId().equals(oldAssigneeId) && !updated.getAssigneeId().equals(userId)) {
            try {
                notificationService.createNotification(new CreateNotificationRequest(
                        "Nhiệm vụ mới được giao",
                        "Bạn vừa được giao nhiệm vụ: '" + updated.getTitle() + "'",
                        updated.getAssigneeId(),
                        "TASK_ASSIGNED",
                        "/tasks/" + updated.getId()
                ));
            } catch (Exception ignored) {
            }
        }
        return result;
    }

    @Override
    @Transactional
    public TaskDto updateTaskStatus(UUID userId, UUID taskId, String status) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        task.setStatus(status);
        TaskEntity updated = taskRepository.save(task);
        UserDto assignee = resolveAssignee(updated.getAssigneeId());
        TaskDto result = taskMapper.toDto(updated, assignee);
        realtimePublisher.publishTaskEvent(task.getProjectId(), "TASK_UPDATED", result);
        automationEngine.evaluateTaskEvent(task.getProjectId(), "STATUS_CHANGED", result);
        return result;
    }

    @Override
    @Transactional
    public TaskDto reorderTask(UUID userId, UUID taskId, Double position) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        task.setPosition(position);
        TaskEntity updated = taskRepository.save(task);
        UserDto assignee = resolveAssignee(updated.getAssigneeId());
        TaskDto result = taskMapper.toDto(updated, assignee);
        realtimePublisher.publishTaskEvent(task.getProjectId(), "TASK_REORDERED", result);
        return result;
    }

    @Override
    @Transactional
    public void deleteTask(UUID userId, UUID taskId) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        task.setIsDeleted(true);
        task.setDeletedAt(Instant.now());
        taskRepository.save(task);
    }


    @Override
    @Transactional
    public TaskDto toggleArchiveTask(UUID userId, UUID taskId) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        task.setIsArchived(!task.getIsArchived());
        TaskEntity updated = taskRepository.save(task);
        UserDto assignee = resolveAssignee(updated.getAssigneeId());
        return taskMapper.toDto(updated, assignee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksWithDueDateInRange(UUID userId, Instant start, Instant end) {
        List<TaskEntity> tasks = taskRepository.findTasksWithDueDateInRange(start, end);
        return tasks.stream().map(task -> {
            UserDto assignee = resolveAssignee(task.getAssigneeId());
            return taskMapper.toDto(task, assignee);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskDto moveTaskToColumn(UUID userId, UUID taskId, UUID columnId, String status, Double position) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        task.setColumnId(columnId);
        if (status != null && !status.isBlank()) {
            task.setStatus(status);
        }
        if (position != null) {
            task.setPosition(position);
        }

        TaskEntity updated = taskRepository.save(task);
        UserDto assignee = resolveAssignee(updated.getAssigneeId());
        TaskDto result = taskMapper.toDto(updated, assignee);
        realtimePublisher.publishTaskEvent(task.getProjectId(), "TASK_MOVED", result);
        return result;
    }

    @Override
    @Transactional
    public TaskDto updateTaskTimeline(UUID userId, UUID taskId, UpdateTaskTimelineRequest request) {
        TaskEntity task = findActiveTaskById(taskId);
        projectService.getProjectDetails(userId, task.getProjectId());

        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        TaskEntity updated = taskRepository.save(task);
        UserDto assignee = resolveAssignee(updated.getAssigneeId());
        return taskMapper.toDto(updated, assignee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getProjectTimeline(UUID userId, UUID projectId) {
        projectService.getProjectDetails(userId, projectId);
        List<TaskEntity> tasks = taskRepository.findByProjectIdAndIsDeletedFalseOrderByPositionAsc(projectId);

        return tasks.stream().map(task -> {
            UserDto assignee = resolveAssignee(task.getAssigneeId());
            return taskMapper.toDto(task, assignee);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskDependencyDto createDependency(UUID userId, CreateTaskDependencyRequest request) {
        TaskEntity sourceTask = findActiveTaskById(request.getPredecessorId());
        TaskEntity targetTask = findActiveTaskById(request.getSuccessorId());

        projectService.getProjectDetails(userId, sourceTask.getProjectId());

        if (sourceTask.getId().equals(targetTask.getId())) {
            throw new AppException(ResultCode.VALIDATION_ERROR, "Cannot create dependency on the same task");
        }

        if (dependencyRepository.findByPredecessorIdAndSuccessorIdAndIsDeletedFalse(request.getPredecessorId(), request.getSuccessorId()).isPresent()) {
            throw new AppException(ResultCode.DATA_ALREADY_EXISTS, "Task dependency link already exists");
        }

        TaskDependencyEntity dep = new TaskDependencyEntity(
                request.getPredecessorId(),
                request.getSuccessorId(),
                request.getDependencyType() != null ? request.getDependencyType() : "FINISH_TO_START"
        );
        TaskDependencyEntity saved = dependencyRepository.save(dep);
        return new TaskDependencyDto(saved.getId(), saved.getPredecessorId(), saved.getSuccessorId(), saved.getDependencyType(), saved.getCreatedAt());
    }

    @Override
    @Transactional
    public void deleteDependency(UUID userId, UUID dependencyId) {
        TaskDependencyEntity dep = dependencyRepository.findById(dependencyId)
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "Task dependency not found"));

        TaskEntity sourceTask = findActiveTaskById(dep.getPredecessorId());
        projectService.getProjectDetails(userId, sourceTask.getProjectId());

        dependencyRepository.delete(dep);
    }

    private TaskEntity findActiveTaskById(UUID taskId) {
        return taskRepository.findById(taskId)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "Task not found"));
    }

    private UserDto resolveAssignee(UUID assigneeId) {
        if (assigneeId == null) return null;
        try {
            return userService.getCurrentUserProfile(assigneeId);
        } catch (Exception e) {
            return null;
        }
    }
}
