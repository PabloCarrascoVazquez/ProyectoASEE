package com.subsonic.purchaseservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class ConfirmacionPagoRequest {
    @NotBlank(message = "El método de pago es obligatorio")
    @JsonProperty("metodo_pago")
    private String metodoPago;

    @NotBlank(message = "El token de la pasarela es obligatorio")
    @JsonProperty("token_pasarela")
    private String tokenPasarela;

    public ConfirmacionPagoRequest() {
    }

    public ConfirmacionPagoRequest(String metodoPago, String tokenPasarela) {
        this.metodoPago = metodoPago;
        this.tokenPasarela = tokenPasarela;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getTokenPasarela() {
        return tokenPasarela;
    }

    public void setTokenPasarela(String tokenPasarela) {
        this.tokenPasarela = tokenPasarela;
    }
}

