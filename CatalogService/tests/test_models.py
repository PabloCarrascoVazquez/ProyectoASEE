import pytest
import json
from app.models.catalog import Festival, Espacio, TipoEntrada, Alquiler, ArtistaFavorito
from app.dtos.requests import AlquilerRequest, ArtistaFavoritoRequest
from app.dtos.responses import (
    FestivalResponse,
    EspacioResponse,
    TipoEntradaResponse,
    AlquilerResponse,
    ArtistaFavoritoResponse
)

class TestFestivalModel:
    def test_festival_creation(self):
        fest = Festival(
            id_festival="f-1",
            nombre="Summer Fest",
            fecha_inicio="2026-06-01",
            fecha_fin="2026-06-03",
            ubicacion="Playa",
            artistas_destacados=["DJ 1", "DJ 2"]
        )
        assert fest.id_festival == "f-1"
        assert fest.nombre == "Summer Fest"
        assert len(fest.artistas_destacados) == 2

    def test_from_db_row_with_json_string(self):
        row = {
            "id_festival": "f-2",
            "nombre": "Rock Fest",
            "fecha_inicio": "2026-08-01",
            "fecha_fin": "2026-08-02",
            "ubicacion": "Montaña",
            "artistas_destacados": '["Banda A", "Banda B"]'
        }
        fest = Festival.from_db_row(row)
        assert isinstance(fest.artistas_destacados, list)
        assert fest.artistas_destacados[0] == "Banda A"

    def test_from_db_row_with_invalid_json_fallback(self):
        row = {
            "id_festival": "f-3",
            "nombre": "Indie Fest",
            "fecha_inicio": "2026-09-01",
            "fecha_fin": "2026-09-02",
            "ubicacion": "Ciudad",
            "artistas_destacados": "no-es-json-valido"
        }
        fest = Festival.from_db_row(row)
        assert fest.artistas_destacados == [] # Debe fallar de forma segura y devolver array vacío

    def test_to_response_dto(self):
        fest = Festival("f-1", "Name", "2026-01-01", "2026-01-02", "Loc", [])
        dto = fest.to_response_dto()
        assert isinstance(dto, FestivalResponse)
        assert dto.id_festival == "f-1"


class TestEspacioModel:
    def test_from_db_row(self):
        row = {
            "id_espacio": "esp-1",
            "id_festival": "f-1",
            "tipo": "foodtruck",
            "metros_cuadrados": 20,
            "precio_alquiler": 500.50,
            "estado": "disponible"
        }
        espacio = Espacio.from_db_row(row)
        assert espacio.id_espacio == "esp-1"
        assert espacio.metros_cuadrados == 20
        assert espacio.precio_alquiler == 500.50

    def test_to_response_dto(self):
        espacio = Espacio("esp-1", "f-1", "vip", 50, 1000.0, "reservado")
        dto = espacio.to_response_dto()
        assert isinstance(dto, EspacioResponse)
        assert dto.estado == "reservado"
        # Comprobamos que no expone el id_festival porque no está en el DTO
        assert not hasattr(dto, "id_festival")


class TestTipoEntradaModel:
    def test_from_db_row(self):
        row = {"tipo": "weekend", "precio": 120.0, "disponibles": 500}
        entrada = TipoEntrada.from_db_row(row)
        assert entrada.tipo == "weekend"
        assert entrada.precio == 120.0
        assert entrada.disponibles == 500

    def test_to_response_dto(self):
        entrada = TipoEntrada("weekend", 120.0, 500)
        dto = entrada.to_response_dto()
        assert isinstance(dto, TipoEntradaResponse)


class TestAlquilerModel:
    def test_from_alquiler_request(self):
        req = AlquilerRequest(
            nombre_negocio="Burger Spot",
            tipo_negocio="Comida",
            necesita_conexion_electrica=True
        )
        alquiler = Alquiler.from_alquiler_request(req, id_espacio="esp-99")
        
        # Verificamos campos autogenerados
        assert alquiler.id_espacio == "esp-99"
        assert len(alquiler.id_contrato) > 20 # Es un UUID largo
        assert alquiler.estado == "Pendiente de firma"
        assert "Z" in alquiler.fecha_solicitud

    def test_to_db_dict(self):
        alquiler = Alquiler("cnt-1", "esp-1", "Shop", "Retail", False, "FIRMADO", "2026-10-10T10:00:00Z")
        data = alquiler.to_db_dict()
        assert data["id_contrato"] == "cnt-1"
        assert data["estado"] == "FIRMADO"
        assert data["necesita_conexion_electrica"] is False

    def test_to_response_dto(self):
        alquiler = Alquiler("cnt-1", "esp-1", "Shop", "Retail", False, "FIRMADO", "2026-10-10T10:00:00Z")
        dto = alquiler.to_response_dto()
        assert isinstance(dto, AlquilerResponse)
        assert dto.id_contrato == "cnt-1"
        # El frontend no necesita saber el nombre del negocio de nuevo
        assert not hasattr(dto, "nombre_negocio")


class TestArtistaFavoritoModel:
    def test_from_request(self):
        req = ArtistaFavoritoRequest(id_festival="f-1", nombre_artista="Daft Punk")
        fav = ArtistaFavorito.from_request(req, user_id="u-123")
        
        assert fav.user_id == "u-123"
        assert fav.id_festival == "f-1"
        assert fav.nombre_artista == "Daft Punk"

    def test_to_response_dto(self):
        fav = ArtistaFavorito("u-123", "f-1", "Daft Punk")
        dto = fav.to_response_dto()
        assert isinstance(dto, ArtistaFavoritoResponse)
        assert dto.nombre_artista == "Daft Punk"
        assert "correctamente" in dto.mensaje