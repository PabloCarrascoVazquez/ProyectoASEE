from app.services.user_service import UserService

service = UserService()

try:
    print("🚀 Probando Registro Real...")
    new_id = service.register_user("Juan Pro", "juan@subsonic.com", "mi_password_segura")
    print(f"✅ Usuario registrado con ID: {new_id}")

    print("\n🔑 Probando Login...")
    user = service.authenticate_user("juan@subsonic.com", "mi_password_segura")
    if user:
        print(f"✅ Login exitoso para: {user['name']}")
    else:
        print("❌ Credenciales incorrectas.")

except Exception as e:
    print(f"❌ Error en el servicio: {e}")