package com.eteks.sweethome3d.spring.repository;

import com.eteks.sweethome3d.spring.entity.PlanRevisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRevisionRepository extends JpaRepository<PlanRevisionEntity, Long> {
    List<PlanRevisionEntity> findByPlanIdOrderByRevisionNumberDesc(String planId);
    Long countByPlanId(String planId);
}
