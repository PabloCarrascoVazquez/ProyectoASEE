package com.subsonic.purchaseservice.dao.mysql;

import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.models.OutboxEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

public class OutboxDaoMySql implements OutboxDao {
    private final JdbcTemplate jdbcTemplate;

    public OutboxDaoMySql(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<OutboxEvent> outboxRowMapper = new RowMapper<>() {
        @Override
        public OutboxEvent mapRow(ResultSet rs, int rowNum) throws SQLException {
            OutboxEvent event = new OutboxEvent();
            event.setId(rs.getString("id"));
            event.setAggregateType(rs.getString("aggregate_type"));
            event.setAggregateId(rs.getString("aggregate_id"));
            event.setEventType(rs.getString("event_type"));
            event.setPayload(rs.getString("payload"));
            event.setPublished(rs.getBoolean("published"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                event.setCreatedAt(createdAt.toLocalDateTime());
            }

            return event;
        }
    };

    @Override
    public void save(OutboxEvent event) {
        String sql = """
            INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, published, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """;
        jdbcTemplate.update(sql,
                event.getId(),
                event.getAggregateType(),
                event.getAggregateId(),
                event.getEventType(),
                event.getPayload(),
                event.isPublished(),
                event.getCreatedAt() != null ? Timestamp.valueOf(event.getCreatedAt()) : Timestamp.valueOf(LocalDateTime.now())
        );
    }

    @Override
    public List<OutboxEvent> findUnpublished(int limit) {
        String sql = "SELECT * FROM outbox_events WHERE published = FALSE ORDER BY created_at ASC LIMIT ?";
        return jdbcTemplate.query(sql, outboxRowMapper, limit);
    }

    @Override
    public void markAsPublished(String eventId) {
        String sql = "UPDATE outbox_events SET published = TRUE WHERE id = ?";
        jdbcTemplate.update(sql, eventId);
    }

    @Override
    public void markAsPublishedBatch(List<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) return;

        String sql = "UPDATE outbox_events SET published = TRUE WHERE id = ?";
        jdbcTemplate.batchUpdate(sql, eventIds, eventIds.size(), (ps, id) -> ps.setString(1, id));
    }
}

