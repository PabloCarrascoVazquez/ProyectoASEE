import json
import jwt
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
import pytest
from app.core.config import settings

class TestHealthCheckRoute:
    def test_health_check(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()
        assert data["service"] == settings.PROJECT_NAME
        assert data["version"] == settings.VERSION
        assert data["status"] == "running"


class TestCatalogPublicRoutes:
    def test_get_festivales_success(self, client, seed_db):
        response = client.get("/api/festivales")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["id_festival"] == seed_db
        assert data[0]["nombre"] == "Festival Test"

    def test_get_festivales_internal_error(self, client):
        with patch("app.services.catalog_service.CatalogService.get_all_festivales", side_effect=Exception("DB Down")):
            response = client.get("/api/festivales")
            assert response.status_code == 500
            data = response.get_json()
            assert data["codigo"] == 500
            assert "DB Down" in data["detalle"]

    def test_get_espacios_success(self, client, seed_db):
        response = client.get(f"/api/festivales/{seed_db}/espacios")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["tipo"] == "foodtruck"

    def test_get_entradas_success(self, client, seed_db):
        response = client.get(f"/api/festivales/{seed_db}/entradas")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["tipo"] == "weekend"
        assert data[0]["disponibles"] == 100


class TestCatalogProtectedRoutes:
    def test_bloquear_entradas_success(self, client, auth_headers, seed_db):
        payload = {
            "tipo_entrada": "weekend",
            "cantidad": 2
        }
        response = client.post(
            f"/api/festivales/{seed_db}/entradas/bloquear",
            data=json.dumps(payload),
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["bloqueado"] is True
        assert data["tipo_entrada"] == "weekend"

    def test_bloquear_entradas_no_stock(self, client, auth_headers, seed_db):
        payload = {
            "tipo_entrada": "weekend",
            "cantidad": 500 # Más de las 100 disponibles
        }
        response = client.post(
            f"/api/festivales/{seed_db}/entradas/bloquear",
            data=json.dumps(payload),
            headers=auth_headers
        )
        assert response.status_code == 409
        data = response.get_json()
        assert data["codigo"] == 409
        assert "Aforo agotado" in data["detalle"]

    def test_bloquear_entradas_missing_token(self, client, seed_db):
        payload = {"tipo_entrada": "weekend", "cantidad": 2}
        response = client.post(
            f"/api/festivales/{seed_db}/entradas/bloquear",
            data=json.dumps(payload),
            content_type="application/json"
        )
        assert response.status_code == 401
        assert "Falta el token" in response.get_json()["detalle"]

    def test_liberar_entradas_success(self, client, auth_headers, seed_db):
        payload = {"tipo_entrada": "weekend", "cantidad": 2}
        response = client.post(
            f"/api/festivales/{seed_db}/entradas/liberar",
            data=json.dumps(payload),
            headers=auth_headers
        )
        assert response.status_code == 200
        assert "correctamente" in response.get_json()["mensaje"]

    def test_solicitar_alquiler_success(self, client, auth_headers, seed_db):
        payload = {
            "nombre_negocio": "Super Bar",
            "tipo_negocio": "Bebidas",
            "necesita_conexion_electrica": True
        }
        response = client.post(
            "/api/espacios/esp-test-1/alquileres", # Espacio de nuestro seed_db
            data=json.dumps(payload),
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.get_json()
        assert "id_contrato" in data
        assert data["estado"] == "Pendiente de firma"

    def test_solicitar_alquiler_espacio_no_encontrado(self, client, auth_headers):
        payload = {
            "nombre_negocio": "Super Bar",
            "tipo_negocio": "Bebidas"
        }
        response = client.post(
            "/api/espacios/espacio-invalido/alquileres",
            data=json.dumps(payload),
            headers=auth_headers
        )
        assert response.status_code == 404
        assert "no existe" in response.get_json()["detalle"]

    def test_guardar_artista_favorito(self, client, auth_headers, seed_db):
        payload = {
            "id_festival": seed_db,
            "nombre_artista": "Peggy Gou"
        }
        response = client.post(
            "/api/artistas-favoritos",
            data=json.dumps(payload),
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["nombre_artista"] == "Peggy Gou"
        assert "correctamente" in data["mensaje"]