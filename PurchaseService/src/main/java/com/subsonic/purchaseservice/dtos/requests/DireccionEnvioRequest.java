package com.subsonic.purchaseservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class DireccionEnvioRequest {
    @NotBlank(message = "La calle es obligatoria")
    @JsonProperty("calle")
    private String calle;

    @NotBlank(message = "La ciudad es obligatoria")
    @JsonProperty("ciudad")
    private String ciudad;

    @NotBlank(message = "El código postal es obligatorio")
    @JsonProperty("codigo_postal")
    private String codigoPostal;

    @NotBlank(message = "El país es obligatorio")
    @JsonProperty("pais")
    private String pais;

    @JsonProperty("telefono_contacto")
    private String telefonoContacto;

    public DireccionEnvioRequest() {
    }

    public DireccionEnvioRequest(String calle, String ciudad, String codigoPostal, String pais, String telefonoContacto) {
        this.calle = calle;
        this.ciudad = ciudad;
        this.codigoPostal = codigoPostal;
        this.pais = pais;
        this.telefonoContacto = telefonoContacto;
    }

    public String getCalle() {
        return calle;
    }

    public void setCalle(String calle) {
        this.calle = calle;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public String getTelefonoContacto() {
        return telefonoContacto;
    }

    public void setTelefonoContacto(String telefonoContacto) {
        this.telefonoContacto = telefonoContacto;
    }
}

