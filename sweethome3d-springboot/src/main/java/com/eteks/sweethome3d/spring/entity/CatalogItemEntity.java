package com.eteks.sweethome3d.spring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "catalog_items")
public class CatalogItemEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 128)
    private String category;

    @Column(nullable = false)
    private Float width;

    @Column(nullable = false)
    private Float depth;

    @Column(nullable = false)
    private Float height;

    @Column(columnDefinition = "TEXT")
    private String model;

    @Column(length = 512)
    private String icon;

    @Column(name = "placement_type", length = 64)
    private String placementType = "floor";

    @Column(name = "default_color", length = 32)
    private String defaultColor;

    @Column(name = "material_category", length = 64)
    private String materialCategory;

    @Column(name = "material_finish", length = 64)
    private String materialFinish;

    private Float roughness = 0.4f;
    private Float metalness = 0.15f;
    private Float opacity = 1.0f;

    @Column(name = "light_intensity")
    private Float lightIntensity;

    @Column(name = "light_color", length = 32)
    private String lightColor;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CatalogItemEntity() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Float getWidth() { return width; }
    public void setWidth(Float width) { this.width = width; }

    public Float getDepth() { return depth; }
    public void setDepth(Float depth) { this.depth = depth; }

    public Float getHeight() { return height; }
    public void setHeight(Float height) { this.height = height; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getPlacementType() { return placementType; }
    public void setPlacementType(String placementType) { this.placementType = placementType; }

    public String getDefaultColor() { return defaultColor; }
    public void setDefaultColor(String defaultColor) { this.defaultColor = defaultColor; }

    public String getMaterialCategory() { return materialCategory; }
    public void setMaterialCategory(String materialCategory) { this.materialCategory = materialCategory; }

    public String getMaterialFinish() { return materialFinish; }
    public void setMaterialFinish(String materialFinish) { this.materialFinish = materialFinish; }

    public Float getRoughness() { return roughness; }
    public void setRoughness(Float roughness) { this.roughness = roughness; }

    public Float getMetalness() { return metalness; }
    public void setMetalness(Float metalness) { this.metalness = metalness; }

    public Float getOpacity() { return opacity; }
    public void setOpacity(Float opacity) { this.opacity = opacity; }

    public Float getLightIntensity() { return lightIntensity; }
    public void setLightIntensity(Float lightIntensity) { this.lightIntensity = lightIntensity; }

    public String getLightColor() { return lightColor; }
    public void setLightColor(String lightColor) { this.lightColor = lightColor; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
