package com.subsonic.shipinventoryservice.dao.sqlite;

import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

public class EnviosDaoSqlite implements EnviosDao {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final JdbcTemplate jdbcTemplate;

    public EnviosDaoSqlite(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt != null ? dt.format(FORMATTER) : null;
    }

    private LocalDateTime parseDateTime(String text) {
        if (text == null || text.isBlank()) return null;
        try {
            return text.contains("T") ? LocalDateTime.parse(text) : LocalDateTime.parse(text, FORMATTER);
        } catch (Exception e) {
            return null;
        }
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
            e.setCreatedAt(parseDateTime(rs.getString("created_at")));
            e.setUpdatedAt(parseDateTime(rs.getString("updated_at")));
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
                formatDateTime(envio.getCreatedAt() != null ? envio.getCreatedAt() : LocalDateTime.now()),
                formatDateTime(envio.getUpdatedAt() != null ? envio.getUpdatedAt() : LocalDateTime.now())
        );
    }

    @Override
    public List<EnvioLogistico> findPendientes() {
        return jdbcTemplate.query(
                """
                SELECT * FROM envios
                WHERE estado_envio IN ('Pendiente', 'Preparando')
                ORDER BY created_at ASC
                """,
                rowMapper
        );
    }

    @Override
    public Optional<EnvioLogistico> findById(String idEnvio) {
        try {
            EnvioLogistico envio = jdbcTemplate.queryForObject(
                    "SELECT * FROM envios WHERE id_envio = ?",
                    rowMapper, idEnvio
            );
            return Optional.ofNullable(envio);
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
                updated_at         = datetime('now')
            WHERE id_envio = ?
            """,
                estadoEnvio.getValor(),
                trackingNumber,
                notasIncidencia,
                idEnvio
        );
    }
}
