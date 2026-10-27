package com.subsonic.shipinventoryservice;

import com.subsonic.shipinventoryservice.config.BadRequestException;
import com.subsonic.shipinventoryservice.config.NotFoundException;
import com.subsonic.shipinventoryservice.dao.EnviosDao;
import com.subsonic.shipinventoryservice.dtos.requests.ActualizacionTrackingRequest;
import com.subsonic.shipinventoryservice.dtos.responses.EnvioLogisticoResponse;
import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;
import com.subsonic.shipinventoryservice.services.EnviosService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del servicio EnviosService usando Mockito.
 */
@ExtendWith(MockitoExtension.class)
class EnviosServiceTest {

    @Mock
    private EnviosDao enviosDao;

    private EnviosService enviosService;

    @BeforeEach
    void setUp() {
        enviosService = new EnviosService(enviosDao);
    }

    private EnvioLogistico crearEnvioTest(String id, EstadoEnvio estado) {
        EnvioLogistico envio = new EnvioLogistico();
        envio.setIdEnvio(id);
        envio.setIdPedido("pedido-123");
        envio.setEstadoEnvio(estado);
        envio.setEmpresaTransporte("Correos Express");
        envio.setTrackingNumber("TRK001");
        envio.setDireccionEntrega("Calle Falsa 123, Madrid");
        return envio;
    }

    // ------------------------------------------------------------------ //
    //  listarEnviosPendientes                                             //
    // ------------------------------------------------------------------ //

    @Test
    void listarEnviosPendientes_DeberiaRetornarSoloPendientes() {
        when(enviosDao.findPendientes()).thenReturn(List.of(
                crearEnvioTest("env-001", EstadoEnvio.PENDIENTE),
                crearEnvioTest("env-002", EstadoEnvio.PREPARANDO)
        ));

        List<EnvioLogisticoResponse> resultado = enviosService.listarEnviosPendientes();

        assertEquals(2, resultado.size());
        verify(enviosDao, times(1)).findPendientes();
    }

    @Test
    void listarEnviosPendientes_SinEnvios_RetornaListaVacia() {
        when(enviosDao.findPendientes()).thenReturn(List.of());

        List<EnvioLogisticoResponse> resultado = enviosService.listarEnviosPendientes();

        assertTrue(resultado.isEmpty());
    }

    // ------------------------------------------------------------------ //
    //  actualizarTracking                                                  //
    // ------------------------------------------------------------------ //

    @Test
    void actualizarTracking_Exito_EnvioExistenteEstadoValido() {
        EnvioLogistico antes = crearEnvioTest("env-001", EstadoEnvio.PENDIENTE);
        EnvioLogistico despues = crearEnvioTest("env-001", EstadoEnvio.ENVIADO);
        despues.setTrackingNumber("TRK-NUEVO-999");

        when(enviosDao.findById("env-001"))
                .thenReturn(Optional.of(antes))
                .thenReturn(Optional.of(despues));
        when(enviosDao.updateTracking(eq("env-001"), eq(EstadoEnvio.ENVIADO), eq("TRK-NUEVO-999"), isNull()))
                .thenReturn(1);

        ActualizacionTrackingRequest request = new ActualizacionTrackingRequest("Enviado", "TRK-NUEVO-999", null);
        EnvioLogisticoResponse resp = enviosService.actualizarTracking("env-001", request);

        assertEquals("Enviado", resp.getEstadoEnvio());
        assertEquals("TRK-NUEVO-999", resp.getTrackingNumber());
    }

    @Test
    void actualizarTracking_EstadoInvalido_LanzaBadRequestException() {
        ActualizacionTrackingRequest request = new ActualizacionTrackingRequest("EstadoQueNoExiste", null, null);

        assertThrows(BadRequestException.class,
                () -> enviosService.actualizarTracking("env-001", request));

        verify(enviosDao, never()).updateTracking(any(), any(), any(), any());
    }

    @Test
    void actualizarTracking_EnvioNoExiste_LanzaNotFoundException() {
        when(enviosDao.findById("env-x")).thenReturn(Optional.empty());

        ActualizacionTrackingRequest request = new ActualizacionTrackingRequest("Enviado", null, null);

        assertThrows(NotFoundException.class,
                () -> enviosService.actualizarTracking("env-x", request));
    }

    @Test
    void actualizarTracking_ConNotasIncidencia() {
        EnvioLogistico envio = crearEnvioTest("env-inc", EstadoEnvio.PENDIENTE);
        EnvioLogistico conIncidencia = crearEnvioTest("env-inc", EstadoEnvio.INCIDENCIA);
        conIncidencia.setNotasIncidencia("Dirección incorrecta");

        when(enviosDao.findById("env-inc"))
                .thenReturn(Optional.of(envio))
                .thenReturn(Optional.of(conIncidencia));
        when(enviosDao.updateTracking(eq("env-inc"), eq(EstadoEnvio.INCIDENCIA), isNull(), eq("Dirección incorrecta")))
                .thenReturn(1);

        ActualizacionTrackingRequest request =
                new ActualizacionTrackingRequest("Incidencia", null, "Dirección incorrecta");

        EnvioLogisticoResponse resp = enviosService.actualizarTracking("env-inc", request);
        assertEquals("Incidencia", resp.getEstadoEnvio());
    }

    // ------------------------------------------------------------------ //
    //  crearEnvio                                                         //
    // ------------------------------------------------------------------ //

    @Test
    void crearEnvio_LlamaAlDaoYRetornaEnvio() {
        EnvioLogistico envio = crearEnvioTest("env-nuevo", EstadoEnvio.PENDIENTE);

        EnvioLogistico resultado = enviosService.crearEnvio(envio);

        verify(enviosDao, times(1)).save(envio);
        assertEquals("env-nuevo", resultado.getIdEnvio());
        assertEquals(EstadoEnvio.PENDIENTE, resultado.getEstadoEnvio());
    }
}
