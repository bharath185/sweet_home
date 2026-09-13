package com.eteks.sweethome3d.spring.controller;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.spring.entity.PlanRevisionEntity;
import com.eteks.sweethome3d.spring.service.PlanPersistenceService;
import com.eteks.sweethome3d.spring.service.SweetHomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/plan")
@CrossOrigin(origins = "*")
public class PlanController {

    @Autowired
    private SweetHomeService sweetHomeService;

    @Autowired
    private PlanPersistenceService planPersistenceService;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> savePlan(
            @RequestBody Map<String, Object> planData,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String description
    ) {
        Map<String, Object> response = planPersistenceService.savePlan(planData, author, description);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPlans() {
        return ResponseEntity.ok(planPersistenceService.getAllPlans());
    }

    @GetMapping("/{planId}")
    public ResponseEntity<Map<String, Object>> getPlan(@PathVariable String planId) {
        Map<String, Object> plan = planPersistenceService.getPlan(planId);
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        return ResponseEntity.ok(planPersistenceService.getTemplates());
    }

    @GetMapping("/{planId}/revisions")
    public ResponseEntity<List<PlanRevisionEntity>> getPlanRevisions(@PathVariable String planId) {
        return ResponseEntity.ok(planPersistenceService.getRevisions(planId));
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
