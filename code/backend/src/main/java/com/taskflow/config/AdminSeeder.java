package com.taskflow.config;

import com.taskflow.modules.user.entity.RoleEntity;
import com.taskflow.modules.user.entity.UserEntity;
import com.taskflow.modules.user.repository.RoleRepository;
import com.taskflow.modules.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@gmail.com";
        String rawPassword = "12345678";

        RoleEntity adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new RoleEntity("ROLE_ADMIN", "System Administrator Role")));

        RoleEntity managerRole = roleRepository.findByName("ROLE_MANAGER")
                .orElseGet(() -> roleRepository.save(new RoleEntity("ROLE_MANAGER", "Project Manager Role")));

        RoleEntity userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new RoleEntity("ROLE_USER", "Standard Staff Role")));

        // 1. Seed/Update Admin Account (admin@gmail.com)
        Set<RoleEntity> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);
        adminRoles.add(userRole);
        seedUser(adminEmail, rawPassword, "System Administrator", adminRoles);

        // 2. Seed/Update Manager Account (manager@gmail.com)
        Set<RoleEntity> managerRoles = new HashSet<>();
        managerRoles.add(managerRole);
        managerRoles.add(userRole);
        seedUser("manager@gmail.com", rawPassword, "Project Manager", managerRoles);

        // 3. Seed/Update Staff Account (staff@gmail.com)
        Set<RoleEntity> staffRoles = new HashSet<>();
        staffRoles.add(userRole);
        seedUser("staff@gmail.com", rawPassword, "Staff Employee", staffRoles);
    }

    private void seedUser(String email, String password, String fullName, Set<RoleEntity> roles) {
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> {
                    user.setPassword(passwordEncoder.encode(password));
                    user.setFullName(fullName);
                    user.setIsEmailVerified(true);
                    user.setStatus("ACTIVE");
                    user.setRoles(roles);
                    userRepository.save(user);
                    log.info("Successfully updated existing account: {} [{}]", email, fullName);
                },
                () -> {
                    UserEntity user = new UserEntity();
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setFullName(fullName);
                    user.setIsEmailVerified(true);
                    user.setStatus("ACTIVE");
                    user.setRoles(roles);
                    userRepository.save(user);
                    log.info("Successfully seeded new demo account: {} [{}]", email, fullName);
                }
        );
    }
}
