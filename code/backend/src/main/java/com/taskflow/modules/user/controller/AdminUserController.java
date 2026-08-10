package com.taskflow.modules.user.controller;

import com.taskflow.common.ApiResponse;
import com.taskflow.common.AppException;
import com.taskflow.common.ResultCode;
import com.taskflow.modules.user.dto.AdminCreateUserRequest;
import com.taskflow.modules.user.dto.UserDto;
import com.taskflow.modules.user.entity.RoleEntity;
import com.taskflow.modules.user.entity.UserEntity;
import com.taskflow.modules.user.mapper.UserMapper;
import com.taskflow.modules.user.repository.RoleRepository;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.workspace.repository.WorkspaceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Management", description = "Endpoints for system admin user management and statistics")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            WorkspaceRepository workspaceRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.workspaceRepository = workspaceRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get system-wide overview metrics for Admin Dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream().filter(u -> !"LOCKED".equalsIgnoreCase(u.getStatus())).count();
        long totalWorkspaces = workspaceRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("totalWorkspaces", totalWorkspaces);
        stats.put("systemHealth", "HEALTHY");
        stats.put("version", "v1.0.0-ENTERPRISE");

        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved successfully", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "List all system users for Admin Management")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        List<UserDto> dtos = users.stream().map(userMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", dtos));
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user account with assigned role (Admin only)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new AppException(ResultCode.DATA_ALREADY_EXISTS, "Email này đã được sử dụng trên hệ thống");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setIsEmailVerified(true);
        user.setStatus("ACTIVE");

        String targetRole = request.getRole() != null ? request.getRole().toUpperCase() : "ROLE_STAFF";
        if (!targetRole.startsWith("ROLE_")) {
            targetRole = "ROLE_" + targetRole;
        }

        String finalRoleName = targetRole;
        RoleEntity role = roleRepository.findByName(finalRoleName)
                .orElseGet(() -> roleRepository.save(new RoleEntity(finalRoleName, "System Role " + finalRoleName)));

        Set<RoleEntity> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        UserEntity saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản người dùng thành công", userMapper.toDto(saved)));
    }

    @PutMapping("/users/{userId}/status")
    @Operation(summary = "Lock or Unlock a user account (Admin only)")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam String status) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "User not found"));

        user.setStatus(status.toUpperCase());
        UserEntity saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status, userMapper.toDto(saved)));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user system role (ROLE_ADMIN or ROLE_USER)")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam String roleName) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "User not found"));

        String targetRole = roleName.startsWith("ROLE_") ? roleName.toUpperCase() : "ROLE_" + roleName.toUpperCase();
        RoleEntity role = roleRepository.findByName(targetRole)
                .orElseGet(() -> roleRepository.save(new RoleEntity(targetRole, "System Role " + targetRole)));

        Set<RoleEntity> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        UserEntity saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", userMapper.toDto(saved)));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete or disable user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResultCode.RESOURCE_NOT_FOUND, "User not found"));

        user.setStatus("DELETED");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User account deactivated successfully", null));
    }
}
