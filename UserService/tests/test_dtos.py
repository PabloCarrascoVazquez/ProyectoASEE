import pytest
from app.dtos.requests import (
    UserRegisterRequest,
    UserLoginRequest,
    UserUpdateProfileRequest,
)
from app.dtos.responses import UserProfileResponse, TokenResponse


class TestDTOs:
    def test_user_register_request_from_dict(self):
        data = {
            "name": "Maria",
            "email": "maria@example.com",
            "password": "pass",
            "avatar": "http://avatar.url/img.png",
            "rol": "admin"
        }
        req = UserRegisterRequest.from_dict(data)
        assert req.name == "Maria"
        assert req.email == "maria@example.com"
        assert req.password == "pass"
        assert req.avatar == "http://avatar.url/img.png"
        assert req.rol == "admin"

    def test_user_register_request_default_role(self):
        data = {
            "name": "Maria",
            "email": "maria@example.com",
            "password": "pass"
        }
        req = UserRegisterRequest.from_dict(data)
        assert req.rol == "client"
        assert req.avatar is None

    def test_user_login_request_from_dict(self):
        data = {
            "email": "login@example.com",
            "password": "password123"
        }
        req = UserLoginRequest.from_dict(data)
        assert req.email == "login@example.com"
        assert req.password == "password123"

    def test_user_update_profile_request_from_dict(self):
        data = {
            "name": "New Name",
            "avatar": "new_avatar.jpg"
        }
        req = UserUpdateProfileRequest.from_dict(data)
        assert req.name == "New Name"
        assert req.avatar == "new_avatar.jpg"

    def test_user_profile_response_to_dict(self):
        res = UserProfileResponse(
            id="uid-1",
            name="Alex",
            email="alex@subsonic.com",
            rol="supplier",
            avatar="alex.png"
        )
        data = res.to_dict()
        assert data == {
            "id": "uid-1",
            "name": "Alex",
            "email": "alex@subsonic.com",
            "avatar": "alex.png",
            "rol": "supplier"
        }

    def test_token_response_to_dict_with_user(self):
        user_res = UserProfileResponse(
            id="uid-1",
            name="Alex",
            email="alex@subsonic.com",
            rol="client"
        )
        token_res = TokenResponse(
            access_token="jwt.token.here",
            user=user_res,
            token_type="bearer"
        )
        d = token_res.to_dict()
        assert d["access_token"] == "jwt.token.here"
        assert d["token_type"] == "bearer"
        assert d["user"] == {
            "id": "uid-1",
            "name": "Alex",
            "email": "alex@subsonic.com",
            "avatar": None,
            "rol": "client"
        }

    def test_token_response_to_dict_without_user(self):
        token_res = TokenResponse(
            access_token="jwt.token.only",
            user=None
        )
        d = token_res.to_dict()
        assert d["access_token"] == "jwt.token.only"
        assert d["user"] is None

