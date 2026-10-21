package com.subsonic.purchaseservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.purchaseservice.controllers.PurchaseController;
import com.subsonic.purchaseservice.dtos.requests.ConfirmacionPagoRequest;
import com.subsonic.purchaseservice.dtos.requests.DireccionEnvioRequest;
import com.subsonic.purchaseservice.dtos.requests.ItemEntradaRequest;
import com.subsonic.purchaseservice.dtos.requests.ReservaCarritoCompletoRequest;
import com.subsonic.purchaseservice.dtos.responses.ReservaResponse;
import com.subsonic.purchaseservice.dtos.responses.TransaccionResponse;
import com.subsonic.purchaseservice.services.PurchaseOrchestratorService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PurchaseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PurchaseOrchestratorService orchestratorService;

    @Test
    void testIniciarCompra_Unauthorized_WithoutToken() throws Exception {
        ReservaCarritoCompletoRequest request = new ReservaCarritoCompletoRequest(
                "fest_subsonic_2026",
                List.of(new ItemEntradaRequest("weekend", 1)),
                null,
                null
        );

        mockMvc.perform(post("/api/compras/carrito/iniciar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value(401))
                .andExpect(jsonPath("$.mensaje").value("Acceso no autorizado"));
    }

    @Test
    void testIniciarCompra_Unauthorized_ExpiredToken() throws Exception {
        String expiredToken = TestJwtUtils.generateExpiredToken("usr-expired");

        ReservaCarritoCompletoRequest request = new ReservaCarritoCompletoRequest(
                "fest_subsonic_2026",
                List.of(new ItemEntradaRequest("weekend", 1)),
                null,
                null
        );

        mockMvc.perform(post("/api/compras/carrito/iniciar")
                        .header("Authorization", "Bearer " + expiredToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value(401));
    }

    @Test
    void testIniciarCompra_Success_ValidToken() throws Exception {
        String validToken = TestJwtUtils.generateToken("usr-test-123");

        ReservaCarritoCompletoRequest request = new ReservaCarritoCompletoRequest(
                "fest_subsonic_2026",
                List.of(new ItemEntradaRequest("weekend", 2)),
                null,
                null
        );

        ReservaResponse expectedResponse = new ReservaResponse(
                "tx-test-9999",
                "PENDING",
                "2026-10-15T18:22:00Z",
                "EUR",
                BigDecimal.valueOf(250.00)
        );

        when(orchestratorService.iniciarReserva(any(), eq("usr-test-123"), any()))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/compras/carrito/iniciar")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id_transaccion").value("tx-test-9999"))
                .andExpect(jsonPath("$.estado").value("PENDING"))
                .andExpect(jsonPath("$.moneda").value("EUR"))
                .andExpect(jsonPath("$.total_pagar").value(250.00));
    }

    @Test
    void testConfirmarPago_Success() throws Exception {
        String validToken = TestJwtUtils.generateToken("usr-test-123");
        ConfirmacionPagoRequest request = new ConfirmacionPagoRequest("tarjeta", "tok_valid_123");

        TransaccionResponse expectedResponse = new TransaccionResponse(
                "tx-test-9999",
                "PAID",
                BigDecimal.valueOf(250.00),
                "https://pagos.subsonic.com/recibos/tx-test-9999",
                "2026-10-15T18:15:30Z"
        );

        when(orchestratorService.confirmarPago(eq("tx-test-9999"), any(), eq("usr-test-123"), any()))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/compras/tx-test-9999/pagar")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id_transaccion").value("tx-test-9999"))
                .andExpect(jsonPath("$.estado").value("PAID"))
                .andExpect(jsonPath("$.total_cobrado").value(250.00))
                .andExpect(jsonPath("$.recibo_url").value("https://pagos.subsonic.com/recibos/tx-test-9999"));
    }
}

