package com.taskflow.modules.workspace.controller;

import com.taskflow.common.ApiResponse;
import com.taskflow.modules.workspace.dto.CreateWorkspaceRequest;
import com.taskflow.modules.workspace.dto.UpdateWorkspaceRequest;
import com.taskflow.modules.workspace.dto.WorkspaceDto;
import com.taskflow.modules.workspace.dto.WorkspaceMemberDto;
import com.taskflow.modules.workspace.service.WorkspaceService;
import com.taskflow.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.taskflow.modules.workspace.dto.InviteMemberRequest;
import com.taskflow.modules.workspace.dto.UpdateMemberRoleRequest;
import com.taskflow.modules.workspace.dto.WorkspaceInvitationDto;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
@Tag(name = "Workspace Management", description = "Endpoints for managing workspaces and memberships")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create a new workspace")
    public ResponseEntity<ApiResponse<WorkspaceDto>> createWorkspace(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateWorkspaceRequest request) {
        WorkspaceDto workspace = workspaceService.createWorkspace(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workspace created successfully", workspace));
    }

    @GetMapping
    @Operation(summary = "Get all workspaces for the authenticated user")
    public ResponseEntity<ApiResponse<List<WorkspaceDto>>> getUserWorkspaces(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<WorkspaceDto> workspaces = workspaceService.getUserWorkspaces(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Workspaces retrieved successfully", workspaces));
    }

    @GetMapping("/{workspaceId}")
    @Operation(summary = "Get workspace details by ID")
    public ResponseEntity<ApiResponse<WorkspaceDto>> getWorkspaceDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId) {
        WorkspaceDto workspace = workspaceService.getWorkspaceDetails(principal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Workspace details retrieved successfully", workspace));
    }

    @PutMapping("/{workspaceId}")
    @Operation(summary = "Update workspace settings")
    public ResponseEntity<ApiResponse<WorkspaceDto>> updateWorkspace(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId,
            @Valid @RequestBody UpdateWorkspaceRequest request) {
        WorkspaceDto updated = workspaceService.updateWorkspace(principal.getId(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success("Workspace updated successfully", updated));
    }

    @DeleteMapping("/{workspaceId}")
    @Operation(summary = "Delete (soft-delete) a workspace")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId) {
        workspaceService.deleteWorkspace(principal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Workspace deleted successfully", null));
    }

    @GetMapping("/{workspaceId}/members")
    @Operation(summary = "Get members of a workspace")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberDto>>> getWorkspaceMembers(
            @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId) {
        List<WorkspaceMemberDto> members = workspaceService.getWorkspaceMembers(principal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Workspace members retrieved successfully", members));
    }

    @PostMapping("/{workspaceId}/invitations")
    @Operation(summary = "Invite a new member to a workspace by email")
    public ResponseEntity<ApiResponse<WorkspaceInvitationDto>> inviteMember(
            @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId,
            @Valid @RequestBody InviteMemberRequest request) {
        WorkspaceInvitationDto invitation = workspaceService.inviteMember(principal.getId(), workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workspace invitation sent successfully", invitation));
    }

    @GetMapping("/{workspaceId}/invitations")
    @Operation(summary = "Get pending invitations for a workspace")
    public ResponseEntity<ApiResponse<List<WorkspaceInvitationDto>>> getPendingInvitations(
            @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId) {
        List<WorkspaceInvitationDto> invitations = workspaceService.getPendingInvitations(principal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Pending workspace invitations retrieved successfully", invitations));
    }

    @PostMapping("/invitations/{token}/accept")
    @Operation(summary = "Accept a workspace invitation via token")
    public ResponseEntity<ApiResponse<WorkspaceMemberDto>> acceptInvitation(
            @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String token) {
        WorkspaceMemberDto member = workspaceService.acceptInvitation(principal.getId(), token);
        return ResponseEntity.ok(ApiResponse.success("Workspace invitation accepted successfully", member));
    }

    @PatchMapping("/{workspaceId}/members/{memberId}/role")
    @Operation(summary = "Update role of a workspace member")
    public ResponseEntity<ApiResponse<WorkspaceMemberDto>> updateMemberRole(
            @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId,
            @PathVariable UUID memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        WorkspaceMemberDto member = workspaceService.updateMemberRole(principal.getId(), workspaceId, memberId, request);
        return ResponseEntity.ok(ApiResponse.success("Member role updated successfully", member));
    }

    @DeleteMapping("/{workspaceId}/members/{memberId}")
    @Operation(summary = "Remove a member from a workspace")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId,
            @PathVariable UUID memberId) {
        workspaceService.removeMember(principal.getId(), workspaceId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from workspace successfully", null));
    }

    @GetMapping("/{workspaceId}/members/search")
    @Operation(summary = "Search members in workspace for mention picker")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberDto>>> searchMembers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workspaceId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String q) {
        List<WorkspaceMemberDto> members = workspaceService.searchWorkspaceMembers(principal.getId(), workspaceId, q);
        return ResponseEntity.ok(ApiResponse.success("Workspace members matching query retrieved", members));
    }

    @DeleteMapping("/invitations/{invitationId}")
    @Operation(summary = "Cancel a pending workspace invitation")
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID invitationId) {
        workspaceService.cancelInvitation(principal.getId(), invitationId);
        return ResponseEntity.ok(ApiResponse.success("Invitation cancelled successfully", null));
    }
}
