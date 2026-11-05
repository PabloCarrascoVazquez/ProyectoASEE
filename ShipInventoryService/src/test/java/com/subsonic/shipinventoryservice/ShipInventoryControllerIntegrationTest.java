package com.subsonic.shipinventoryservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.shipinventoryservice.dtos.requests.ActualizacionStockRequest;
import com.subsonic.shipinventoryservice.dtos.requests.ActualizacionTrackingRequest;
import com.subsonic.shipinventoryservice.dtos.requests.BloqueoStockRequest;
import com.subsonic.shipinventoryservice.dtos.responses.BloqueoStockResponse;
import com.subsonic.shipinventoryservice.dtos.responses.EnvioLogisticoResponse;
import com.subsonic.shipinventoryservice.dtos.responses.StockProductoResponse;
import com.subsonic.shipinventoryservice.services.EnviosService;
import com.subsonic.shipinventoryservice.services.InventarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración de los controladores REST.
 * Verifica seguridad (JWT), roles Admin, y respuestas correctas del YAML OpenAPI.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ShipInventoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventarioService inventarioService;

    @MockBean
    private EnviosService enviosService;

    // ================================================================== //
    //  GET /api/inventario/stock — Público (sin JWT)                      //
    // ================================================================== //

    @Test
    void testGetStock_SinJWT_DeberiaRetornar200() throws Exception {
        when(inventarioService.consultarStock()).thenReturn(List.of(
                new StockProductoResponse("prod-001", "Camiseta Subsonic", "Talla L", 150, BigDecimal.valueOf(25.50), "Pasillo B")
        ));

        mockMvc.perform(get("/api/inventario/stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id_producto").value("prod-001"))
                .andExpect(jsonPath("$[0].nombre_producto").value("Camiseta Subsonic"))
                .andExpect(jsonPath("$[0].unidades_disponibles").value(150));
    }

    @Test
    void testGetStock_ListaVacia_DeberiaRetornar200ConArrayVacio() throws Exception {
        when(inventarioService.consultarStock()).thenReturn(List.of());

        mockMvc.perform(get("/api/inventario/stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ================================================================== //
    //  PUT /api/inventario/{id} — Requiere Admin JWT                      //
    // ================================================================== //

    @Test
    void testActualizarStock_SinJWT_DeberiaRetornar401() throws Exception {
        ActualizacionStockRequest req = new ActualizacionStockRequest(10);

        mockMvc.perform(put("/api/inventario/prod-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value(401));
    }

    @Test
    void testActualizarStock_ConJWTUser_DeberiaRetornar403() throws Exception {
        String userToken = TestJwtUtils.generateToken("user-normal");
        ActualizacionStockRequest req = new ActualizacionStockRequest(10);

        mockMvc.perform(put("/api/inventario/prod-001")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value(403));
    }

    @Test
    void testActualizarStock_ConAdminJWT_DeberiaRetornar200() throws Exception {
        String adminToken = TestJwtUtils.generateAdminToken("admin-user");
        ActualizacionStockRequest req = new ActualizacionStockRequest(20);

        when(inventarioService.actualizarStock(eq("prod-001"), eq(20)))
                .thenReturn(new StockProductoResponse("prod-001", "Camiseta Subsonic", "Talla L",
                        170, BigDecimal.valueOf(25.50), "Pasillo B"));

        mockMvc.perform(put("/api/inventario/prod-001")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id_producto").value("prod-001"))
                .andExpect(jsonPath("$.unidades_disponibles").value(170));
    }

    // ================================================================== //
    //  POST /api/inventario/{id}/bloquear — Interno (JWT cualquier rol)   //
    // ================================================================== //

    @Test
    void testBloquearStock_SinJWT_DeberiaRetornar401() throws Exception {
        BloqueoStockRequest req = new BloqueoStockRequest(2);

        mockMvc.perform(post("/api/inventario/prod-001/bloquear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testBloquearStock_ConJWT_DeberiaRetornar200() throws Exception {
        String token = TestJwtUtils.generateToken("user-123");
        BloqueoStockRequest req = new BloqueoStockRequest(2);

        when(inventarioService.bloquearStock(eq("prod-001"), eq(2)))
                .thenReturn(new BloqueoStockResponse(true, "prod-001", BigDecimal.valueOf(25.50)));

        mockMvc.perform(post("/api/inventario/prod-001/bloquear")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloqueado").value(true))
                .andExpect(jsonPath("$.id_producto").value("prod-001"))
                .andExpect(jsonPath("$.precio_unitario").value(25.50));
    }

    // ================================================================== //
    //  POST /api/inventario/{id}/liberar — Interno (JWT cualquier rol)    //
    // ================================================================== //

    @Test
    void testLiberarStock_ConJWT_DeberiaRetornar200() throws Exception {
        String token = TestJwtUtils.generateToken("user-123");
        BloqueoStockRequest req = new BloqueoStockRequest(2);

        mockMvc.perform(post("/api/inventario/prod-001/liberar")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ================================================================== //
    //  GET /api/envios — Requiere Admin JWT                               //
    // ================================================================== //

    @Test
    void testGetEnvios_SinJWT_DeberiaRetornar401() throws Exception {
        mockMvc.perform(get("/api/envios"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetEnvios_ConJWTUser_DeberiaRetornar403() throws Exception {
        String userToken = TestJwtUtils.generateToken("user-normal");

        mockMvc.perform(get("/api/envios")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetEnvios_ConAdminJWT_DeberiaRetornarListado() throws Exception {
        String adminToken = TestJwtUtils.generateAdminToken("admin-logistica");

        when(enviosService.listarEnviosPendientes()).thenReturn(List.of(
                new EnvioLogisticoResponse("env-001", "tx-001", "Pendiente",
                        "Correos", null, "Calle Mayor 1, Madrid")
        ));

        mockMvc.perform(get("/api/envios")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id_envio").value("env-001"))
                .andExpect(jsonPath("$[0].estado_envio").value("Pendiente"));
    }

    // ================================================================== //
    //  PUT /api/envios/{id}/tracking — Requiere Admin JWT                 //
    // ================================================================== //

    @Test
    void testActualizarTracking_SinJWT_DeberiaRetornar401() throws Exception {
        ActualizacionTrackingRequest req = new ActualizacionTrackingRequest("Enviado", "TRK-001", null);

        mockMvc.perform(put("/api/envios/env-001/tracking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testActualizarTracking_ConAdminJWT_DeberiaRetornar200() throws Exception {
        String adminToken = TestJwtUtils.generateAdminToken("admin-logistica");
        ActualizacionTrackingRequest req = new ActualizacionTrackingRequest("Enviado", "TRK-XYZ-001", null);

        when(enviosService.actualizarTracking(eq("env-001"), any()))
                .thenReturn(new EnvioLogisticoResponse("env-001", "tx-001", "Enviado",
                        "Correos", "TRK-XYZ-001", "Calle Mayor 1, Madrid"));

        mockMvc.perform(put("/api/envios/env-001/tracking")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id_envio").value("env-001"))
                .andExpect(jsonPath("$.estado_envio").value("Enviado"))
                .andExpect(jsonPath("$.tracking_number").value("TRK-XYZ-001"));
    }

    @Test
    void testActualizarTracking_TokenExpirado_DeberiaRetornar401() throws Exception {
        String expiredToken = TestJwtUtils.generateExpiredToken("admin-user");
        ActualizacionTrackingRequest req = new ActualizacionTrackingRequest("Enviado", null, null);

        mockMvc.perform(put("/api/envios/env-001/tracking")
                        .header("Authorization", "Bearer " + expiredToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value(401));
    }
}
