package com.subsonic.purchaseservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;

public class ReservaCarritoCompletoRequest {
    @JsonProperty("id_festival")
    private String idFestival;

    @Valid
    @JsonProperty("entradas")
    private List<ItemEntradaRequest> entradas = new ArrayList<>();

    @Valid
    @JsonProperty("merchandising")
    private List<ItemMerchRequest> merchandising = new ArrayList<>();

    @Valid
    @JsonProperty("direccion_envio")
    private DireccionEnvioRequest direccionEnvio;

    public ReservaCarritoCompletoRequest() {
    }

    public ReservaCarritoCompletoRequest(String idFestival, List<ItemEntradaRequest> entradas,
                                         List<ItemMerchRequest> merchandising, DireccionEnvioRequest direccionEnvio) {
        this.idFestival = idFestival;
        this.entradas = entradas != null ? entradas : new ArrayList<>();
        this.merchandising = merchandising != null ? merchandising : new ArrayList<>();
        this.direccionEnvio = direccionEnvio;
    }

    public String getIdFestival() {
        return idFestival;
    }

    public void setIdFestival(String idFestival) {
        this.idFestival = idFestival;
    }

    public List<ItemEntradaRequest> getEntradas() {
        return entradas;
    }

    public void setEntradas(List<ItemEntradaRequest> entradas) {
        this.entradas = entradas;
    }

    public List<ItemMerchRequest> getMerchandising() {
        return merchandising;
    }

    public void setMerchandising(List<ItemMerchRequest> merchandising) {
        this.merchandising = merchandising;
    }

    public DireccionEnvioRequest getDireccionEnvio() {
        return direccionEnvio;
    }

    public void setDireccionEnvio(DireccionEnvioRequest direccionEnvio) {
        this.direccionEnvio = direccionEnvio;
    }

    public boolean hasTickets() {
        return entradas != null && !entradas.isEmpty();
    }

    public boolean hasMerchandise() {
        return merchandising != null && !merchandising.isEmpty();
    }
}

