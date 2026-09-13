package com.eteks.sweethome3d.spring.repository;

import com.eteks.sweethome3d.spring.entity.CatalogItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogItemRepository extends JpaRepository<CatalogItemEntity, String> {
    List<CatalogItemEntity> findByCategory(String category);
    List<CatalogItemEntity> findAllByOrderByCreatedAtDesc();
}
