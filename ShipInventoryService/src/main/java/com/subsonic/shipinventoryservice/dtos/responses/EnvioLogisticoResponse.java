package com.subsonic.shipinventoryservice.dtos.responses;

/**
 * Response con los datos de un envío logístico (schema EnvioLogistico del YAML).
 */
public class EnvioLogisticoResponse {

    private String idEnvio;
    private String idPedido;
    private String estadoEnvio;
    private String empresaTransporte;
    private String trackingNumber;
    private String direccionEntrega;

    public EnvioLogisticoResponse() {}

    public EnvioLogisticoResponse(String idEnvio, String idPedido, String estadoEnvio,
                                   String empresaTransporte, String trackingNumber,
                                   String direccionEntrega) {
        this.idEnvio = idEnvio;
        this.idPedido = idPedido;
        this.estadoEnvio = estadoEnvio;
        this.empresaTransporte = empresaTransporte;
        this.trackingNumber = trackingNumber;
        this.direccionEntrega = direccionEntrega;
    }

    public String getIdEnvio() { return idEnvio; }
    public void setIdEnvio(String idEnvio) { this.idEnvio = idEnvio; }

    public String getIdPedido() { return idPedido; }
    public void setIdPedido(String idPedido) { this.idPedido = idPedido; }

    public String getEstadoEnvio() { return estadoEnvio; }
    public void setEstadoEnvio(String estadoEnvio) { this.estadoEnvio = estadoEnvio; }

    public String getEmpresaTransporte() { return empresaTransporte; }
    public void setEmpresaTransporte(String empresaTransporte) { this.empresaTransporte = empresaTransporte; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }
}
