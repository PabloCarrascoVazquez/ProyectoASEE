package com.subsonic.shipinventoryservice.dao.postgres;

import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.models.StockProducto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public class InventarioDaoPostgres implements InventarioDao {

    private final JdbcTemplate jdbcTemplate;

    public InventarioDaoPostgres(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
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

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                s.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                s.setUpdatedAt(updatedAt.toLocalDateTime());
            }
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
            SET unidades_disponibles = GREATEST(0, unidades_disponibles + ?),
                updated_at = NOW()
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
                updated_at           = NOW()
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
                unidades_bloqueadas  = GREATEST(0, unidades_bloqueadas - ?),
                updated_at           = NOW()
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
            SET unidades_bloqueadas = GREATEST(0, unidades_bloqueadas - ?),
                updated_at          = NOW()
            WHERE id_producto = ?
            """,
                cantidad, idProducto
        );
    }
}
