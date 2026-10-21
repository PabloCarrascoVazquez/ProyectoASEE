package com.subsonic.purchaseservice.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class TransaccionResponse {
    @JsonProperty("id_transaccion")
    private String idTransaccion;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("total_cobrado")
    private BigDecimal totalCobrado;

    @JsonProperty("recibo_url")
    private String reciboUrl;

    @JsonProperty("fecha_pago")
    private String fechaPago;

    public TransaccionResponse() {
    }

    public TransaccionResponse(String idTransaccion, String estado, BigDecimal totalCobrado, String reciboUrl, String fechaPago) {
        this.idTransaccion = idTransaccion;
        this.estado = estado;
        this.totalCobrado = totalCobrado;
        this.reciboUrl = reciboUrl;
        this.fechaPago = fechaPago;
    }

    public String getIdTransaccion() {
        return idTransaccion;
    }

    public void setIdTransaccion(String idTransaccion) {
        this.idTransaccion = idTransaccion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public BigDecimal getTotalCobrado() {
        return totalCobrado;
    }

    public void setTotalCobrado(BigDecimal totalCobrado) {
        this.totalCobrado = totalCobrado;
    }

    public String getReciboUrl() {
        return reciboUrl;
    }

    public void setReciboUrl(String reciboUrl) {
        this.reciboUrl = reciboUrl;
    }

    public String getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(String fechaPago) {
        this.fechaPago = fechaPago;
    }
}

