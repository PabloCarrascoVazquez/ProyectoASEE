package com.subsonic.shipinventoryservice.dtos.requests;

import jakarta.validation.constraints.NotBlank;

/**
 * Request para actualizar el estado logístico de un envío.
 */
public class ActualizacionTrackingRequest {

    @NotBlank(message = "El campo 'estado_envio' es obligatorio.")
    private String estadoEnvio;

    private String trackingNumber;
    private String notasIncidencia;

    public ActualizacionTrackingRequest() {}

    public ActualizacionTrackingRequest(String estadoEnvio, String trackingNumber, String notasIncidencia) {
        this.estadoEnvio = estadoEnvio;
        this.trackingNumber = trackingNumber;
        this.notasIncidencia = notasIncidencia;
    }

    public String getEstadoEnvio() { return estadoEnvio; }
    public void setEstadoEnvio(String estadoEnvio) { this.estadoEnvio = estadoEnvio; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getNotasIncidencia() { return notasIncidencia; }
    public void setNotasIncidencia(String notasIncidencia) { this.notasIncidencia = notasIncidencia; }
}
