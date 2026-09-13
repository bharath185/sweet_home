package com.eteks.sweethome3d.spring.service;

import com.eteks.sweethome3d.spring.entity.PlanEntity;
import com.eteks.sweethome3d.spring.entity.PlanRevisionEntity;
import com.eteks.sweethome3d.spring.repository.PlanRepository;
import com.eteks.sweethome3d.spring.repository.PlanRevisionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PlanPersistenceService {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private PlanRevisionRepository planRevisionRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Map<String, Object> savePlan(Map<String, Object> planData, String authorName, String changeDesc) {
        String planId = (String) planData.get("id");
        if (planId == null || planId.trim().isEmpty()) {
            planId = UUID.randomUUID().toString().substring(0, 8);
            planData.put("id", planId);
        }

        String planName = (String) planData.getOrDefault("name", "Untitled Plan");
        String clientName = (String) planData.get("clientName");
        String designerName = (String) planData.get("designerName");
        Boolean isTemplate = Boolean.TRUE.equals(planData.get("isTemplate"));

        try {
            String jsonContent = objectMapper.writeValueAsString(planData);
            
            Optional<PlanEntity> existingOpt = planRepository.findById(planId);
            PlanEntity entity;
            if (existingOpt.isPresent()) {
                entity = existingOpt.get();
                entity.setName(planName);
                if (clientName != null) entity.setClientName(clientName);
                if (designerName != null) entity.setDesignerName(designerName);
                entity.setPlanDataJson(jsonContent);
                entity.setIsTemplate(isTemplate);
                entity.setUpdatedAt(LocalDateTime.now());
            } else {
                entity = new PlanEntity(planId, planName, jsonContent, isTemplate);
                entity.setClientName(clientName);
                entity.setDesignerName(designerName);
            }

            PlanEntity savedEntity = planRepository.save(entity);

            // Record snapshot in PlanRevisionEntity
            long nextRev = planRevisionRepository.countByPlanId(planId) + 1;
            PlanRevisionEntity revision = new PlanRevisionEntity(
                    planId,
                    nextRev,
                    jsonContent,
                    authorName != null ? authorName : "System Auto-Save",
                    changeDesc != null ? changeDesc : "Plan update persisted to PostgreSQL"
            );
            planRevisionRepository.save(revision);

            // Broadcast real-time update via WebSocket topic
            if (messagingTemplate != null) {
                Map<String, Object> wsPayload = new HashMap<>();
                wsPayload.put("type", "PLAN_UPDATED");
                wsPayload.put("planId", planId);
                wsPayload.put("version", savedEntity.getVersion());
                wsPayload.put("timestamp", System.currentTimeMillis());
                messagingTemplate.convertAndSend("/topic/plan/" + planId, wsPayload);
                messagingTemplate.convertAndSend("/topic/plans", wsPayload);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("planId", planId);
            response.put("version", savedEntity.getVersion());
            response.put("updatedAt", savedEntity.getUpdatedAt().toString());
            response.put("shareUrl", "/?mode=customer&planId=" + planId);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to persist plan to PostgreSQL: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlan(String planId) {
        Optional<PlanEntity> opt = planRepository.findById(planId);
        if (opt.isEmpty()) return null;

        PlanEntity entity = opt.get();
        try {
            Map<String, Object> data = objectMapper.readValue(entity.getPlanDataJson(), new TypeReference<Map<String, Object>>() {});
            data.put("id", entity.getId());
            data.put("name", entity.getName());
            data.put("version", entity.getVersion());
            data.put("updatedAt", entity.getUpdatedAt().toString());
            return data;
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("id", entity.getId());
            fallback.put("name", entity.getName());
            return fallback;
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPlans() {
        List<PlanEntity> entities = planRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (PlanEntity entity : entities) {
            try {
                Map<String, Object> data = objectMapper.readValue(entity.getPlanDataJson(), new TypeReference<Map<String, Object>>() {});
                data.put("id", entity.getId());
                data.put("name", entity.getName());
                data.put("version", entity.getVersion());
                data.put("updatedAt", entity.getUpdatedAt().toString());
                result.add(data);
            } catch (Exception e) {
                Map<String, Object> fallback = new HashMap<>();
                fallback.put("id", entity.getId());
                fallback.put("name", entity.getName());
                result.add(fallback);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTemplates() {
        List<PlanEntity> templates = planRepository.findByIsTemplateTrue();
        List<Map<String, Object>> result = new ArrayList<>();
        for (PlanEntity t : templates) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId());
            item.put("name", t.getName());
            item.put("description", t.getDescription() != null ? t.getDescription() : "Architectural Suite Template");
            item.put("floors", t.getFloorsCount());
            item.put("area", t.getTotalArea() != null ? t.getTotalArea() : "85 m²");
            result.add(item);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<PlanRevisionEntity> getRevisions(String planId) {
        return planRevisionRepository.findByPlanIdOrderByRevisionNumberDesc(planId);
    }
}
