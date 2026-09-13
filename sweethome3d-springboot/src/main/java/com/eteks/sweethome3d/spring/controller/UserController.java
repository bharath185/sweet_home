package com.eteks.sweethome3d.spring.controller;

import com.eteks.sweethome3d.spring.entity.UserEntity;
import com.eteks.sweethome3d.spring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/online")
    public ResponseEntity<List<UserEntity>> getOnlineUsers() {
        return ResponseEntity.ok(userRepository.findByIsOnlineTrue());
    }

    @PostMapping("/create")
    public ResponseEntity<UserEntity> createUser(@RequestBody Map<String, Object> payload) {
        String id = "u_" + UUID.randomUUID().toString().substring(0, 8);
        String name = (String) payload.getOrDefault("name", "New User");
        String email = (String) payload.getOrDefault("email", "user_" + UUID.randomUUID().toString().substring(0, 5) + "@example.com");
        String role = (String) payload.getOrDefault("role", "CLIENT");
        boolean isOnline = Boolean.TRUE.equals(payload.get("isOnline"));
        String assignedPlan = (String) payload.getOrDefault("assignedPlan", "Modern 2-Bedroom Suite");

        UserEntity user = new UserEntity(id, name, email, role, isOnline, assignedPlan);
        UserEntity saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<UserEntity> toggleStatus(@PathVariable String id) {
        Optional<UserEntity> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UserEntity user = opt.get();
        user.setIsOnline(!Boolean.TRUE.equals(user.getIsOnline()));
        user.setUpdatedAt(LocalDateTime.now());
        UserEntity saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        boolean exists = userRepository.existsById(id);
        if (exists) {
            userRepository.deleteById(id);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("status", exists ? "success" : "not_found");
        return ResponseEntity.ok(res);
    }
}
