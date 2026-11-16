import json
import jwt
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
import pytest
from app.core.config import settings
from app.services.auth_service import token_required, role_required


class TestHealthCheckRoute:
    def test_health_check(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()
        assert data["service"] == settings.PROJECT_NAME
        assert data["version"] == settings.VERSION
        assert data["status"] == "running"


class TestAuthRegisterRoute:
    def test_register_success(self, client, sample_user_data):
        response = client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json"
        )
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["name"] == sample_user_data["name"]
        assert data["email"] == sample_user_data["email"]
        assert data["rol"] == sample_user_data["rol"]
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_empty_json(self, client):
        response = client.post(
            "/auth/register",
            data="",
            content_type="application/json"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["codigo"] == 400

    def test_register_missing_fields(self, client):
        response = client.post(
            "/auth/register",
            data=json.dumps({"name": "Test"}),
            content_type="application/json"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["codigo"] == 400

    def test_register_duplicate_email(self, client, sample_user_data):
        client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json"
        )
        response = client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json"
        )
        assert response.status_code == 409
        data = response.get_json()
        assert data["codigo"] == 409
        assert "email ya está registrado" in data["detalle"]

    def test_register_internal_server_error(self, client, sample_user_data):
        with patch("app.services.user_service.UserService.register_user", side_effect=Exception("Database failure")):
            response = client.post(
                "/auth/register",
                data=json.dumps(sample_user_data),
                content_type="application/json"
            )
            assert response.status_code == 500
            data = response.get_json()
            assert data["codigo"] == 500
            assert "Database failure" in data["detalle"]


class TestAuthLoginRoute:
    def test_login_success(self, client, sample_user_data):
        client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json"
        )

        response = client.post(
            "/auth/login",
            data=json.dumps({
                "email": sample_user_data["email"],
                "password": sample_user_data["password"]
            }),
            content_type="application/json"
        )
        assert response.status_code == 200
        data = response.get_json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == sample_user_data["email"]

    def test_login_invalid_password(self, client, sample_user_data):
        client.post(
            "/auth/register",
            data=json.dumps(sample_user_data),
            content_type="application/json"
        )

        response = client.post(
            "/auth/login",
            data=json.dumps({
                "email": sample_user_data["email"],
                "password": "wrongpassword"
            }),
            content_type="application/json"
        )
        assert response.status_code == 401
        data = response.get_json()
        assert data["codigo"] == 401
        assert "Credenciales incorrectas" in data["detalle"]

    def test_login_unregistered_email(self, client):
        response = client.post(
            "/auth/login",
            data=json.dumps({
                "email": "notfound@subsonic.com",
                "password": "password"
            }),
            content_type="application/json"
        )
        assert response.status_code == 401
        data = response.get_json()
        assert data["codigo"] == 401

    def test_login_empty_body(self, client):
        response = client.post(
            "/auth/login",
            data="",
            content_type="application/json"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["codigo"] == 400

    def test_login_other_value_error(self, client):
        with patch("app.services.auth_service.AuthService.login", side_effect=ValueError("INVALID_FORMAT")):
            response = client.post(
                "/auth/login",
                data=json.dumps({"email": "valid@email.com", "password": "pass"}),
                content_type="application/json"
            )
            assert response.status_code == 400
            data = response.get_json()
            assert data["codigo"] == 400
            assert "INVALID_FORMAT" in data["detalle"]

    def test_login_internal_error(self, client):
        with patch("app.services.auth_service.AuthService.login", side_effect=Exception("Auth error")):
            response = client.post(
                "/auth/login",
                data=json.dumps({"email": "valid@email.com", "password": "pass"}),
                content_type="application/json"
            )
            assert response.status_code == 500
            data = response.get_json()
            assert data["codigo"] == 500


class TestAuthProfileRoute:
    def test_get_profile_success(self, client, auth_headers, registered_user):
        response = client.get("/auth/perfil", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == registered_user.id
        assert data["email"] == registered_user.email
        assert data["name"] == registered_user.name

    def test_get_profile_missing_token(self, client):
        response = client.get("/auth/perfil")
        assert response.status_code == 401
        data = response.get_json()
        assert data["codigo"] == 401
        assert "Falta el token Bearer" in data["detalle"]

    def test_get_profile_malformed_token_header(self, client):
        response = client.get(
            "/auth/perfil",
            headers={"Authorization": "Basic dXNlcjpwYXNz"}
        )
        assert response.status_code == 401
        data = response.get_json()
        assert data["codigo"] == 401

    def test_get_profile_invalid_token(self, client):
        response = client.get(
            "/auth/perfil",
            headers={"Authorization": "Bearer invalid.jwt.token"}
        )
        assert response.status_code == 401
        data = response.get_json()
        assert "Token inválido" in data["detalle"]

    def test_get_profile_expired_token(self, client, registered_user):
        now = datetime.now(timezone.utc)
        expired_payload = {
            "sub": registered_user.id,
            "user_id": registered_user.id,
            "role": registered_user.rol,
            "exp": now - timedelta(minutes=10),
            "iat": now - timedelta(minutes=20)
        }
        expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        response = client.get(
            "/auth/perfil",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == 401
        data = response.get_json()
        assert "Token expirado" in data["detalle"]

    def test_get_profile_user_not_found(self, client):
        now = datetime.now(timezone.utc)
        ghost_payload = {
            "sub": "non-existent-user-id",
            "exp": now + timedelta(hours=1),
            "iat": now
        }
        ghost_token = jwt.encode(ghost_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        response = client.get(
            "/auth/perfil",
            headers={"Authorization": f"Bearer {ghost_token}"}
        )
        assert response.status_code == 404
        data = response.get_json()
        assert data["codigo"] == 404

    def test_get_profile_other_value_error(self, client, auth_headers):
        with patch("app.services.user_service.UserService.get_profile", side_effect=ValueError("INVALID_ID")):
            response = client.get("/auth/perfil", headers=auth_headers)
            assert response.status_code == 400
            data = response.get_json()
            assert data["codigo"] == 400

    def test_get_profile_internal_error(self, client, auth_headers):
        with patch("app.services.user_service.UserService.get_profile", side_effect=Exception("Fatal read error")):
            response = client.get("/auth/perfil", headers=auth_headers)
            assert response.status_code == 500
            data = response.get_json()
            assert data["codigo"] == 500

    def test_update_profile_success(self, client, auth_headers, registered_user):
        update_data = {
            "name": "Laura Modified",
            "avatar": "https://new.bucket/avatar.jpg"
        }
        response = client.put(
            "/auth/perfil",
            data=json.dumps(update_data),
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Laura Modified"
        assert data["avatar"] == "https://new.bucket/avatar.jpg"

        # Verificar que el GET subsiguiente devuelve los datos actualizados
        get_res = client.get("/auth/perfil", headers=auth_headers)
        assert get_res.status_code == 200
        assert get_res.get_json()["name"] == "Laura Modified"

    def test_update_profile_empty_json(self, client, auth_headers):
        response = client.put(
            "/auth/perfil",
            data="",
            headers=auth_headers
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["codigo"] == 400

    def test_update_profile_user_not_found(self, client):
        now = datetime.now(timezone.utc)
        ghost_payload = {
            "sub": "non-existent-user-id",
            "exp": now + timedelta(hours=1),
            "iat": now
        }
        ghost_token = jwt.encode(ghost_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        response = client.put(
            "/auth/perfil",
            data=json.dumps({"name": "Ghost"}),
            headers={"Authorization": f"Bearer {ghost_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 404
        data = response.get_json()
        assert data["codigo"] == 404

    def test_update_profile_other_value_error(self, client, auth_headers):
        with patch("app.services.user_service.UserService.update_profile", side_effect=ValueError("INVALID_DATA")):
            response = client.put(
                "/auth/perfil",
                data=json.dumps({"name": "Test"}),
                headers=auth_headers
            )
            assert response.status_code == 400
            data = response.get_json()
            assert data["codigo"] == 400

    def test_update_profile_internal_error(self, client, auth_headers):
        with patch("app.services.user_service.UserService.update_profile", side_effect=Exception("Fatal write error")):
            response = client.put(
                "/auth/perfil",
                data=json.dumps({"name": "Test"}),
                headers=auth_headers
            )
            assert response.status_code == 500
            data = response.get_json()
            assert data["codigo"] == 500


class TestAuthDecorators:
    def test_auth_service_decorators(self, app):
        """Prueba los decoradores token_required y role_required de auth_service.py"""
        from flask import jsonify

        @app.route("/test-admin")
        @role_required("admin")
        def admin_route(current_user_id):
            return jsonify({"status": "ok", "user_id": current_user_id}), 200

        client = app.test_client()

        now = datetime.now(timezone.utc)
        # Token con rol 'client'
        client_payload = {
            "user_id": "u-client",
            "role": "client",
            "exp": now + timedelta(hours=1),
            "iat": now
        }
        client_token = jwt.encode(client_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

        res_forbidden = client.get(
            "/test-admin",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert res_forbidden.status_code == 403
        assert "No tienes permisos" in res_forbidden.get_json()["message"]

        # Token con rol 'admin'
        admin_payload = {
            "user_id": "u-admin",
            "role": "admin",
            "exp": now + timedelta(hours=1),
            "iat": now
        }
        admin_token = jwt.encode(admin_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

        res_allowed = client.get(
            "/test-admin",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_allowed.status_code == 200
        assert res_allowed.get_json()["user_id"] == "u-admin"

