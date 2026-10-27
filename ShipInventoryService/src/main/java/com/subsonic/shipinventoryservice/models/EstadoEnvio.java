package com.subsonic.shipinventoryservice.models;

/**
 * Enum con los posibles estados de un envío logístico, tal como define el YAML.
 */
public enum EstadoEnvio {
    PENDIENTE("Pendiente"),
    PREPARANDO("Preparando"),
    ENVIADO("Enviado"),
    EN_REPARTO("En Reparto"),
    ENTREGADO("Entregado"),
    INCIDENCIA("Incidencia");

    private final String valor;

    EstadoEnvio(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static EstadoEnvio fromString(String text) {
        if (text == null) return PENDIENTE;
        for (EstadoEnvio e : values()) {
            if (e.valor.equalsIgnoreCase(text) || e.name().equalsIgnoreCase(text)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado de envío desconocido: " + text);
    }
}
