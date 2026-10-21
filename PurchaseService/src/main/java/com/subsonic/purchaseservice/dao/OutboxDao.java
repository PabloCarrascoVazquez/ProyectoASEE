package com.subsonic.purchaseservice.dao;

import com.subsonic.purchaseservice.models.OutboxEvent;

import java.util.List;

public interface OutboxDao {
    void save(OutboxEvent event);

    List<OutboxEvent> findUnpublished(int limit);

    void markAsPublished(String eventId);

    void markAsPublishedBatch(List<String> eventIds);
}

