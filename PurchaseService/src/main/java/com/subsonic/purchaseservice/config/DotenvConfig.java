package com.subsonic.purchaseservice.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class DotenvConfig {
    private static final Logger log = LoggerFactory.getLogger(DotenvConfig.class);

    static {
        loadDotenv();
    }

    public static void loadDotenv() {
        try {
            // Busca .env en el directorio actual o subiendo un nivel si es necesario
            Dotenv dotenv = null;
            File envFile = new File(".env");
            if (envFile.exists()) {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            } else {
                File subDirEnv = new File("PurchaseService/.env");
                if (subDirEnv.exists()) {
                    dotenv = Dotenv.configure().directory("PurchaseService").ignoreIfMissing().load();
                } else {
                    dotenv = Dotenv.configure().ignoreIfMissing().load();
                }
            }

            if (dotenv != null) {
                dotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
                log.info("Variables de entorno cargadas exitosamente desde archivo .env");
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el archivo .env ({}), se usarán variables del sistema y application.properties", e.getMessage());
        }
    }
}

