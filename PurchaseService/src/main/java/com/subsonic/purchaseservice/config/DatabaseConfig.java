package com.subsonic.purchaseservice.config;

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

    @Value("${sqlite.db.path:purchases.db}")
    private String sqliteDbPath;

    @Value("${db.host:127.0.0.1}")
    private String dbHost;

    @Value("${db.port:3306}")
    private int dbPort;

    @Value("${db.name:purchases_db}")
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

        if ("postgres".equals(engine) || "postgresql".equals(engine)) {
            log.info("Configurando DataSource PostgreSQL hacia {}:{}/{}", dbHost, dbPort, dbName);
            config.setDriverClassName("org.postgresql.Driver");
            config.setJdbcUrl("jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setPoolName("Postgres-PurchasesPool");
        } else {
            log.info("Configurando DataSource SQLite hacia {}", sqliteDbPath);
            config.setDriverClassName("org.sqlite.JDBC");
            config.setJdbcUrl("jdbc:sqlite:" + sqliteDbPath);
            config.setMaximumPoolSize(5);
            config.setPoolName("SQLite-PurchasesPool");
            config.setConnectionInitSql("PRAGMA foreign_keys = ON;");
        }

        HikariDataSource ds = new HikariDataSource(config);
        initializeSchema(ds, engine);
        return ds;
    }

    private void initializeSchema(DataSource ds, String engine) {
        try (Connection conn = ds.getConnection();
             Statement stmt = conn.createStatement()) {

            if ("postgres".equals(engine) || "postgresql".equals(engine)) {
                log.info("Inicializando/verificando tablas en base de datos PostgreSQL...");
                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS transactions (
                        id VARCHAR(100) PRIMARY KEY,
                        user_id VARCHAR(100) NOT NULL,
                        type VARCHAR(20) NOT NULL,
                        total_amount DECIMAL(10, 2) NOT NULL,
                        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
                        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                        reservation_expires_at TIMESTAMP NOT NULL,
                        payment_method VARCHAR(20) NULL,
                        gateway_token VARCHAR(255) NULL,
                        gateway_transaction_id VARCHAR(255) NULL,
                        receipt_url VARCHAR(500) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """);

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS transaction_items (
                        id VARCHAR(100) PRIMARY KEY,
                        transaction_id VARCHAR(100) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
                        item_type VARCHAR(20) NOT NULL,
                        item_id VARCHAR(100) NOT NULL,
                        ticket_type VARCHAR(20) NULL,
                        quantity INT NOT NULL DEFAULT 1,
                        unit_price DECIMAL(10, 2) NOT NULL,
                        subtotal DECIMAL(10, 2) NOT NULL
                    );
                """);

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS outbox_events (
                        id VARCHAR(100) PRIMARY KEY,
                        aggregate_type VARCHAR(50) NOT NULL DEFAULT 'TRANSACTION',
                        aggregate_id VARCHAR(100) NOT NULL,
                        event_type VARCHAR(50) NOT NULL,
                        payload TEXT NOT NULL,
                        published BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """);
            } else {
                log.info("Inicializando/verificando tablas en base de datos SQLite...");
                stmt.execute("PRAGMA foreign_keys = ON;");

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS transactions (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        type VARCHAR(20) NOT NULL,
                        total_amount DECIMAL(10, 2) NOT NULL,
                        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
                        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                        reservation_expires_at DATETIME NOT NULL,
                        payment_method VARCHAR(20) NULL,
                        gateway_token VARCHAR(255) NULL,
                        gateway_transaction_id VARCHAR(255) NULL,
                        receipt_url VARCHAR(500) NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """);

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS transaction_items (
                        id VARCHAR(36) PRIMARY KEY,
                        transaction_id VARCHAR(36) NOT NULL,
                        item_type VARCHAR(20) NOT NULL,
                        item_id VARCHAR(36) NOT NULL,
                        ticket_type VARCHAR(20) NULL,
                        quantity INT NOT NULL DEFAULT 1,
                        unit_price DECIMAL(10, 2) NOT NULL,
                        subtotal DECIMAL(10, 2) NOT NULL,
                        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
                    );
                """);

                stmt.execute("""
                    CREATE TABLE IF NOT EXISTS outbox_events (
                        id VARCHAR(36) PRIMARY KEY,
                        aggregate_type VARCHAR(50) NOT NULL DEFAULT 'TRANSACTION',
                        aggregate_id VARCHAR(36) NOT NULL,
                        event_type VARCHAR(50) NOT NULL,
                        payload TEXT NOT NULL,
                        published BOOLEAN NOT NULL DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """);
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

