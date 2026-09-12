package com.eteks.sweethome3d.spring.controller;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.spring.service.SweetHomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/plan")
@CrossOrigin(origins = "*")
public class PlanController {

    @Autowired
    private SweetHomeService sweetHomeService;

    // In-memory persistent plans storage
    private final Map<String, Map<String, Object>> plansDb = new ConcurrentHashMap<>();

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> savePlan(@RequestBody Map<String, Object> planData) {
        String planId = (String) planData.get("id");
        if (planId == null || planId.trim().isEmpty()) {
            planId = UUID.randomUUID().toString().substring(0, 8);
            planData.put("id", planId);
        }
        plansDb.put(planId, planData);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("planId", planId);
        response.put("shareUrl", "/?mode=customer&planId=" + planId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPlans() {
        return ResponseEntity.ok(new ArrayList<>(plansDb.values()));
    }

    @GetMapping("/{planId}")
    public ResponseEntity<Map<String, Object>> getPlan(@PathVariable String planId) {
        Map<String, Object> plan = plansDb.get(planId);
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        List<Map<String, Object>> templates = new ArrayList<>();

        Map<String, Object> t1 = new HashMap<>();
        t1.put("id", "tpl-modern-suite");
        t1.put("name", "Modern 2-Bedroom Suite");
        t1.put("description", "Spacious open living room with en-suite bathroom and master bedroom.");
        t1.put("floors", 2);
        t1.put("area", "85 m²");
        templates.add(t1);

        Map<String, Object> t2 = new HashMap<>();
        t2.put("id", "tpl-studio-loft");
        t2.put("name", "Urban Studio Loft");
        t2.put("description", "Compact minimalist studio apartment design with kitchen island.");
        t2.put("floors", 1);
        t2.put("area", "45 m²");
        templates.add(t2);

        Map<String, Object> t3 = new HashMap<>();
        t3.put("id", "tpl-luxury-villa");
        t3.put("name", "Luxury 3-Story Villa");
        t3.put("description", "Multi-floor villa with curved staircases, garden balcony, and master suites.");
        t3.put("floors", 3);
        t3.put("area", "240 m²");
        templates.add(t3);

        return ResponseEntity.ok(templates);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePlan(@RequestBody Map<String, Object> planData) {
        Home home = sweetHomeService.createHomeFromData(planData);
        Map<String, Object> stats = new HashMap<>();
        stats.put("wallsCount", home.getWalls().size());
        stats.put("furnitureCount", home.getFurniture().size());
        stats.put("valid", true);
        return ResponseEntity.ok(stats);
    }
}
