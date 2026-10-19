import uuid
import bcrypt
from app.models.user import User
from app.dtos.requests import UserRegisterRequest, UserUpdateProfileRequest
from app.dtos.responses import UserProfileResponse

class UserService:
    def __init__(self, user_dao):
        self.user_dao = user_dao

    def register_user(self, request: UserRegisterRequest) -> UserProfileResponse:
        """Crea un nuevo usuario asegurando que el email no exista."""
        if self.user_dao.get_by_email(request.email):
            raise ValueError("EMAIL_ALREADY_EXISTS")

        # Hashear la nueva contraseña
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(request.password.encode("utf-8"), salt).decode("utf-8")

        # Crear y guardar modelo
        new_user = User.from_register_request(request, password_hash, str(uuid.uuid4()))
        self.user_dao.create(new_user.to_db_dict())

        return new_user.to_response_dto()

    def get_profile(self, user_id: str) -> UserProfileResponse:
        """Recupera el perfil público de un usuario."""
        user_row = self.user_dao.get_by_id(user_id)
        if not user_row:
            raise ValueError("USER_NOT_FOUND")
            
        user = User.from_db_row(user_row)
        return user.to_response_dto()

    def update_profile(self, user_id: str, request: UserUpdateProfileRequest) -> UserProfileResponse:
        """Aplica la actualización de perfil y guarda en BD."""
        user_row = self.user_dao.get_by_id(user_id)
        if not user_row:
            raise ValueError("USER_NOT_FOUND")

        user = User.from_db_row(user_row)
        user.apply_update_request(request)

        # Preparar diccionario solo con lo que se puede actualizar
        fields_to_update = {"name": user.name, "avatar": user.avatar}
        self.user_dao.update(user.id, fields_to_update)

        return user.to_response_dto()