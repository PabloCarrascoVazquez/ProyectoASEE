package com.subsonic.shipinventoryservice.dao;

import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;

import java.util.List;
import java.util.Optional;

/**
 * Contrato de acceso a datos para los envíos logísticos.
 */
public interface EnviosDao {

    /** Guarda un nuevo envío en base de datos. */
    void save(EnvioLogistico envio);

    /** Devuelve todos los envíos con estado Pendiente o Preparando. */
    List<EnvioLogistico> findPendientes();

    /** Busca un envío por su ID. */
    Optional<EnvioLogistico> findById(String idEnvio);

    /** Actualiza el estado logístico, tracking_number y notas_incidencia de un envío. */
    int updateTracking(String idEnvio, EstadoEnvio estadoEnvio, String trackingNumber, String notasIncidencia);
}
