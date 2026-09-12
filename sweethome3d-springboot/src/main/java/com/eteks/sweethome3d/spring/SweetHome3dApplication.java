package com.eteks.sweethome3d.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SweetHome3dApplication {

    public static void main(String[] args) {
        // Run Sweet Home 3D in headless mode on server
        System.setProperty("java.awt.headless", "true");
        System.setProperty("com.eteks.sweethome3d.noSingleInstance", "true");
        
        SpringApplication.run(SweetHome3dApplication.class, args);
    }
}
