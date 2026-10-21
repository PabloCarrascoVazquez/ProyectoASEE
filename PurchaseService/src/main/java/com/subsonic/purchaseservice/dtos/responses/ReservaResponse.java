package com.subsonic.purchaseservice.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class ReservaResponse {
    @JsonProperty("id_transaccion")
    private String idTransaccion;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("expiracion_reserva")
    private String expiracionReserva;

    @JsonProperty("moneda")
    private String moneda = "EUR";

    @JsonProperty("total_pagar")
    private BigDecimal totalPagar;

    public ReservaResponse() {
    }

    public ReservaResponse(String idTransaccion, String estado, String expiracionReserva, String moneda, BigDecimal totalPagar) {
        this.idTransaccion = idTransaccion;
        this.estado = estado;
        this.expiracionReserva = expiracionReserva;
        this.moneda = moneda;
        this.totalPagar = totalPagar;
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

    public String getExpiracionReserva() {
        return expiracionReserva;
    }

    public void setExpiracionReserva(String expiracionReserva) {
        this.expiracionReserva = expiracionReserva;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public BigDecimal getTotalPagar() {
        return totalPagar;
    }

    public void setTotalPagar(BigDecimal totalPagar) {
        this.totalPagar = totalPagar;
    }
}

