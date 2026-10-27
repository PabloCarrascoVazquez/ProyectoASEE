package com.subsonic.shipinventoryservice.models;

import java.time.LocalDateTime;

/**
 * Entidad que representa un envío logístico generado tras el pago de un pedido de merchandising.
 */
public class EnvioLogistico {

    private String idEnvio;
    private String idPedido;
    private EstadoEnvio estadoEnvio;
    private String empresaTransporte;
    private String trackingNumber;
    private String direccionEntrega;
    private String notasIncidencia;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EnvioLogistico() {}

    public EnvioLogistico(String idEnvio, String idPedido, EstadoEnvio estadoEnvio,
                           String empresaTransporte, String trackingNumber,
                           String direccionEntrega) {
        this.idEnvio = idEnvio;
        this.idPedido = idPedido;
        this.estadoEnvio = estadoEnvio;
        this.empresaTransporte = empresaTransporte;
        this.trackingNumber = trackingNumber;
        this.direccionEntrega = direccionEntrega;
    }

    // --- Getters & Setters ---

    public String getIdEnvio() { return idEnvio; }
    public void setIdEnvio(String idEnvio) { this.idEnvio = idEnvio; }

    public String getIdPedido() { return idPedido; }
    public void setIdPedido(String idPedido) { this.idPedido = idPedido; }

    public EstadoEnvio getEstadoEnvio() { return estadoEnvio; }
    public void setEstadoEnvio(EstadoEnvio estadoEnvio) { this.estadoEnvio = estadoEnvio; }

    public String getEmpresaTransporte() { return empresaTransporte; }
    public void setEmpresaTransporte(String empresaTransporte) { this.empresaTransporte = empresaTransporte; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }

    public String getNotasIncidencia() { return notasIncidencia; }
    public void setNotasIncidencia(String notasIncidencia) { this.notasIncidencia = notasIncidencia; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
