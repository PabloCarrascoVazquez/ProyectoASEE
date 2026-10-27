package com.subsonic.shipinventoryservice.services;

import com.subsonic.shipinventoryservice.config.BadRequestException;
import com.subsonic.shipinventoryservice.config.NotFoundException;
import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.dtos.requests.ActualizacionTrackingRequest;
import com.subsonic.shipinventoryservice.dtos.responses.EnvioLogisticoResponse;
import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnviosService {
    private static final Logger log = LoggerFactory.getLogger(EnviosService.class);

    private final EnviosDao enviosDao;

    public EnviosService(EnviosDao enviosDao) {
        this.enviosDao = enviosDao;
    }

    /**
     * GET /envios — Lista los envíos pendientes de despachar (solo Admin).
     */
    public List<EnvioLogisticoResponse> listarEnviosPendientes() {
        log.info("Listando envíos pendientes de despachar...");
        return enviosDao.findPendientes().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * PUT /envios/{id_envio}/tracking — Actualiza el estado logístico de un envío (solo Admin).
     */
    @Transactional
    public EnvioLogisticoResponse actualizarTracking(String idEnvio, ActualizacionTrackingRequest request) {
        log.info("Actualizando tracking del envío '{}' → estado: {}", idEnvio, request.getEstadoEnvio());

        // Validar que el estado es uno de los permitidos por el YAML
        EstadoEnvio nuevoEstado;
        try {
            nuevoEstado = EstadoEnvio.fromString(request.getEstadoEnvio());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Estado de envío no válido: '" + request.getEstadoEnvio() +
                    "'. Valores permitidos: Pendiente, Preparando, Enviado, En Reparto, Entregado, Incidencia");
        }

        // Verificar que el envío existe
        enviosDao.findById(idEnvio)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado con ID: " + idEnvio));

        int filas = enviosDao.updateTracking(
                idEnvio,
                nuevoEstado,
                request.getTrackingNumber(),
                request.getNotasIncidencia()
        );

        if (filas == 0) {
            throw new NotFoundException("No se pudo actualizar el envío con ID: " + idEnvio);
        }

        // Recuperamos el estado actualizado para devolver en la respuesta
        EnvioLogistico actualizado = enviosDao.findById(idEnvio)
                .orElseThrow(() -> new NotFoundException("Envío no encontrado tras actualización: " + idEnvio));

        log.info("Tracking del envío '{}' actualizado correctamente a estado '{}'",
                idEnvio, nuevoEstado.getValor());
        return toResponse(actualizado);
    }

    /**
     * Crea un nuevo envío logístico en estado Pendiente.
     * Llamado por el consumidor RabbitMQ al procesar un evento ORDER_PAID con merchandising.
     */
    @Transactional
    public EnvioLogistico crearEnvio(EnvioLogistico envio) {
        log.info("Creando envío para pedido '{}' con dirección '{}'", envio.getIdPedido(), envio.getDireccionEntrega());
        enviosDao.save(envio);
        return envio;
    }

    /**
     * Convierte entidad de dominio → DTO de respuesta.
     */
    private EnvioLogisticoResponse toResponse(EnvioLogistico e) {
        return new EnvioLogisticoResponse(
                e.getIdEnvio(),
                e.getIdPedido(),
                e.getEstadoEnvio() != null ? e.getEstadoEnvio().getValor() : "Pendiente",
                e.getEmpresaTransporte(),
                e.getTrackingNumber(),
                e.getDireccionEntrega()
        );
    }
}
