import pytest
from app.dtos.requests import (
    BloqueoCupoRequest,
    AlquilerRequest,
    ArtistaFavoritoRequest
)
from app.dtos.responses import (
    FestivalResponse,
    EspacioResponse,
    BloqueoCupoResponse,
    ErrorResponse
)

class TestDTOs:
    # ==========================================
    # TESTS DE REQUESTS (from_dict)
    # ==========================================
    def test_bloqueo_cupo_request_from_dict(self):
        data = {
            "tipo_entrada": "vip",
            "cantidad": 4
        }
        req = BloqueoCupoRequest.from_dict(data)
        assert req.tipo_entrada == "vip"
        assert req.cantidad == 4

    def test_bloqueo_cupo_request_default_cantidad(self):
        # Probamos que si no envían 'cantidad', se asigne 1 por defecto
        data = {
            "tipo_entrada": "weekend"
        }
        req = BloqueoCupoRequest.from_dict(data)
        assert req.tipo_entrada == "weekend"
        assert req.cantidad == 1

    def test_alquiler_request_from_dict(self):
        data = {
            "nombre_negocio": "Pizza Fun",
            "tipo_negocio": "Restauración",
            "necesita_conexion_electrica": True
        }
        req = AlquilerRequest.from_dict(data)
        assert req.nombre_negocio == "Pizza Fun"
        assert req.tipo_negocio == "Restauración"
        assert req.necesita_conexion_electrica is True

    def test_alquiler_request_default_electrica(self):
        # Probamos que el booleano sea False por defecto
        data = {
            "nombre_negocio": "Camisetas Rock",
            "tipo_negocio": "Merchandising"
        }
        req = AlquilerRequest.from_dict(data)
        assert req.necesita_conexion_electrica is False

    def test_artista_favorito_request_from_dict(self):
        data = {
            "id_festival": "fest_2026",
            "nombre_artista": "Daft Punk"
        }
        req = ArtistaFavoritoRequest.from_dict(data)
        assert req.id_festival == "fest_2026"
        assert req.nombre_artista == "Daft Punk"

    # ==========================================
    # TESTS DE RESPONSES (to_dict)
    # ==========================================
    def test_festival_response_to_dict(self):
        res = FestivalResponse(
            id_festival="fest_1",
            nombre="Fest Test",
            fecha_inicio="2026-07-15",
            fecha_fin="2026-07-18",
            ubicacion="Madrid",
            artistas_destacados=["Peggy Gou", "Carl Cox"]
        )
        data = res.to_dict()
        assert data == {
            "id_festival": "fest_1",
            "nombre": "Fest Test",
            "fecha_inicio": "2026-07-15",
            "fecha_fin": "2026-07-18",
            "ubicacion": "Madrid",
            "artistas_destacados": ["Peggy Gou", "Carl Cox"]
        }

    def test_espacio_response_to_dict(self):
        res = EspacioResponse(
            id_espacio="esp-123",
            tipo="foodtruck",
            metros_cuadrados=15,
            precio_alquiler=1500.0,
            estado="disponible"
        )
        data = res.to_dict()
        assert data["id_espacio"] == "esp-123"
        assert data["precio_alquiler"] == 1500.0
        assert data["estado"] == "disponible"

    def test_bloqueo_cupo_response_to_dict(self):
        res = BloqueoCupoResponse(
            bloqueado=True,
            tipo_entrada="day",
            precio_unitario=50.0
        )
        data = res.to_dict()
        assert data["bloqueado"] is True
        assert data["precio_unitario"] == 50.0

    def test_error_response_to_dict(self):
        res = ErrorResponse(
            codigo=404,
            mensaje="No encontrado",
            detalle="El festival no existe"
        )
        data = res.to_dict()
        assert data == {
            "codigo": 404,
            "mensaje": "No encontrado",
            "detalle": "El festival no existe"
        }