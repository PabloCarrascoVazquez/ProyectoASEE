package com.subsonic.shipinventoryservice.config;

import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.dao.postgres.EnviosDaoPostgres;
import com.subsonic.shipinventoryservice.dao.postgres.InventarioDaoPostgres;
import com.subsonic.shipinventoryservice.dao.sqlite.EnviosDaoSqlite;
import com.subsonic.shipinventoryservice.dao.sqlite.InventarioDaoSqlite;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DaoConfig {

    // --- PostgreSQL ---

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "postgres")
    public InventarioDao inventarioDaoPostgres(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new InventarioDaoPostgres(jdbcTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "postgres")
    public EnviosDao enviosDaoPostgres(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new EnviosDaoPostgres(jdbcTemplate);
    }

    // --- SQLite (por defecto) ---

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "sqlite", matchIfMissing = true)
    public InventarioDao inventarioDaoSqlite(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new InventarioDaoSqlite(jdbcTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "sqlite", matchIfMissing = true)
    public EnviosDao enviosDaoSqlite(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new EnviosDaoSqlite(jdbcTemplate);
    }
}
