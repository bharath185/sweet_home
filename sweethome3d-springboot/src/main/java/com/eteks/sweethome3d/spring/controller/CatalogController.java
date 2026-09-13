package com.eteks.sweethome3d.spring.controller;

import com.eteks.sweethome3d.spring.entity.CatalogItemEntity;
import com.eteks.sweethome3d.spring.repository.CatalogItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "*")
public class CatalogController {

    @Autowired
    private CatalogItemRepository catalogItemRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<CatalogItemEntity> all = catalogItemRepository.findAll();
        Set<String> categories = new LinkedHashSet<>();
        categories.add("All");
        for (CatalogItemEntity item : all) {
            if (item.getCategory() != null) {
                categories.add(item.getCategory());
            }
        }
        return ResponseEntity.ok(new ArrayList<>(categories));
    }

    @GetMapping("/furniture")
    public ResponseEntity<List<CatalogItemEntity>> getFurnitureCatalog() {
        return ResponseEntity.ok(catalogItemRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/furniture")
    public ResponseEntity<CatalogItemEntity> addFurnitureItem(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.getOrDefault("id", "custom_" + UUID.randomUUID().toString().substring(0, 8));
        String name = (String) payload.getOrDefault("name", "Custom Item");
        String category = (String) payload.getOrDefault("category", "Living");
        
        float w = payload.get("width") != null ? Float.parseFloat(payload.get("width").toString()) : 50f;
        float d = payload.get("depth") != null ? Float.parseFloat(payload.get("depth").toString()) : 50f;
        float h = payload.get("height") != null ? Float.parseFloat(payload.get("height").toString()) : 50f;

        CatalogItemEntity item = new CatalogItemEntity();
        item.setId(id);
        item.setName(name);
        item.setCategory(category);
        item.setWidth(w);
        item.setDepth(d);
        item.setHeight(h);
        item.setModel((String) payload.get("model"));
        item.setIcon((String) payload.get("icon"));
        item.setPlacementType((String) payload.getOrDefault("placementType", "floor"));
        item.setDefaultColor((String) payload.get("defaultColor"));
        item.setMaterialCategory((String) payload.get("materialCategory"));
        item.setMaterialFinish((String) payload.get("materialFinish"));
        if (payload.get("roughness") != null) item.setRoughness(Float.parseFloat(payload.get("roughness").toString()));
        if (payload.get("metalness") != null) item.setMetalness(Float.parseFloat(payload.get("metalness").toString()));
        if (payload.get("opacity") != null) item.setOpacity(Float.parseFloat(payload.get("opacity").toString()));
        item.setIsCustom(true);
        item.setCreatedAt(LocalDateTime.now());

        CatalogItemEntity saved = catalogItemRepository.save(item);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/furniture/{id}")
    public ResponseEntity<Map<String, Object>> deleteFurnitureItem(@PathVariable String id) {
        boolean exists = catalogItemRepository.existsById(id);
        if (exists) {
            catalogItemRepository.deleteById(id);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("status", exists ? "success" : "not_found");
        return ResponseEntity.ok(res);
    }
}
