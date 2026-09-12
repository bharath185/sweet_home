package com.eteks.sweethome3d.spring.service;

import com.eteks.sweethome3d.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SweetHomeService {

    /**
     * Creates a new Home instance from JSON map data
     */
    public Home createHomeFromData(Map<String, Object> data) {
        Home home = new Home();

        // Parse Walls
        if (data.containsKey("walls")) {
            List<Map<String, Object>> wallsData = (List<Map<String, Object>>) data.get("walls");
            for (Map<String, Object> wMap : wallsData) {
                float x1 = ((Number) wMap.getOrDefault("x1", 0)).floatValue();
                float y1 = ((Number) wMap.getOrDefault("y1", 0)).floatValue();
                float x2 = ((Number) wMap.getOrDefault("x2", 0)).floatValue();
                float y2 = ((Number) wMap.getOrDefault("y2", 0)).floatValue();
                float thickness = ((Number) wMap.getOrDefault("thickness", 15)).floatValue();
                float height = ((Number) wMap.getOrDefault("height", 250)).floatValue();

                Wall wall = new Wall(x1, y1, x2, y2, thickness, height);
                home.addWall(wall);
            }
        }

        // Parse Furniture
        if (data.containsKey("furniture")) {
            List<Map<String, Object>> furnData = (List<Map<String, Object>>) data.get("furniture");
            for (Map<String, Object> fMap : furnData) {
                String name = (String) fMap.getOrDefault("name", "Furniture");
                float x = ((Number) fMap.getOrDefault("x", 0)).floatValue();
                float y = ((Number) fMap.getOrDefault("y", 0)).floatValue();
                float width = ((Number) fMap.getOrDefault("width", 80)).floatValue();
                float depth = ((Number) fMap.getOrDefault("depth", 80)).floatValue();
                float height = ((Number) fMap.getOrDefault("height", 80)).floatValue();
                float elevation = ((Number) fMap.getOrDefault("elevation", 0)).floatValue();
                float angle = ((Number) fMap.getOrDefault("angle", 0)).floatValue() * (float) (Math.PI / 180.0);

                CatalogPieceOfFurniture catPiece = new CatalogPieceOfFurniture(
                        name, null, null, width, depth, height, true, false
                );
                HomePieceOfFurniture piece = new HomePieceOfFurniture(catPiece);
                piece.setX(x);
                piece.setY(y);
                piece.setElevation(elevation);
                piece.setAngle(angle);
                home.addPieceOfFurniture(piece);
            }
        }

        return home;
    }

    /**
     * Converts a Sweet Home 3D Home instance to Web JSON
     */
    public Map<String, Object> convertHomeToData(Home home) {
        Map<String, Object> result = new HashMap<>();

        List<Map<String, Object>> wallsList = new ArrayList<>();
        for (Wall wall : home.getWalls()) {
            Map<String, Object> wMap = new HashMap<>();
            wMap.put("x1", wall.getXStart());
            wMap.put("y1", wall.getYStart());
            wMap.put("x2", wall.getXEnd());
            wMap.put("y2", wall.getYEnd());
            wMap.put("thickness", wall.getThickness());
            wMap.put("height", wall.getHeight());
            wallsList.add(wMap);
        }
        result.put("walls", wallsList);

        List<Map<String, Object>> furnList = new ArrayList<>();
        for (HomePieceOfFurniture piece : home.getFurniture()) {
            Map<String, Object> fMap = new HashMap<>();
            fMap.put("name", piece.getName());
            fMap.put("x", piece.getX());
            fMap.put("y", piece.getY());
            fMap.put("width", piece.getWidth());
            fMap.put("depth", piece.getDepth());
            fMap.put("height", piece.getHeight());
            fMap.put("elevation", piece.getElevation());
            fMap.put("angle", piece.getAngle() * (180.0 / Math.PI));
            furnList.add(fMap);
        }
        result.put("furniture", furnList);

        return result;
    }
}
