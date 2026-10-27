package com.subsonic.shipinventoryservice.config;

import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.dao.mysql.EnviosDaoMySql;
import com.subsonic.shipinventoryservice.dao.mysql.InventarioDaoMySql;
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

    // --- MySQL ---

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "mysql")
    public InventarioDao inventarioDaoMySql(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new InventarioDaoMySql(jdbcTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "mysql")
    public EnviosDao enviosDaoMySql(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new EnviosDaoMySql(jdbcTemplate);
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
