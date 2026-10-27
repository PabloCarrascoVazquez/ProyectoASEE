package com.subsonic.shipinventoryservice;

import com.subsonic.shipinventoryservice.config.DotenvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShipInventoryServiceApplication {
    private static final Logger log = LoggerFactory.getLogger(ShipInventoryServiceApplication.class);

    public static void main(String[] args) {
        // Carga variables de entorno desde archivo .env antes del arranque del contexto Spring
        DotenvConfig.loadDotenv();
        log.info("Iniciando Microservicio de Inventario y Envíos - Subsonic Festival...");
        SpringApplication.run(ShipInventoryServiceApplication.class, args);
        log.info("Microservicio de Inventario y Envíos iniciado y listo para recibir peticiones.");
    }
}
