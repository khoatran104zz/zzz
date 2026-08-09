package com.taskflow.modules.user.service.impl;

import com.taskflow.common.AppException;
import com.taskflow.common.ResultCode;
import com.taskflow.modules.user.dto.ChangePasswordRequest;
import com.taskflow.modules.user.dto.UpdateProfileRequest;
import com.taskflow.modules.user.dto.UpdateUserSettingsRequest;
import com.taskflow.modules.user.dto.UserDto;
import com.taskflow.modules.user.dto.UserSettingsDto;
import com.taskflow.modules.user.entity.UserEntity;
import com.taskflow.modules.user.entity.UserSettingsEntity;
import com.taskflow.modules.user.mapper.UserMapper;
import com.taskflow.modules.user.mapper.UserSettingsMapper;
import com.taskflow.modules.user.repository.UserRepository;
import com.taskflow.modules.user.repository.UserSettingsRepository;
import com.taskflow.modules.user.service.UserService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service implementation for managing user accounts, profiles, preferences, and password modifications.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserMapper userMapper;
    private final UserSettingsMapper userSettingsMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository,
            UserMapper userMapper,
            UserSettingsMapper userSettingsMapper,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.userMapper = userMapper;
        this.userSettingsMapper = userSettingsMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUserProfile(UUID userId) {
        UserEntity user = findEntityById(userId);
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        UserEntity user = findEntityById(userId);
        user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        UserEntity updated = userRepository.save(user);
        return userMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        UserEntity user = findEntityById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ResultCode.UNAUTHORIZED, "Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSettingsDto getUserSettings(UUID userId) {
        UserSettingsEntity settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> new UserSettingsEntity(userId));
        return userSettingsMapper.toDto(settings);
    }

    @Override
    @Transactional
    public UserSettingsDto updateUserSettings(UUID userId, UpdateUserSettingsRequest request) {
        UserSettingsEntity settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> new UserSettingsEntity(userId));

        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }
        if (request.getTimezone() != null) {
            settings.setTimezone(request.getTimezone());
        }
        if (request.getDateFormat() != null) {
            settings.setDateFormat(request.getDateFormat());
        }
        if (request.getEmailNotifications() != null) {
            settings.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getDesktopNotifications() != null) {
            settings.setDesktopNotifications(request.getDesktopNotifications());
        }
        if (request.getWeeklyDigest() != null) {
            settings.setWeeklyDigest(request.getWeeklyDigest());
        }

        UserSettingsEntity saved = userSettingsRepository.save(settings);
        return userSettingsMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserEntity findEntityById(UUID userId) {
        return userRepository.findByIdWithRolesAndPermissions(userId)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "User not found with ID: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserEntity findEntityByEmail(String email) {
        return userRepository.findByEmailWithRolesAndPermissions(email)
                .orElseThrow(() -> new AppException(ResultCode.NOT_FOUND, "User not found with email: " + email));
    }
}
