package com.eteks.sweethome3d.spring.repository;

import com.eteks.sweethome3d.spring.entity.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<PlanEntity, String> {
    List<PlanEntity> findByIsTemplateTrue();
    List<PlanEntity> findByIsTemplateFalseOrderByUpdatedAtDesc();
    List<PlanEntity> findByNameContainingIgnoreCase(String name);
}
