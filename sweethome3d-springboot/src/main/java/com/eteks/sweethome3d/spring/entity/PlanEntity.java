package com.eteks.sweethome3d.spring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "plans")
public class PlanEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "client_name", length = 255)
    private String clientName;

    @Column(name = "designer_name", length = 255)
    private String designerName;

    @Column(name = "plan_data_json", columnDefinition = "TEXT")
    private String planDataJson;

    @Column(name = "thumbnail_data", columnDefinition = "TEXT")
    private String thumbnailData;

    @Column(name = "total_area", length = 64)
    private String totalArea;

    @Column(name = "floors_count")
    private Integer floorsCount = 1;

    @Column(name = "is_template", nullable = false)
    private Boolean isTemplate = false;

    @Column(name = "description", length = 512)
    private String description;

    @Version
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public PlanEntity() {}

    public PlanEntity(String id, String name, String planDataJson, boolean isTemplate) {
        this.id = id;
        this.name = name;
        this.planDataJson = planDataJson;
        this.isTemplate = isTemplate;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getDesignerName() { return designerName; }
    public void setDesignerName(String designerName) { this.designerName = designerName; }

    public String getPlanDataJson() { return planDataJson; }
    public void setPlanDataJson(String planDataJson) { this.planDataJson = planDataJson; }

    public String getThumbnailData() { return thumbnailData; }
    public void setThumbnailData(String thumbnailData) { this.thumbnailData = thumbnailData; }

    public String getTotalArea() { return totalArea; }
    public void setTotalArea(String totalArea) { this.totalArea = totalArea; }

    public Integer getFloorsCount() { return floorsCount; }
    public void setFloorsCount(Integer floorsCount) { this.floorsCount = floorsCount; }

    public Boolean getIsTemplate() { return isTemplate; }
    public void setIsTemplate(Boolean isTemplate) { this.isTemplate = isTemplate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
