package com.subsonic.purchaseservice.models;

import java.math.BigDecimal;

public class TransactionItem {
    private String id;
    private String transactionId;
    private ItemType itemType;
    private String itemId; // id_festival o id_producto
    private TicketType ticketType; // Aplica solo a entradas
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public TransactionItem() {
    }

    public TransactionItem(String id, String transactionId, ItemType itemType, String itemId,
                           TicketType ticketType, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.id = id;
        this.transactionId = transactionId;
        this.itemType = itemType;
        this.itemId = itemId;
        this.ticketType = ticketType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public TicketType getTicketType() {
        return ticketType;
    }

    public void setTicketType(TicketType ticketType) {
        this.ticketType = ticketType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}

