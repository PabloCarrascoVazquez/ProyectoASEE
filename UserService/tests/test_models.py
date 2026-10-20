import pytest
from app.models.user import User
from app.dtos.requests import UserRegisterRequest, UserUpdateProfileRequest
from app.dtos.responses import UserProfileResponse


class TestUserModel:
    def test_user_creation(self):
        user = User(
            id="user-123",
            name="John Doe",
            email="john@example.com",
            password_hash="hashed_pw",
            rol="client",
            avatar="avatar.png"
        )
        assert user.id == "user-123"
        assert user.name == "John Doe"
        assert user.email == "john@example.com"
        assert user.password_hash == "hashed_pw"
        assert user.rol == "client"
        assert user.avatar == "avatar.png"

    def test_from_register_request_with_defaults(self):
        req = UserRegisterRequest(
            name="Alice",
            email="alice@example.com",
            password="secretpassword",
            avatar=None,
            rol="client"
        )
        user = User.from_register_request(req, password_hash="bcrypt_hash", user_id="id-alice")
        assert user.id == "id-alice"
        assert user.name == "Alice"
        assert user.email == "alice@example.com"
        assert user.password_hash == "bcrypt_hash"
        assert user.rol == "client"
        assert user.avatar is None

    def test_from_register_request_custom_role(self):
        req = UserRegisterRequest(
            name="Admin User",
            email="admin@example.com",
            password="secretpassword",
            avatar="https://img.com/a.png",
            rol="admin"
        )
        user = User.from_register_request(req, password_hash="bcrypt_hash", user_id="id-admin")
        assert user.rol == "admin"
        assert user.avatar == "https://img.com/a.png"

    def test_from_db_row(self):
        row = {
            "id": "uuid-999",
            "name": "Bob",
            "email": "bob@example.com",
            "password_hash": "hashed_pass",
            "rol": "supplier",
            "avatar": "bob.png"
        }
        user = User.from_db_row(row)
        assert user.id == "uuid-999"
        assert user.name == "Bob"
        assert user.email == "bob@example.com"
        assert user.password_hash == "hashed_pass"
        assert user.rol == "supplier"
        assert user.avatar == "bob.png"

    def test_from_db_row_role_fallback(self):
        row = {
            "id": 123,
            "name": "Fallback User",
            "email": "fb@example.com",
            "password_hash": "hash",
            "role": "admin"
        }
        user = User.from_db_row(row)
        assert user.id == "123"
        assert user.rol == "admin"
        assert user.avatar is None

    def test_apply_update_request_partial_name(self):
        user = User(
            id="u1",
            name="Original Name",
            email="orig@example.com",
            password_hash="hash",
            avatar="orig.png"
        )
        update_req = UserUpdateProfileRequest(name="New Name", avatar=None)
        user.apply_update_request(update_req)
        assert user.name == "New Name"
        assert user.avatar == "orig.png"

    def test_apply_update_request_partial_avatar(self):
        user = User(
            id="u1",
            name="Original Name",
            email="orig@example.com",
            password_hash="hash",
            avatar="orig.png"
        )
        update_req = UserUpdateProfileRequest(name=None, avatar="new_avatar.png")
        user.apply_update_request(update_req)
        assert user.name == "Original Name"
        assert user.avatar == "new_avatar.png"

    def test_apply_update_request_both(self):
        user = User(
            id="u1",
            name="Original Name",
            email="orig@example.com",
            password_hash="hash",
            avatar="orig.png"
        )
        update_req = UserUpdateProfileRequest(name="Updated", avatar="updated.png")
        user.apply_update_request(update_req)
        assert user.name == "Updated"
        assert user.avatar == "updated.png"

    def test_to_db_dict(self):
        user = User(
            id="u-42",
            name="Jane",
            email="jane@example.com",
            password_hash="secret_hash",
            rol="client",
            avatar="jane.png"
        )
        data = user.to_db_dict()
        assert data == {
            "id": "u-42",
            "name": "Jane",
            "email": "jane@example.com",
            "password_hash": "secret_hash",
            "avatar": "jane.png",
            "rol": "client"
        }

    def test_to_response_dto(self):
        user = User(
            id="u-42",
            name="Jane",
            email="jane@example.com",
            password_hash="secret_hash",
            rol="client",
            avatar="jane.png"
        )
        dto = user.to_response_dto()
        assert isinstance(dto, UserProfileResponse)
        assert dto.id == "u-42"
        assert dto.name == "Jane"
        assert dto.email == "jane@example.com"
        assert dto.rol == "client"
        assert dto.avatar == "jane.png"
        assert not hasattr(dto, "password_hash")

