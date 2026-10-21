package com.subsonic.purchaseservice;

import com.subsonic.purchaseservice.config.DotenvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PurchaseServiceApplication {
    private static final Logger log = LoggerFactory.getLogger(PurchaseServiceApplication.class);

    public static void main(String[] args) {
        // Carga variables de entorno desde archivo .env antes del arranque del contexto Spring
        DotenvConfig.loadDotenv();
        log.info("Iniciando Microservicio de Compras (Checkout) - Subsonic Festival...");
        SpringApplication.run(PurchaseServiceApplication.class, args);
        log.info("Microservicio de Compras iniciado y listo para recibir peticiones transaccionales.");
    }
}

