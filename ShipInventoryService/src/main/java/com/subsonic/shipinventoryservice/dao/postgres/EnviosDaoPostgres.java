package com.subsonic.shipinventoryservice.dao.postgres;

import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public class EnviosDaoPostgres implements EnviosDao {

    private final JdbcTemplate jdbcTemplate;

    public EnviosDaoPostgres(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<EnvioLogistico> rowMapper = new RowMapper<>() {
        @Override
        public EnvioLogistico mapRow(ResultSet rs, int rowNum) throws SQLException {
            EnvioLogistico e = new EnvioLogistico();
            e.setIdEnvio(rs.getString("id_envio"));
            e.setIdPedido(rs.getString("id_pedido"));
            e.setEstadoEnvio(EstadoEnvio.fromString(rs.getString("estado_envio")));
            e.setEmpresaTransporte(rs.getString("empresa_transporte"));
            e.setTrackingNumber(rs.getString("tracking_number"));
            e.setDireccionEntrega(rs.getString("direccion_entrega"));
            e.setNotasIncidencia(rs.getString("notas_incidencia"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                e.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                e.setUpdatedAt(updatedAt.toLocalDateTime());
            }
            return e;
        }
    };

    @Override
    public void save(EnvioLogistico envio) {
        jdbcTemplate.update("""
            INSERT INTO envios
                (id_envio, id_pedido, estado_envio, empresa_transporte,
                 tracking_number, direccion_entrega, notas_incidencia, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                envio.getIdEnvio(),
                envio.getIdPedido(),
                envio.getEstadoEnvio() != null ? envio.getEstadoEnvio().getValor() : "Pendiente",
                envio.getEmpresaTransporte(),
                envio.getTrackingNumber(),
                envio.getDireccionEntrega(),
                envio.getNotasIncidencia(),
                Timestamp.valueOf(envio.getCreatedAt() != null ? envio.getCreatedAt() : LocalDateTime.now()),
                Timestamp.valueOf(envio.getUpdatedAt() != null ? envio.getUpdatedAt() : LocalDateTime.now())
        );
    }

    @Override
    public List<EnvioLogistico> findPendientes() {
        return jdbcTemplate.query(
                """
                SELECT * FROM envios
                ORDER BY created_at DESC
                """,
                rowMapper
        );
    }

    @Override
    public Optional<EnvioLogistico> findById(String idEnvio) {
        try {
            List<EnvioLogistico> list = jdbcTemplate.query(
                    "SELECT * FROM envios WHERE id_envio = ? OR id_pedido = ? ORDER BY created_at DESC LIMIT 1",
                    rowMapper, idEnvio, idEnvio
            );
            return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public int updateTracking(String idEnvio, EstadoEnvio estadoEnvio, String trackingNumber, String notasIncidencia) {
        return jdbcTemplate.update("""
            UPDATE envios
            SET estado_envio       = ?,
                tracking_number    = COALESCE(?, tracking_number),
                notas_incidencia   = ?,
                updated_at         = NOW()
            WHERE id_envio = ?
            """,
                estadoEnvio.getValor(),
                trackingNumber,
                notasIncidencia,
                idEnvio
        );
    }
}
