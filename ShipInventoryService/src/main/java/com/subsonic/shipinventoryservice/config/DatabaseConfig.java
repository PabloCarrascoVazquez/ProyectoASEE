package com.subsonic.shipinventoryservice.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
public class DatabaseConfig {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${db.engine:sqlite}")
    private String dbEngine;

    @Value("${sqlite.db.path:shipinventory.db}")
    private String sqliteDbPath;

    @Value("${db.host:127.0.0.1}")
    private String dbHost;

    @Value("${db.port:3306}")
    private int dbPort;

    @Value("${db.name:shipinventory_db}")
    private String dbName;

    @Value("${db.user:root}")
    private String dbUser;

    @Value("${db.password:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String engine = (dbEngine != null ? dbEngine.trim().toLowerCase() : "sqlite");
        HikariConfig config = new HikariConfig();

        if ("mysql".equals(engine)) {
            log.info("Configurando DataSource MySQL hacia {}:{}/{}", dbHost, dbPort, dbName);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setJdbcUrl("jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName +
                    "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true");
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setPoolName("MySQL-ShipInventoryPool");
        } else {
            log.info("Configurando DataSource SQLite hacia {}", sqliteDbPath);
            config.setDriverClassName("org.sqlite.JDBC");
            config.setJdbcUrl("jdbc:sqlite:" + sqliteDbPath);
            config.setMaximumPoolSize(5);
            config.setPoolName("SQLite-ShipInventoryPool");
            config.setConnectionInitSql("PRAGMA foreign_keys = ON;");
        }

        HikariDataSource ds = new HikariDataSource(config);
        initializeSchema(ds, engine);
        return ds;
    }

    private void initializeSchema(DataSource ds, String engine) {
        try (Connection conn = ds.getConnection();
             Statement stmt = conn.createStatement()) {

            if ("mysql".equals(engine)) {
                log.info("Inicializando/verificando tablas en base de datos MySQL...");

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS stock_productos (
                        id_producto VARCHAR(36) PRIMARY KEY,
                        nombre_producto VARCHAR(200) NOT NULL,
                        variante VARCHAR(100),
                        unidades_disponibles INT NOT NULL DEFAULT 0,
                        unidades_bloqueadas INT NOT NULL DEFAULT 0,
                        precio DECIMAL(10, 2) NOT NULL,
                        ubicacion_almacen VARCHAR(200),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_nombre (nombre_producto)
                    ) ENGINE=InnoDB;
                """);

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS envios (
                        id_envio VARCHAR(36) PRIMARY KEY,
                        id_pedido VARCHAR(36) NOT NULL,
                        estado_envio VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
                        empresa_transporte VARCHAR(100),
                        tracking_number VARCHAR(100),
                        direccion_entrega VARCHAR(500),
                        notas_incidencia TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_pedido (id_pedido),
                        INDEX idx_estado (estado_envio)
                    ) ENGINE=InnoDB;
                """);

            } else {
                log.info("Inicializando/verificando tablas en base de datos SQLite...");
                stmt.execute("PRAGMA foreign_keys = ON;");

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS stock_productos (
                        id_producto VARCHAR(36) PRIMARY KEY,
                        nombre_producto VARCHAR(200) NOT NULL,
                        variante VARCHAR(100),
                        unidades_disponibles INT NOT NULL DEFAULT 0,
                        unidades_bloqueadas INT NOT NULL DEFAULT 0,
                        precio DECIMAL(10, 2) NOT NULL,
                        ubicacion_almacen VARCHAR(200),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """);

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS envios (
                        id_envio VARCHAR(36) PRIMARY KEY,
                        id_pedido VARCHAR(36) NOT NULL,
                        estado_envio VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
                        empresa_transporte VARCHAR(100),
                        tracking_number VARCHAR(100),
                        direccion_entrega VARCHAR(500),
                        notas_incidencia TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """);

                // Datos de ejemplo para stock (solo si la tabla está vacía)
                Integer count = null;
                try {
                    count = conn.createStatement().executeQuery(
                        "SELECT COUNT(*) FROM stock_productos").getInt(1);
                } catch (Exception ignored) {}

                if (count != null && count == 0) {
                    stmt.execute("""
                        INSERT OR IGNORE INTO stock_productos
                            (id_producto, nombre_producto, variante, unidades_disponibles, unidades_bloqueadas, precio, ubicacion_almacen)
                        VALUES
                            ('prod-001', 'Camiseta Oficial Subsonic', 'Talla L - Negra', 150, 0, 25.50, 'Pasillo B - Estante 4'),
                            ('prod-002', 'Gorra Subsonic 2026', 'Talla única', 80, 0, 18.00, 'Pasillo A - Estante 1'),
                            ('prod-003', 'Tote Bag Subsonic', 'Azul', 200, 0, 12.00, 'Pasillo C - Estante 2');
                    """);
                }
            }

            log.info("Esquema de base de datos verificado e inicializado correctamente.");
        } catch (Exception e) {
            log.error("Error al inicializar las tablas de la base de datos: {}", e.getMessage(), e);
        }
    }

    @Bean
    @Primary
    public JdbcTemplate appJdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
