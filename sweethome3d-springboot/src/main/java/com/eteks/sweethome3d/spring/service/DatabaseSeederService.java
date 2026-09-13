package com.eteks.sweethome3d.spring.service;

import com.eteks.sweethome3d.spring.entity.CatalogItemEntity;
import com.eteks.sweethome3d.spring.entity.PlanEntity;
import com.eteks.sweethome3d.spring.entity.UserEntity;
import com.eteks.sweethome3d.spring.repository.CatalogItemRepository;
import com.eteks.sweethome3d.spring.repository.PlanRepository;
import com.eteks.sweethome3d.spring.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DatabaseSeederService implements CommandLineRunner {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private CatalogItemRepository catalogItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${sweethome.database.autoseed:true}")
    private boolean autoSeed;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        if (!autoSeed) return;

        // 1. Seed Users
        if (userRepository.count() == 0) {
            System.out.println("Seeding default users into PostgreSQL...");
            userRepository.save(new UserEntity("u1", "Admin Superuser", "admin@sweethome3d.io", "ADMIN", true, "All Projects"));
            userRepository.save(new UserEntity("u2", "Interior Architect", "designer@sweethome3d.io", "DESIGNER", true, "Modern 2-Bedroom Suite"));
            userRepository.save(new UserEntity("u3", "Sarah Jenkins (Client)", "client.sarah@gmail.com", "CLIENT", true, "Modern 2-Bedroom Suite"));
            userRepository.save(new UserEntity("u4", "David Miller (Client)", "david.m@yahoo.com", "CLIENT", false, "Villa Floor Plan"));
            userRepository.save(new UserEntity("u5", "Emma Watson (Client)", "emma.w@outlook.com", "CLIENT", true, "Penthouse Studio"));
        }

        // 2. Seed Furniture Catalog
        if (catalogItemRepository.count() == 0) {
            System.out.println("Seeding 3D furniture catalog into PostgreSQL...");
            seedCatalog();
        }

        // 3. Seed Default Architectural Templates & Suite
        if (planRepository.count() == 0) {
            System.out.println("Seeding initial architectural plans & templates into PostgreSQL...");
            seedTemplates();
        }
    }

    private void seedCatalog() {
        List<CatalogItemEntity> items = new ArrayList<>();

        items.add(createItem("sofa", "Corner Sofa", "Living", 220, 90, 85, "/models/sofa.obj", "/models/sofa.png", "floor", "#38bdf8"));
        items.add(createItem("armchair", "Armchair", "Living", 85, 85, 80, "/models/armchair.obj", "/models/armchair.png", "floor", "#64748b"));
        items.add(createItem("roundTable", "Round Table", "Living", 100, 100, 75, "/models/roundTable.obj", "/models/roundTable.png", "floor", "#78350f"));
        items.add(createItem("chair", "Dining Chair", "Living", 45, 45, 90, "/models/chair.obj", "/models/chair.png", "floor", "#475569"));
        items.add(createItem("bed140x190", "Double Bed", "Bedroom", 150, 200, 90, "/models/bed140x190.obj", "/models/bed140x190.png", "floor", "#e2e8f0"));
        items.add(createItem("wardrobe", "Wardrobe", "Bedroom", 120, 60, 200, "/models/wardrobe.obj", "/models/wardrobe.png", "floor", "#475569"));
        items.add(createItem("kitchenCabinet", "Kitchen Cabinet", "Kitchen", 60, 60, 85, "/models/kitchenCabinet.obj", "/models/kitchenCabinet.png", "floor", "#334155"));
        items.add(createItem("cooker", "Stove / Cooker", "Kitchen", 60, 60, 85, "/models/cooker.obj", "/models/cooker.png", "floor", "#1e293b"));
        items.add(createItem("bath", "Bathtub", "Bathroom", 170, 75, 55, "/models/bath.obj", "/models/bath.png", "floor", "#f8fafc"));
        items.add(createItem("door", "Standard Door", "Doors & Windows", 85, 10, 205, "/models/door.obj", "/models/door.png", "floor", "#94a3b8"));
        items.add(createItem("window85x123", "Window", "Doors & Windows", 85, 15, 123, "/models/window85x123.obj", "/models/window85x123.png", "wall", "#f8fafc"));
        items.add(createItem("pendantLamp", "Ceiling Pendant Lamp", "Lighting", 40, 40, 60, "procedural:lamp:{\"type\":\"pendant_dome\",\"shadeWidth\":40,\"shadeHeight\":25,\"totalHeight\":60}", "/models/pendantLamp.png", "ceiling", "#38bdf8"));
        items.add(createItem("ceilingFan", "Ceiling Fan with Light", "Lighting", 120, 120, 40, "procedural:lamp:{\"type\":\"ceiling_fan\",\"shadeWidth\":120,\"shadeHeight\":30,\"totalHeight\":40}", "/models/pendantLamp.png", "ceiling", "#334155"));
        items.add(createItem("chandelier", "Luxury Chandelier", "Lighting", 80, 80, 75, "procedural:lamp:{\"type\":\"chandelier\",\"shadeWidth\":75,\"shadeHeight\":60,\"totalHeight\":75}", "/models/pendantLamp.png", "ceiling", "#eab308"));
        items.add(createItem("tableLamp", "Desk Lamp", "Lighting", 30, 30, 45, "procedural:lamp:{\"type\":\"table_lamp\",\"shadeWidth\":25,\"shadeHeight\":20,\"totalHeight\":45}", "/models/pendantLamp.png", "tabletop", "#fef08a"));
        items.add(createItem("floatingShelf", "Floating Wall Shelf", "Shelves & Storage", 100, 25, 20, "procedural:shelf:{\"brackets\":true,\"material\":\"wood\"}", "/models/wardrobe.png", "wall", "#78350f"));

        catalogItemRepository.saveAll(items);
    }

    private CatalogItemEntity createItem(String id, String name, String category, float w, float d, float h, String model, String icon, String placementType, String color) {
        CatalogItemEntity item = new CatalogItemEntity();
        item.setId(id);
        item.setName(name);
        item.setCategory(category);
        item.setWidth(w);
        item.setDepth(d);
        item.setHeight(h);
        item.setModel(model);
        item.setIcon(icon);
        item.setPlacementType(placementType);
        item.setDefaultColor(color);
        item.setIsCustom(false);
        item.setCreatedAt(LocalDateTime.now());
        return item;
    }

    private void seedTemplates() throws Exception {
        // Modern 2-Bedroom Suite
        Map<String, Object> suiteData = new HashMap<>();
        suiteData.put("id", "modern-suite-default");
        suiteData.put("name", "Modern 2-Bedroom Suite");
        suiteData.put("clientName", "Sarah Jenkins");
        suiteData.put("designerName", "Interior Architect");
        suiteData.put("unit", "cm");
        suiteData.put("walls", new ArrayList<>());
        suiteData.put("rooms", new ArrayList<>());
        suiteData.put("furniture", new ArrayList<>());
        suiteData.put("floors", Arrays.asList(
                createFloor(0, "Ground Floor", 250, 0),
                createFloor(1, "1st Floor", 250, 250)
        ));

        PlanEntity suiteEntity = new PlanEntity("modern-suite-default", "Modern 2-Bedroom Suite", objectMapper.writeValueAsString(suiteData), false);
        suiteEntity.setClientName("Sarah Jenkins");
        suiteEntity.setDesignerName("Interior Architect");
        suiteEntity.setTotalArea("85 m²");
        suiteEntity.setFloorsCount(2);
        suiteEntity.setDescription("Spacious open living room with en-suite bathroom and master bedroom.");
        planRepository.save(suiteEntity);

        // Template 1
        PlanEntity t1 = new PlanEntity("tpl-modern-suite", "Modern 2-Bedroom Suite", objectMapper.writeValueAsString(suiteData), true);
        t1.setDescription("Spacious open living room with en-suite bathroom and master bedroom.");
        t1.setTotalArea("85 m²");
        t1.setFloorsCount(2);
        planRepository.save(t1);

        // Template 2
        PlanEntity t2 = new PlanEntity("tpl-studio-loft", "Urban Studio Loft", objectMapper.writeValueAsString(suiteData), true);
        t2.setDescription("Compact minimalist studio apartment design with kitchen island.");
        t2.setTotalArea("45 m²");
        t2.setFloorsCount(1);
        planRepository.save(t2);

        // Template 3
        PlanEntity t3 = new PlanEntity("tpl-luxury-villa", "Luxury 3-Story Villa", objectMapper.writeValueAsString(suiteData), true);
        t3.setDescription("Multi-floor villa with curved staircases, garden balcony, and master suites.");
        t3.setTotalArea("240 m²");
        t3.setFloorsCount(3);
        planRepository.save(t3);
    }

    private Map<String, Object> createFloor(int level, String name, int height, int elevation) {
        Map<String, Object> fl = new HashMap<>();
        fl.put("level", level);
        fl.put("name", name);
        fl.put("height", height);
        fl.put("elevation", elevation);
        return fl;
    }
}
