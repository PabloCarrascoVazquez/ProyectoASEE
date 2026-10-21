package com.subsonic.purchaseservice.config;

import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.dao.mysql.OutboxDaoMySql;
import com.subsonic.purchaseservice.dao.mysql.PurchaseDaoMySql;
import com.subsonic.purchaseservice.dao.sqlite.OutboxDaoSqlite;
import com.subsonic.purchaseservice.dao.sqlite.PurchaseDaoSqlite;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DaoConfig {

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "mysql")
    public PurchaseDao purchaseDaoMySql(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new PurchaseDaoMySql(jdbcTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "mysql")
    public OutboxDao outboxDaoMySql(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new OutboxDaoMySql(jdbcTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "sqlite", matchIfMissing = true)
    public PurchaseDao purchaseDaoSqlite(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new PurchaseDaoSqlite(jdbcTemplate);
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "db.engine", havingValue = "sqlite", matchIfMissing = true)
    public OutboxDao outboxDaoSqlite(@Qualifier("appJdbcTemplate") JdbcTemplate jdbcTemplate) {
        return new OutboxDaoSqlite(jdbcTemplate);
    }
}

