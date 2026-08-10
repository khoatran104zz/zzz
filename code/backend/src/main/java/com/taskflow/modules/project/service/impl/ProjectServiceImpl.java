package com.taskflow.modules.project.service.impl;

import com.taskflow.common.AppException;
import com.taskflow.common.ResultCode;
import com.taskflow.modules.project.dto.CreateProjectRequest;
import com.taskflow.modules.project.dto.ProjectDto;
import com.taskflow.modules.project.dto.ProjectStatsDto;
import com.taskflow.modules.project.dto.UpdateProjectRequest;
import com.taskflow.modules.project.entity.ProjectEntity;
import com.taskflow.modules.project.mapper.ProjectMapper;
import com.taskflow.modules.project.repository.ProjectRepository;
import com.taskflow.modules.project.service.ProjectService;
import com.taskflow.modules.workspace.service.WorkspaceService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.taskflow.modules.project.dto.AddProjectMemberRequest;
import com.taskflow.modules.project.dto.ProjectMemberDto;
import com.taskflow.modules.project.entity.ProjectMemberEntity;
import com.taskflow.modules.project.repository.ProjectMemberRepository;
import com.taskflow.modules.user.dto.UserDto;
import com.taskflow.modules.user.service.UserService;
import com.taskflow.modules.workspace.dto.UpdateMemberRoleRequest;
import com.taskflow.modules.notification.dto.CreateNotificationRequest;
import com.taskflow.modules.notification.service.NotificationService;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final WorkspaceService workspaceService;
    private final UserService userService;
    private final ProjectMapper projectMapper;
    private final NotificationService notificationService;

    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            WorkspaceService workspaceService,
            UserService userService,
            ProjectMapper projectMapper,
            NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.workspaceService = workspaceService;
        this.userService = userService;
        this.projectMapper = projectMapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ProjectDto getOrCreateDefaultProject(UUID userId, UUID workspaceId) {
        workspaceService.getWorkspaceDetails(userId, workspaceId);

        List<ProjectEntity> projects = projectRepository.findByWorkspaceIdAndIsDeletedFalseOrderByCreatedAtDesc(workspaceId);
        if (!projects.isEmpty()) {
            return projectMapper.toDto(projects.get(0), calculateEmptyStats());
        }

        ProjectEntity defaultProject = new ProjectEntity(
                "General Tasks",
                "Default workspace project for task management",
                workspaceId,
                "#4F46E5",
                "folder"
        );
        ProjectEntity saved = projectRepository.save(defaultProject);
        return projectMapper.toDto(saved, calculateEmptyStats());
    }

    @Override
    @Transactional
    public ProjectDto createProject(UUID userId, UUID workspaceId, CreateProjectRequest request) {
        workspaceService.getWorkspaceDetails(userId, workspaceId);

        ProjectEntity project = new ProjectEntity(
                request.getName().trim(),
                request.getDescription(),
                workspaceId,
                request.getColor(),
                request.getIcon()
        );

        ProjectEntity saved = projectRepository.save(project);
        return projectMapper.toDto(saved, calculateEmptyStats());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getWorkspaceProjects(UUID userId, UUID workspaceId, Boolean archived, Boolean favorite) {
        workspaceService.getWorkspaceDetails(userId, workspaceId);

        List<ProjectEntity> projects;
        if (Boolean.TRUE.equals(favorite)) {
            projects = projectRepository.findByWorkspaceIdAndIsFavoriteTrueAndIsDeletedFalse(workspaceId);
        } else if (Boolean.TRUE.equals(archived)) {
            projects = projectRepository.findByWorkspaceIdAndIsArchivedTrueAndIsDeletedFalse(workspaceId);
        } else {
            projects = projectRepository.findByWorkspaceIdAndIsDeletedFalseOrderByCreatedAtDesc(workspaceId);
        }

        return projects.stream()
                .map(entity -> projectMapper.toDto(entity, calculateEmptyStats()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "projects", key = "#projectId + ':' + #userId")
    public ProjectDto getProjectDetails(UUID userId, UUID projectId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        return projectMapper.toDto(project, calculateEmptyStats());
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", key = "#projectId + ':' + #userId")
    public ProjectDto updateProject(UUID userId, UUID projectId, UpdateProjectRequest request) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getColor() != null) {
            project.setColor(request.getColor());
        }
        if (request.getIcon() != null) {
            project.setIcon(request.getIcon());
        }

        ProjectEntity updated = projectRepository.save(project);
        return projectMapper.toDto(updated, calculateEmptyStats());
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", key = "#projectId + ':' + #userId")
    public void deleteProject(UUID userId, UUID projectId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        project.setIsDeleted(true);
        project.setDeletedAt(Instant.now());
        projectRepository.save(project);
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", key = "#projectId + ':' + #userId")
    public ProjectDto toggleArchiveProject(UUID userId, UUID projectId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        project.setIsArchived(!project.getIsArchived());
        ProjectEntity updated = projectRepository.save(project);
        return projectMapper.toDto(updated, calculateEmptyStats());
    }

    @Override
    @Transactional
    @CacheEvict(value = "projects", key = "#projectId + ':' + #userId")
    public ProjectDto toggleFavoriteProject(UUID userId, UUID projectId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        project.setIsFavorite(!project.getIsFavorite());
        ProjectEntity updated = projectRepository.save(project);
        return projectMapper.toDto(updated, calculateEmptyStats());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectStatsDto getProjectStats(UUID userId, UUID projectId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        return calculateEmptyStats();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectMemberDto> getProjectMembers(UUID userId, UUID projectId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        List<ProjectMemberEntity> members = memberRepository.findByProjectId(projectId);
        return members.stream().map(m -> {
            UserDto u = userService.getCurrentUserProfile(m.getUserId());
            return new ProjectMemberDto(m.getId(), m.getProjectId(), m.getUserId(), m.getRole(), m.getCreatedAt(), u);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectMemberDto addProjectMember(UUID userId, UUID projectId, AddProjectMemberRequest request) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        if (memberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
            throw new AppException(ResultCode.CONFLICT, "User is already a member of this project");
        }

        ProjectMemberEntity member = new ProjectMemberEntity(projectId, request.getUserId(), request.getRole() != null ? request.getRole() : "MEMBER");
        ProjectMemberEntity saved = memberRepository.save(member);

        if (!request.getUserId().equals(userId)) {
            try {
                notificationService.createNotification(new CreateNotificationRequest(
                        "Tham gia Dự án mới",
                        "Bạn đã được thêm vào dự án '" + project.getName() + "'.",
                        request.getUserId(),
                        "PROJECT_MEMBER_ADDED",
                        "/workspaces"
                ));
            } catch (Exception ignored) {
            }
        }

        UserDto u = userService.getCurrentUserProfile(saved.getUserId());
        return new ProjectMemberDto(saved.getId(), saved.getProjectId(), saved.getUserId(), saved.getRole(), saved.getCreatedAt(), u);
    }

    @Override
    @Transactional
    public ProjectMemberDto updateProjectMemberRole(UUID userId, UUID projectId, UUID memberId, UpdateMemberRoleRequest request) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        ProjectMemberEntity member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "Project member not found"));

        member.setRole(request.getRole());
        ProjectMemberEntity saved = memberRepository.save(member);
        UserDto u = userService.getCurrentUserProfile(saved.getUserId());
        return new ProjectMemberDto(saved.getId(), saved.getProjectId(), saved.getUserId(), saved.getRole(), saved.getCreatedAt(), u);
    }

    @Override
    @Transactional
    public void removeProjectMember(UUID userId, UUID projectId, UUID memberId) {
        ProjectEntity project = findActiveProjectById(projectId);
        workspaceService.getWorkspaceDetails(userId, project.getWorkspaceId());

        ProjectMemberEntity member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "Project member not found"));
        memberRepository.delete(member);
    }

    private ProjectEntity findActiveProjectById(UUID projectId) {
        return projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "Project not found"));
    }

    private ProjectStatsDto calculateEmptyStats() {
        return new ProjectStatsDto(0L, 0L, 0L, 0.0);
    }
}
