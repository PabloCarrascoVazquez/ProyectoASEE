import pytest
import jwt
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta
from flask import Flask

from app.services.user_service import UserService
from app.services.auth_service import (
    AuthService,
    _extract_token_payload,
    token_required,
    role_required,
)
from app.dtos.requests import (
    UserRegisterRequest,
    UserLoginRequest,
    UserUpdateProfileRequest,
)
from app.dtos.responses import UserProfileResponse, TokenResponse
from app.core.config import settings


class TestUserService:
    def test_register_user_success(self, user_service):
        req = UserRegisterRequest(
            name="Charlie",
            email="charlie@subsonic.com",
            password="SecurePass123!",
            avatar="avatar.png",
            rol="client"
        )
        profile = user_service.register_user(req)
        assert isinstance(profile, UserProfileResponse)
        assert profile.name == "Charlie"
        assert profile.email == "charlie@subsonic.com"
        assert profile.avatar == "avatar.png"
        assert profile.rol == "client"
        assert profile.id is not None

        # Verificar que la contraseña no se almacena en texto plano
        db_user = user_service.user_dao.get_by_email("charlie@subsonic.com")
        assert db_user["password_hash"] != "SecurePass123!"
        assert AuthService.check_password("SecurePass123!", db_user["password_hash"])

    def test_register_user_missing_required_fields(self, user_service):
        with pytest.raises(ValueError, match="obligatorios"):
            user_service.register_user(UserRegisterRequest(name="", email="test@sub.com", password="pass"))

        with pytest.raises(ValueError, match="obligatorios"):
            user_service.register_user(UserRegisterRequest(name="Name", email="", password="pass"))

        with pytest.raises(ValueError, match="obligatorios"):
            user_service.register_user(UserRegisterRequest(name="Name", email="test@sub.com", password=""))

    def test_register_user_duplicate_email(self, user_service):
        req = UserRegisterRequest(
            name="Diana",
            email="diana@subsonic.com",
            password="pass"
        )
        user_service.register_user(req)
        with pytest.raises(ValueError, match="EMAIL_ALREADY_EXISTS"):
            user_service.register_user(req)

    def test_get_profile_success(self, user_service, registered_user):
        profile = user_service.get_profile(registered_user.id)
        assert profile.id == registered_user.id
        assert profile.name == registered_user.name
        assert profile.email == registered_user.email

    def test_get_profile_not_found(self, user_service):
        with pytest.raises(ValueError, match="USER_NOT_FOUND"):
            user_service.get_profile("non-existing-user-id")

    def test_update_profile_success(self, user_service, registered_user):
        update_req = UserUpdateProfileRequest(
            name="Laura Updated",
            avatar="https://bucket.com/new_avatar.png"
        )
        updated = user_service.update_profile(registered_user.id, update_req)
        assert updated.name == "Laura Updated"
        assert updated.avatar == "https://bucket.com/new_avatar.png"

        # Comprobar en BD
        db_row = user_service.user_dao.get_by_id(registered_user.id)
        assert db_row["name"] == "Laura Updated"
        assert db_row["avatar"] == "https://bucket.com/new_avatar.png"

    def test_update_profile_not_found(self, user_service):
        with pytest.raises(ValueError, match="USER_NOT_FOUND"):
            user_service.update_profile("non-existing-id", UserUpdateProfileRequest(name="New"))


class TestAuthService:
    def test_hash_and_check_password(self):
        pwd = "MySecretPassword123"
        hashed = AuthService.hash_password(pwd)
        assert hashed != pwd
        assert AuthService.check_password(pwd, hashed) is True
        assert AuthService.check_password("WrongPassword", hashed) is False

    def test_generate_token(self):
        token = AuthService.generate_token(user_id="user-999", role="admin")
        assert isinstance(token, str)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["user_id"] == "user-999"
        assert payload["sub"] == "user-999"
        assert payload["role"] == "admin"
        assert "exp" in payload
        assert "iat" in payload

    def test_login_success(self, auth_service, sample_user_data, user_service):
        # Registrar primero al usuario
        user_service.register_user(UserRegisterRequest.from_dict(sample_user_data))

        login_req = UserLoginRequest(
            email=sample_user_data["email"],
            password=sample_user_data["password"]
        )
        token_res = auth_service.login(login_req)

        assert isinstance(token_res, TokenResponse)
        assert token_res.access_token is not None
        assert token_res.token_type == "bearer"
        assert token_res.user.email == sample_user_data["email"]

    def test_login_empty_credentials(self, auth_service):
        with pytest.raises(ValueError, match="Credenciales incorrectas"):
            auth_service.login(UserLoginRequest(email="", password="password"))

        with pytest.raises(ValueError, match="Credenciales incorrectas"):
            auth_service.login(UserLoginRequest(email="test@sub.com", password=""))

    def test_login_invalid_email(self, auth_service):
        req = UserLoginRequest(email="nonexistent@sub.com", password="password")
        with pytest.raises(ValueError, match="Credenciales incorrectas"):
            auth_service.login(req)

    def test_login_invalid_password(self, auth_service, sample_user_data, user_service):
        user_service.register_user(UserRegisterRequest.from_dict(sample_user_data))
        req = UserLoginRequest(email=sample_user_data["email"], password="WrongPassword!")
        with pytest.raises(ValueError, match="Credenciales incorrectas"):
            auth_service.login(req)

    def test_login_without_dao(self):
        service = AuthService(user_dao=None)
        req = UserLoginRequest(email="test@sub.com", password="password")
        with pytest.raises(ValueError, match="DAO_NOT_CONFIGURED"):
            service.login(req)


class TestAuthMiddlewareFunctions:
    def test_extract_token_payload_no_header(self, app):
        with app.test_request_context():
            payload, err = _extract_token_payload()
            assert payload is None
            assert err[1] == 401
            assert "Token inexistente" in err[0]["message"]

    def test_extract_token_payload_invalid_token(self, app):
        with app.test_request_context(headers={"Authorization": "Bearer invalid.token.xyz"}):
            payload, err = _extract_token_payload()
            assert payload is None
            assert err[1] == 401
            assert "Token inválido" in err[0]["message"]

    def test_extract_token_payload_expired_token(self, app):
        now = datetime.now(timezone.utc)
        expired_token = jwt.encode(
            {"user_id": "u1", "exp": now - timedelta(hours=1)},
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        with app.test_request_context(headers={"Authorization": f"Bearer {expired_token}"}):
            payload, err = _extract_token_payload()
            assert payload is None
            assert err[1] == 401
            assert "El token ha expirado" in err[0]["message"]

    def test_extract_token_payload_generic_decode_error(self, app):
        with app.test_request_context(headers={"Authorization": "Bearer good_format"}):
            with patch("jwt.decode", side_effect=Exception("Unexpected jwt decode error")):
                payload, err = _extract_token_payload()
                assert payload is None
                assert err[1] == 401
                assert "Error en autenticación" in err[0]["message"]

    def test_token_required_decorator(self, app):
        @app.route("/test-token-req")
        @token_required
        def dummy_route(current_user_id):
            return {"user_id": current_user_id}, 200

        client = app.test_client()

        # Without token
        res_no_tok = client.get("/test-token-req")
        assert res_no_tok.status_code == 401

        # With valid token
        now = datetime.now(timezone.utc)
        token = jwt.encode({"user_id": "usr-123", "exp": now + timedelta(hours=1)}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        res_ok = client.get("/test-token-req", headers={"Authorization": f"Bearer {token}"})
        assert res_ok.status_code == 200
        assert res_ok.get_json()["user_id"] == "usr-123"

    def test_role_required_decorator_missing_token(self, app):
        @app.route("/test-role-missing-tok")
        @role_required("admin")
        def admin_route(current_user_id):
            return {"ok": True}, 200

        client = app.test_client()
        res = client.get("/test-role-missing-tok")
        assert res.status_code == 401

