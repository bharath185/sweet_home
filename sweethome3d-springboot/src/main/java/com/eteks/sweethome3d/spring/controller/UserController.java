package com.eteks.sweethome3d.spring.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final Map<String, Map<String, Object>> usersDb = new ConcurrentHashMap<>();

    public UserController() {
        // Seed default users for Admin, Designer, and Client
        addUser("u1", "Admin Superuser", "admin@sweethome3d.io", "ADMIN", true, "All Projects");
        addUser("u2", "Interior Architect", "designer@sweethome3d.io", "DESIGNER", true, "Modern 2-Bedroom Suite");
        addUser("u3", "Sarah Jenkins (Client)", "client.sarah@gmail.com", "CLIENT", true, "Modern 2-Bedroom Suite");
        addUser("u4", "David Miller (Client)", "david.m@yahoo.com", "CLIENT", false, "Villa Floor Plan");
        addUser("u5", "Emma Watson (Client)", "emma.w@outlook.com", "CLIENT", true, "Penthouse Studio");
    }

    private void addUser(String id, String name, String email, String role, boolean online, String assignedPlan) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", id);
        user.put("name", name);
        user.put("email", email);
        user.put("role", role);
        user.put("isOnline", online);
        user.put("assignedPlan", assignedPlan);
        user.put("createdAt", new Date().toString());
        usersDb.put(id, user);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(new ArrayList<>(usersDb.values()));
    }

    @GetMapping("/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlineUsers() {
        List<Map<String, Object>> online = new ArrayList<>();
        for (Map<String, Object> u : usersDb.values()) {
            if (Boolean.TRUE.equals(u.get("isOnline"))) {
                online.add(u);
            }
        }
        return ResponseEntity.ok(online);
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> payload) {
        String id = "u_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> user = new HashMap<>();
        user.put("id", id);
        user.put("name", payload.getOrDefault("name", "New User"));
        user.put("email", payload.getOrDefault("email", "user@example.com"));
        user.put("role", payload.getOrDefault("role", "CLIENT"));
        user.put("isOnline", payload.getOrDefault("isOnline", true));
        user.put("assignedPlan", payload.getOrDefault("assignedPlan", "Modern 2-Bedroom Suite"));
        user.put("createdAt", new Date().toString());

        usersDb.put(id, user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleStatus(@PathVariable String id) {
        Map<String, Object> user = usersDb.get(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        boolean current = Boolean.TRUE.equals(user.get("isOnline"));
        user.put("isOnline", !current);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        usersDb.remove(id);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        return ResponseEntity.ok(res);
    }
}
