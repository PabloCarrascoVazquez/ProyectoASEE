package com.subsonic.shipinventoryservice.dao.sqlite;

import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.models.StockProducto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

public class InventarioDaoSqlite implements InventarioDao {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final JdbcTemplate jdbcTemplate;

    public InventarioDaoSqlite(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private LocalDateTime parseDateTime(String text) {
        if (text == null || text.isBlank()) return null;
        try {
            return text.contains("T") ? LocalDateTime.parse(text) : LocalDateTime.parse(text, FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private final RowMapper<StockProducto> rowMapper = new RowMapper<>() {
        @Override
        public StockProducto mapRow(ResultSet rs, int rowNum) throws SQLException {
            StockProducto s = new StockProducto();
            s.setIdProducto(rs.getString("id_producto"));
            s.setNombreProducto(rs.getString("nombre_producto"));
            s.setVariante(rs.getString("variante"));
            s.setUnidadesDisponibles(rs.getInt("unidades_disponibles"));
            s.setUnidadesBloqueadas(rs.getInt("unidades_bloqueadas"));
            s.setPrecio(rs.getBigDecimal("precio"));
            s.setUbicacionAlmacen(rs.getString("ubicacion_almacen"));
            s.setCreatedAt(parseDateTime(rs.getString("created_at")));
            s.setUpdatedAt(parseDateTime(rs.getString("updated_at")));
            return s;
        }
    };

    @Override
    public List<StockProducto> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM stock_productos ORDER BY nombre_producto ASC",
                rowMapper
        );
    }

    @Override
    public Optional<StockProducto> findById(String idProducto) {
        try {
            StockProducto s = jdbcTemplate.queryForObject(
                    "SELECT * FROM stock_productos WHERE id_producto = ?",
                    rowMapper, idProducto
            );
            return Optional.ofNullable(s);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public int actualizarStock(String idProducto, int variacionUnidades) {
        return jdbcTemplate.update("""
            UPDATE stock_productos
            SET unidades_disponibles = MAX(0, unidades_disponibles + ?),
                updated_at = datetime('now')
            WHERE id_producto = ?
            """,
                variacionUnidades, idProducto
        );
    }

    @Override
    public int bloquearStock(String idProducto, int cantidad) {
        // Solo bloquea si hay stock suficiente disponible
        return jdbcTemplate.update("""
            UPDATE stock_productos
            SET unidades_disponibles = unidades_disponibles - ?,
                unidades_bloqueadas  = unidades_bloqueadas  + ?,
                updated_at           = datetime('now')
            WHERE id_producto = ?
              AND unidades_disponibles >= ?
            """,
                cantidad, cantidad, idProducto, cantidad
        );
    }

    @Override
    public void liberarStock(String idProducto, int cantidad) {
        jdbcTemplate.update("""
            UPDATE stock_productos
            SET unidades_disponibles = unidades_disponibles + ?,
                unidades_bloqueadas  = MAX(0, unidades_bloqueadas  - ?),
                updated_at           = datetime('now')
            WHERE id_producto = ?
            """,
                cantidad, cantidad, idProducto
        );
    }

    @Override
    public void confirmarConsumoStock(String idProducto, int cantidad) {
        // El stock disponible ya fue descontado al bloquear; solo reducimos el contador de bloqueadas
        jdbcTemplate.update("""
            UPDATE stock_productos
            SET unidades_bloqueadas = MAX(0, unidades_bloqueadas - ?),
                updated_at          = datetime('now')
            WHERE id_producto = ?
            """,
                cantidad, idProducto
        );
    }
}
