package com.subsonic.shipinventoryservice;

import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.dao.sqlite.EnviosDaoSqlite;
import com.subsonic.shipinventoryservice.dao.sqlite.InventarioDaoSqlite;
import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;
import com.subsonic.shipinventoryservice.models.StockProducto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.io.File;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para las implementaciones SQLite de los DAOs.
 * Cada test usa una base de datos SQLite en memoria temporal que se borra al finalizar.
 */
class InventarioDaoSqliteTest {

    private String testDbPath;
    private JdbcTemplate jdbcTemplate;
    private InventarioDao inventarioDao;
    private EnviosDao enviosDao;

    @BeforeEach
    void setUp() {
        testDbPath = "test_inventory_" + UUID.randomUUID() + ".db";
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.sqlite.JDBC");
        ds.setUrl("jdbc:sqlite:" + testDbPath);

        jdbcTemplate = new JdbcTemplate(ds);
        jdbcTemplate.execute("PRAGMA foreign_keys = ON;");

        // Crear tabla stock_productos
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS stock_productos (
                id_producto VARCHAR(36) PRIMARY KEY,
                nombre_producto VARCHAR(200) NOT NULL,
                variante VARCHAR(100),
                unidades_disponibles INT NOT NULL DEFAULT 0,
                unidades_bloqueadas INT NOT NULL DEFAULT 0,
                precio DECIMAL(10, 2) NOT NULL,
                ubicacion_almacen VARCHAR(200),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """);

        // Crear tabla envios
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS envios (
                id_envio VARCHAR(36) PRIMARY KEY,
                id_pedido VARCHAR(36) NOT NULL,
                estado_envio VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
                empresa_transporte VARCHAR(100),
                tracking_number VARCHAR(100),
                direccion_entrega VARCHAR(500),
                notas_incidencia TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """);

        // Insertar datos de prueba
        jdbcTemplate.execute("""
            INSERT INTO stock_productos
                (id_producto, nombre_producto, variante, unidades_disponibles, unidades_bloqueadas, precio, ubicacion_almacen)
            VALUES
                ('prod-test-001', 'Camiseta Test', 'Talla M', 100, 0, 25.50, 'Pasillo A'),
                ('prod-test-002', 'Gorra Test', 'Única', 50, 10, 18.00, 'Pasillo B');
        """);

        inventarioDao = new InventarioDaoSqlite(jdbcTemplate);
        enviosDao = new EnviosDaoSqlite(jdbcTemplate);
    }

    @AfterEach
    void tearDown() {
        File file = new File(testDbPath);
        if (file.exists()) {
            file.delete();
        }
    }

    // ================================================================== //
    //  Tests de InventarioDao                                             //
    // ================================================================== //

    @Test
    void testFindAll_DeberiaRetornarTodosLosProductos() {
        List<StockProducto> stock = inventarioDao.findAll();
        assertEquals(2, stock.size());
    }

    @Test
    void testFindById_ProductoExistente() {
        Optional<StockProducto> result = inventarioDao.findById("prod-test-001");
        assertTrue(result.isPresent());
        assertEquals("Camiseta Test", result.get().getNombreProducto());
        assertEquals(100, result.get().getUnidadesDisponibles());
        assertEquals(0, BigDecimal.valueOf(25.50).compareTo(result.get().getPrecio()));
    }

    @Test
    void testFindById_ProductoInexistente() {
        Optional<StockProducto> result = inventarioDao.findById("prod-no-existe");
        assertTrue(result.isEmpty());
    }

    @Test
    void testActualizarStock_IncrementoPositivo() {
        int filas = inventarioDao.actualizarStock("prod-test-001", 20);
        assertEquals(1, filas);

        StockProducto actualizado = inventarioDao.findById("prod-test-001").orElseThrow();
        assertEquals(120, actualizado.getUnidadesDisponibles());
    }

    @Test
    void testActualizarStock_DecrementoNegativo() {
        int filas = inventarioDao.actualizarStock("prod-test-001", -10);
        assertEquals(1, filas);

        StockProducto actualizado = inventarioDao.findById("prod-test-001").orElseThrow();
        assertEquals(90, actualizado.getUnidadesDisponibles());
    }

    @Test
    void testActualizarStock_NoPermiteNegativos() {
        // MAX(0, ...) en SQLite evita que baje de 0
        inventarioDao.actualizarStock("prod-test-001", -200);
        StockProducto resultado = inventarioDao.findById("prod-test-001").orElseThrow();
        assertEquals(0, resultado.getUnidadesDisponibles());
    }

    @Test
    void testBloquearStock_ConStockSuficiente() {
        int filas = inventarioDao.bloquearStock("prod-test-001", 5);
        assertEquals(1, filas, "Debería actualizar 1 fila cuando hay stock suficiente");

        StockProducto actualizado = inventarioDao.findById("prod-test-001").orElseThrow();
        assertEquals(95, actualizado.getUnidadesDisponibles());
        assertEquals(5, actualizado.getUnidadesBloqueadas());
    }

    @Test
    void testBloquearStock_SinStockSuficiente_NoActualiza() {
        int filas = inventarioDao.bloquearStock("prod-test-001", 999);
        assertEquals(0, filas, "No debería actualizar ninguna fila si no hay stock");

        StockProducto sin_cambio = inventarioDao.findById("prod-test-001").orElseThrow();
        assertEquals(100, sin_cambio.getUnidadesDisponibles(), "El stock disponible no debe cambiar");
    }

    @Test
    void testLiberarStock_DevuelveUnidades() {
        // Primero bloqueamos
        inventarioDao.bloquearStock("prod-test-002", 5);

        StockProducto despuesBloqueo = inventarioDao.findById("prod-test-002").orElseThrow();
        assertEquals(45, despuesBloqueo.getUnidadesDisponibles());
        assertEquals(15, despuesBloqueo.getUnidadesBloqueadas());

        // Luego liberamos
        inventarioDao.liberarStock("prod-test-002", 5);

        StockProducto despuesLiberar = inventarioDao.findById("prod-test-002").orElseThrow();
        assertEquals(50, despuesLiberar.getUnidadesDisponibles());
        assertEquals(10, despuesLiberar.getUnidadesBloqueadas());
    }

    @Test
    void testConfirmarConsumoStock_ReduceBloqueadas() {
        // Estado inicial prod-test-002: disponibles=50, bloqueadas=10
        inventarioDao.confirmarConsumoStock("prod-test-002", 5);

        StockProducto resultado = inventarioDao.findById("prod-test-002").orElseThrow();
        assertEquals(50, resultado.getUnidadesDisponibles(), "El stock disponible no cambia al confirmar");
        assertEquals(5, resultado.getUnidadesBloqueadas(), "Las bloqueadas deben reducirse");
    }

    // ================================================================== //
    //  Tests de EnviosDao                                                 //
    // ================================================================== //

    @Test
    void testSaveAndFindEnvio() {
        EnvioLogistico envio = new EnvioLogistico(
                "env-001", "pedido-tx-001", EstadoEnvio.PENDIENTE,
                null, null, "Calle Mayor 1, Madrid"
        );
        enviosDao.save(envio);

        Optional<EnvioLogistico> found = enviosDao.findById("env-001");
        assertTrue(found.isPresent());
        assertEquals("pedido-tx-001", found.get().getIdPedido());
        assertEquals(EstadoEnvio.PENDIENTE, found.get().getEstadoEnvio());
    }

    @Test
    void testFindPendientes_SoloPendientesYPreparando() {
        // Guardamos envíos en distintos estados
        enviosDao.save(new EnvioLogistico("env-p1", "ped-001", EstadoEnvio.PENDIENTE, null, null, "Dir 1"));
        enviosDao.save(new EnvioLogistico("env-p2", "ped-002", EstadoEnvio.PREPARANDO, null, null, "Dir 2"));
        enviosDao.save(new EnvioLogistico("env-p3", "ped-003", EstadoEnvio.ENVIADO, null, "TRK123", "Dir 3"));

        List<EnvioLogistico> pendientes = enviosDao.findPendientes();
        assertEquals(2, pendientes.size(), "Solo debe incluir Pendiente y Preparando");
        assertTrue(pendientes.stream().allMatch(e ->
                e.getEstadoEnvio() == EstadoEnvio.PENDIENTE || e.getEstadoEnvio() == EstadoEnvio.PREPARANDO
        ));
    }

    @Test
    void testUpdateTracking_ActualizaEstadoYTracking() {
        enviosDao.save(new EnvioLogistico("env-u1", "ped-001", EstadoEnvio.PENDIENTE, null, null, "Dir 1"));

        int filas = enviosDao.updateTracking("env-u1", EstadoEnvio.ENVIADO, "TRK-XYZ-789", null);
        assertEquals(1, filas);

        EnvioLogistico actualizado = enviosDao.findById("env-u1").orElseThrow();
        assertEquals(EstadoEnvio.ENVIADO, actualizado.getEstadoEnvio());
        assertEquals("TRK-XYZ-789", actualizado.getTrackingNumber());
    }

    @Test
    void testUpdateTracking_EnvioInexistente_DevuelveCero() {
        int filas = enviosDao.updateTracking("env-no-existe", EstadoEnvio.ENVIADO, "TRK-000", null);
        assertEquals(0, filas, "No debe afectar ninguna fila si el envío no existe");
    }
}
