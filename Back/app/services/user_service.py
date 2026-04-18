import uuid
import bcrypt
from app.daos.factories import DAOFactory

class UserService:
    def __init__(self):
        self.user_dao = DAOFactory.get_user_dao()

    def register_user(self, name, email, password, role='user'):
        """
        Lógica de negocio para registrar un nuevo usuario.
        """
        existing_user = self.user_dao.get_by_email(email)
        if existing_user:
            raise ValueError("El correo electrónico ya está registrado.")

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        user_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "password_hash": hashed_password.decode('utf-8'),
            "role": role if role in ('user', 'vendor', 'admin') else 'user',
            "avatar": None
        }

        try:
            self.user_dao.create(user_data)
            return user_data["id"]
        except Exception as e:
            raise Exception(f"Error crítico al guardar el usuario: {str(e)}")

    def authenticate_user(self, email, password):
        """
        Lógica para el Login: Verifica credenciales.
        """
        user = self.user_dao.get_by_email(email)
        if not user:
            return None

        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            del user['password_hash']
            # Aseguramos que siempre haya un role aunque la columna sea antigua
            if 'role' not in user or not user['role']:
                user['role'] = 'user'
            return user

        return None

    def get_user_profile(self, user_id):
        """Devuelve un usuario sin su password_hash."""
        user = self.user_dao.get_by_id(user_id)
        if not user:
            return None
        user.pop('password_hash', None)
        return user

    def update_profile(self, user_id, fields):
        """Actualiza campos del perfil. Ignora password y role por seguridad."""
        safe = {k: v for k, v in fields.items() if k in ('name', 'email', 'avatar')}
        return self.user_dao.update(user_id, safe)
