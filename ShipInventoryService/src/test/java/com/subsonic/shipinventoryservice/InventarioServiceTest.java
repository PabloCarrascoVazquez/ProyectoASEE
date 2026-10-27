package com.subsonic.shipinventoryservice;

import com.subsonic.shipinventoryservice.config.BadRequestException;
import com.subsonic.shipinventoryservice.config.ConflictException;
import com.subsonic.shipinventoryservice.config.NotFoundException;
import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.dtos.responses.BloqueoStockResponse;
import com.subsonic.shipinventoryservice.dtos.responses.StockProductoResponse;
import com.subsonic.shipinventoryservice.models.StockProducto;
import com.subsonic.shipinventoryservice.services.InventarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del servicio InventarioService usando Mockito.
 */
@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {

    @Mock
    private InventarioDao inventarioDao;

    private InventarioService inventarioService;

    @BeforeEach
    void setUp() {
        inventarioService = new InventarioService(inventarioDao);
    }

    private StockProducto crearProductoTest(String id, int disponibles, int bloqueadas) {
        StockProducto p = new StockProducto();
        p.setIdProducto(id);
        p.setNombreProducto("Producto Test");
        p.setVariante("Talla M");
        p.setUnidadesDisponibles(disponibles);
        p.setUnidadesBloqueadas(bloqueadas);
        p.setPrecio(BigDecimal.valueOf(25.50));
        p.setUbicacionAlmacen("Pasillo A");
        return p;
    }

    // ------------------------------------------------------------------ //
    //  consultarStock                                                      //
    // ------------------------------------------------------------------ //

    @Test
    void consultarStock_DeberiaRetornarListaCompleta() {
        when(inventarioDao.findAll()).thenReturn(List.of(
                crearProductoTest("prod-001", 100, 0),
                crearProductoTest("prod-002", 50, 5)
        ));

        List<StockProductoResponse> result = inventarioService.consultarStock();

        assertEquals(2, result.size());
        verify(inventarioDao, times(1)).findAll();
    }

    // ------------------------------------------------------------------ //
    //  actualizarStock                                                     //
    // ------------------------------------------------------------------ //

    @Test
    void actualizarStock_Exito_Incremento() {
        StockProducto antes   = crearProductoTest("prod-001", 100, 0);
        StockProducto despues = crearProductoTest("prod-001", 120, 0);

        when(inventarioDao.findById("prod-001"))
                .thenReturn(Optional.of(antes))
                .thenReturn(Optional.of(despues));
        when(inventarioDao.actualizarStock("prod-001", 20)).thenReturn(1);

        StockProductoResponse resp = inventarioService.actualizarStock("prod-001", 20);

        assertEquals(120, resp.getUnidadesDisponibles());
        verify(inventarioDao, times(1)).actualizarStock("prod-001", 20);
    }

    @Test
    void actualizarStock_ProductoNoEncontrado_LanzaNotFoundException() {
        when(inventarioDao.findById("prod-x")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> inventarioService.actualizarStock("prod-x", 10));
    }

    @Test
    void actualizarStock_StockResultanteNegativo_LanzaBadRequestException() {
        StockProducto producto = crearProductoTest("prod-001", 5, 0);
        when(inventarioDao.findById("prod-001")).thenReturn(Optional.of(producto));

        assertThrows(BadRequestException.class,
                () -> inventarioService.actualizarStock("prod-001", -10));

        // No debe llamar al DAO si la validación falla
        verify(inventarioDao, never()).actualizarStock(any(), anyInt());
    }

    // ------------------------------------------------------------------ //
    //  bloquearStock                                                       //
    // ------------------------------------------------------------------ //

    @Test
    void bloquearStock_Exito_ConStockSuficiente() {
        StockProducto producto = crearProductoTest("prod-001", 100, 0);
        when(inventarioDao.findById("prod-001")).thenReturn(Optional.of(producto));
        when(inventarioDao.bloquearStock("prod-001", 3)).thenReturn(1);

        BloqueoStockResponse resp = inventarioService.bloquearStock("prod-001", 3);

        assertTrue(resp.isBloqueado());
        assertEquals("prod-001", resp.getIdProducto());
        assertEquals(0, BigDecimal.valueOf(25.50).compareTo(resp.getPrecioUnitario()));
    }

    @Test
    void bloquearStock_StockInsuficiente_LanzaConflictException() {
        StockProducto producto = crearProductoTest("prod-001", 2, 0);
        when(inventarioDao.findById("prod-001")).thenReturn(Optional.of(producto));

        assertThrows(ConflictException.class,
                () -> inventarioService.bloquearStock("prod-001", 5));

        verify(inventarioDao, never()).bloquearStock(any(), anyInt());
    }

    @Test
    void bloquearStock_RaceCondition_LanzaConflictException() {
        // Pasó la validación inicial pero el UPDATE afectó 0 filas (otro hilo consumió el stock)
        StockProducto producto = crearProductoTest("prod-001", 5, 0);
        when(inventarioDao.findById("prod-001")).thenReturn(Optional.of(producto));
        when(inventarioDao.bloquearStock("prod-001", 3)).thenReturn(0);

        assertThrows(ConflictException.class,
                () -> inventarioService.bloquearStock("prod-001", 3));
    }

    @Test
    void bloquearStock_ProductoNoExiste_LanzaNotFoundException() {
        when(inventarioDao.findById("prod-x")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> inventarioService.bloquearStock("prod-x", 1));
    }

    // ------------------------------------------------------------------ //
    //  liberarStock                                                        //
    // ------------------------------------------------------------------ //

    @Test
    void liberarStock_ProductoExistente_LlamaAlDao() {
        when(inventarioDao.findById("prod-001"))
                .thenReturn(Optional.of(crearProductoTest("prod-001", 95, 5)));

        inventarioService.liberarStock("prod-001", 5);

        verify(inventarioDao, times(1)).liberarStock("prod-001", 5);
    }

    @Test
    void liberarStock_ProductoInexistente_NoCrashYNoLlamaAlDao() {
        when(inventarioDao.findById("prod-x")).thenReturn(Optional.empty());

        // No debe lanzar excepción (best-effort)
        assertDoesNotThrow(() -> inventarioService.liberarStock("prod-x", 1));

        verify(inventarioDao, never()).liberarStock(any(), anyInt());
    }
}
