package com.subsonic.purchaseservice.dao.sqlite;

import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.models.OutboxEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class OutboxDaoSqlite implements OutboxDao {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;

    public OutboxDaoSqlite(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt != null ? dt.format(FORMATTER) : null;
    }

    private LocalDateTime parseDateTime(String text) {
        if (text == null || text.isBlank()) return null;
        try {
            if (text.contains("T")) {
                return LocalDateTime.parse(text);
            }
            return LocalDateTime.parse(text, FORMATTER);
        } catch (Exception e) {
            return null;
        }
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
            event.setPublished(rs.getInt("published") == 1);
            event.setCreatedAt(parseDateTime(rs.getString("created_at")));
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
                event.isPublished() ? 1 : 0,
                formatDateTime(event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now())
        );
    }

    @Override
    public List<OutboxEvent> findUnpublished(int limit) {
        String sql = "SELECT * FROM outbox_events WHERE published = 0 ORDER BY created_at ASC LIMIT ?";
        return jdbcTemplate.query(sql, outboxRowMapper, limit);
    }

    @Override
    public void markAsPublished(String eventId) {
        String sql = "UPDATE outbox_events SET published = 1 WHERE id = ?";
        jdbcTemplate.update(sql, eventId);
    }

    @Override
    public void markAsPublishedBatch(List<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) return;

        String sql = "UPDATE outbox_events SET published = 1 WHERE id = ?";
        jdbcTemplate.batchUpdate(sql, eventIds, eventIds.size(), (ps, id) -> ps.setString(1, id));
    }
}

