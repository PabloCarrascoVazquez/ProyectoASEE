package com.subsonic.shipinventoryservice.dtos.responses;

/**
 * Respuesta de error estándar (schema Error del YAML).
 */
public class ErrorResponse {

    private int codigo;
    private String mensaje;
    private String detalle;

    public ErrorResponse() {}

    public ErrorResponse(int codigo, String mensaje, String detalle) {
        this.codigo = codigo;
        this.mensaje = mensaje;
        this.detalle = detalle;
    }

    public int getCodigo() { return codigo; }
    public void setCodigo(int codigo) { this.codigo = codigo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
}
