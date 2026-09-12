package com.eteks.sweethome3d.spring.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "*")
public class CatalogController {

    private final List<Map<String, Object>> catalog = new CopyOnWriteArrayList<>();

    public CatalogController() {
        catalog.add(createItem("sofa", "Corner Sofa", "Living", "/models/sofa.obj", "/models/sofa.png", 220, 90, 85));
        catalog.add(createItem("armchair", "Armchair", "Living", "/models/armchair.obj", "/models/armchair.png", 85, 85, 80));
        catalog.add(createItem("roundTable", "Round Table", "Living", "/models/roundTable.obj", "/models/roundTable.png", 100, 100, 75));
        catalog.add(createItem("chair", "Dining Chair", "Living", "/models/chair.obj", "/models/chair.png", 45, 45, 90));
        catalog.add(createItem("bed140x190", "Double Bed", "Bedroom", "/models/bed140x190.obj", "/models/bed140x190.png", 150, 200, 90));
        catalog.add(createItem("wardrobe", "Wardrobe", "Bedroom", "/models/wardrobe.obj", "/models/wardrobe.png", 120, 60, 200));
        catalog.add(createItem("kitchenCabinet", "Kitchen Cabinet", "Kitchen", "/models/kitchenCabinet.obj", "/models/kitchenCabinet.png", 60, 60, 85));
        catalog.add(createItem("cooker", "Stove / Cooker", "Kitchen", "/models/cooker.obj", "/models/cooker.png", 60, 60, 85));
        catalog.add(createItem("bath", "Bathtub", "Bathroom", "/models/bath.obj", "/models/bath.png", 170, 75, 55));
        catalog.add(createItem("door", "Standard Door", "Doors & Windows", "/models/door.obj", "/models/door.png", 85, 10, 205));
        catalog.add(createItem("window85x123", "Window", "Doors & Windows", "/models/window85x123.obj", "/models/window85x123.png", 85, 15, 123));
        catalog.add(createItem("pendantLamp", "Ceiling Lamp", "Lighting", "/models/pendantLamp.obj", "/models/pendantLamp.png", 40, 40, 60));
        catalog.add(createItem("floorUplight", "Floor Lamp", "Lighting", "/models/floorUplight.obj", "/models/floorUplight.png", 35, 35, 175));
        catalog.add(createItem("staircase", "Straight Staircase", "Stairs & Structural", "/models/staircase.obj", "/models/staircase.png", 90, 260, 250));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        Set<String> categories = new LinkedHashSet<>();
        categories.add("All");
        for (Map<String, Object> item : catalog) {
            Object cat = item.get("category");
            if (cat != null) {
                categories.add(cat.toString());
            }
        }
        return ResponseEntity.ok(new ArrayList<>(categories));
    }

    @GetMapping("/furniture")
    public ResponseEntity<List<Map<String, Object>>> getFurnitureCatalog() {
        return ResponseEntity.ok(catalog);
    }

    @PostMapping("/furniture")
    public ResponseEntity<Map<String, Object>> addFurnitureItem(@RequestBody Map<String, Object> newItem) {
        String id = newItem.getOrDefault("id", "item_" + UUID.randomUUID().toString().substring(0, 8)).toString();
        newItem.put("id", id);
        
        // Remove existing item with same id if updating
        catalog.removeIf(item -> id.equals(item.get("id")));
        catalog.add(0, newItem); // add at beginning

        return ResponseEntity.ok(newItem);
    }

    @DeleteMapping("/furniture/{id}")
    public ResponseEntity<Map<String, Object>> deleteFurnitureItem(@PathVariable String id) {
        boolean removed = catalog.removeIf(item -> id.equals(item.get("id")));
        Map<String, Object> res = new HashMap<>();
        res.put("status", removed ? "success" : "not_found");
        return ResponseEntity.ok(res);
    }

    private Map<String, Object> createItem(String id, String name, String category, String model, String icon, float w, float d, float h) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("name", name);
        item.put("category", category);
        item.put("model", model);
        item.put("icon", icon);
        item.put("width", w);
        item.put("depth", d);
        item.put("height", h);
        return item;
    }
}
