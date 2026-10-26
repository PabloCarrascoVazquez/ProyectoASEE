import pytest
from app.dtos.requests import BloqueoCupoRequest, AlquilerRequest, ArtistaFavoritoRequest
from app.dtos.responses import (
    FestivalResponse,
    EspacioResponse,
    TipoEntradaResponse,
    BloqueoCupoResponse,
    AlquilerResponse,
    ArtistaFavoritoResponse
)

class TestCatalogService:
    def test_get_all_festivales_success(self, catalog_service, seed_db):
        resp_list = catalog_service.get_all_festivales()
        assert len(resp_list) > 0
        assert isinstance(resp_list[0], FestivalResponse)
        # Verificamos que el parseo JSON dentro de model/dao funciona bien hasta llegar al servicio
        assert isinstance(resp_list[0].artistas_destacados, list)

    def test_get_espacios_success(self, catalog_service, seed_db):
        resp_list = catalog_service.get_espacios(seed_db)
        assert len(resp_list) > 0
        assert isinstance(resp_list[0], EspacioResponse)
        assert resp_list[0].tipo == "foodtruck"

    def test_get_entradas_success(self, catalog_service, seed_db):
        resp_list = catalog_service.get_entradas(seed_db)
        assert len(resp_list) > 0
        assert isinstance(resp_list[0], TipoEntradaResponse)
        assert resp_list[0].precio == 125.00

    def test_crear_alquiler_success(self, catalog_service, seed_db):
        req = AlquilerRequest(
            nombre_negocio="Test Negocio",
            tipo_negocio="Restauración",
            necesita_conexion_electrica=False
        )
        # Usamos el id_espacio que sabemos que existe en seed_db
        resp = catalog_service.crear_alquiler("esp-test-1", req)
        
        assert isinstance(resp, AlquilerResponse)
        assert resp.estado == "Pendiente de firma"
        assert len(resp.id_contrato) > 0

    def test_crear_alquiler_espacio_no_encontrado(self, catalog_service):
        req = AlquilerRequest(
            nombre_negocio="Fail Negocio",
            tipo_negocio="Fail",
            necesita_conexion_electrica=True
        )
        # Fallará porque el espacio no existe, forzando un error de Foreign Key en la BD
        with pytest.raises(ValueError, match="ESPACIO_NO_ENCONTRADO"):
            catalog_service.crear_alquiler("esp-inexistente", req)

    def test_bloquear_cupo_success(self, catalog_service, seed_db):
        req = BloqueoCupoRequest(tipo_entrada="weekend", cantidad=3)
        resp = catalog_service.bloquear_cupo(seed_db, req)
        
        assert isinstance(resp, BloqueoCupoResponse)
        assert resp.bloqueado is True
        assert resp.precio_unitario == 125.00

    def test_bloquear_cupo_tipo_invalido(self, catalog_service, seed_db):
        # Solicitamos un tipo de entrada que el festival no vende
        req = BloqueoCupoRequest(tipo_entrada="day", cantidad=1)
        with pytest.raises(ValueError, match="Tipo de entrada no válido"):
            catalog_service.bloquear_cupo(seed_db, req)

    def test_bloquear_cupo_no_stock(self, catalog_service, seed_db):
        # Solicitamos más de las 100 disponibles
        req = BloqueoCupoRequest(tipo_entrada="weekend", cantidad=101)
        with pytest.raises(ValueError, match="NO_STOCK"):
            catalog_service.bloquear_cupo(seed_db, req)

    def test_liberar_cupo_success(self, catalog_service, seed_db):
        req = BloqueoCupoRequest(tipo_entrada="weekend", cantidad=2)
        # Este método no devuelve nada (None) si tiene éxito
        resultado = catalog_service.liberar_cupo(seed_db, req)
        assert resultado is None

    def test_guardar_favorito_success(self, catalog_service, seed_db):
        req = ArtistaFavoritoRequest(id_festival=seed_db, nombre_artista="The Chemical Brothers")
        resp = catalog_service.guardar_favorito("user-999", req)
        
        assert isinstance(resp, ArtistaFavoritoResponse)
        assert resp.nombre_artista == "The Chemical Brothers"
        assert "correctamente" in resp.mensaje