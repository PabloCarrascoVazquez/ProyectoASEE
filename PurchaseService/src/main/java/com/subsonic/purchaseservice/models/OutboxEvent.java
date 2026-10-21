package com.subsonic.purchaseservice.models;

import java.time.LocalDateTime;

public class OutboxEvent {
    private String id;
    private String aggregateType = "TRANSACTION";
    private String aggregateId;
    private String eventType;
    private String payload;
    private boolean published = false;
    private LocalDateTime createdAt;

    public OutboxEvent() {
    }

    public OutboxEvent(String id, String aggregateType, String aggregateId,
                       String eventType, String payload, boolean published) {
        this.id = id;
        this.aggregateType = aggregateType != null ? aggregateType : "TRANSACTION";
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.payload = payload;
        this.published = published;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAggregateType() {
        return aggregateType;
    }

    public void setAggregateType(String aggregateType) {
        this.aggregateType = aggregateType;
    }

    public String getAggregateId() {
        return aggregateId;
    }

    public void setAggregateId(String aggregateId) {
        this.aggregateId = aggregateId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

