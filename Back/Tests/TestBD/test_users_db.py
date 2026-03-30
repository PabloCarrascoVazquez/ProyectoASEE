import uuid
import traceback
from app.daos.factories import DAOFactory

print("🔥 INICIANDO BATERÍA DE PRUEBAS EXHAUSTIVAS: USER DAO 🔥\n")

user_dao = DAOFactory.get_user_dao()
tests_passed = 0
tests_failed = 0

def assert_test(test_name, condition, success_msg, fail_msg):
    global tests_passed, tests_failed
    if condition:
        print(f"   ✅ [PASS] {test_name}: {success_msg}")
        tests_passed += 1
    else:
        print(f"   ❌ [FAIL] {test_name}: {fail_msg}")
        tests_failed += 1

# ==========================================
# 🧪 PREPARACIÓN DE DATOS BASE
# ==========================================
base_id = str(uuid.uuid4())
base_email = f"perfect_{base_id[:5]}@test.com"

print("--- BLOQUE 1: FUNCIONAMIENTO NORMAL ---")

# TEST 1: Inserción perfecta (Todos los datos)
try:
    user_dao.create({
        "id": base_id,
        "name": "Usuario Perfecto",
        "email": base_email,
        "password_hash": "hash123",
        "avatar": "http://avatar.com/img.png"
    })
    assert_test("Creación Completa", True, "Usuario creado con todos los campos.", "")
except Exception as e:
    assert_test("Creación Completa", False, "", str(e))

# TEST 2: Inserción con campos opcionales vacíos (Avatar = None)
try:
    no_avatar_id = str(uuid.uuid4())
    no_avatar_email = f"no_avatar_{no_avatar_id[:5]}@test.com"
    user_dao.create({
        "id": no_avatar_id,
        "name": "Usuario Sin Avatar",
        "email": no_avatar_email,
        "password_hash": "hash123",
        "avatar": None  # ¡Clave aquí!
    })
    
    # Verificamos que realmente se guardó como NULL/None
    db_user = user_dao.get_by_email(no_avatar_email)
    assert_test("Campos Opcionales (NULL)", db_user['avatar'] is None, "El avatar aceptó y devolvió None correctamente.", "El avatar no es None.")
except Exception as e:
    assert_test("Campos Opcionales (NULL)", False, "", str(e))


print("\n--- BLOQUE 2: SEGURIDAD Y HACKING ---")

# TEST 3: Intento de Inyección SQL (SQLi)
try:
    hacker_id = str(uuid.uuid4())
    # Usamos un email único para que no falle por UNIQUE constraint de ejecuciones previas
    sql_injection_email = f"hacker_{hacker_id[:8]}@test.com' OR '1'='1" 
    
    user_dao.create({
        "id": hacker_id,
        "name": "Robert'); DROP TABLE users;--", 
        "email": sql_injection_email,
        "password_hash": "hack",
        "avatar": None
    })
    
    db_hacker = user_dao.get_by_email(sql_injection_email)
    # Si la consulta parametrizada funcionó, el nombre debe ser el literal de Bobby Tables
    is_safe = db_hacker is not None and db_hacker['name'] == "Robert'); DROP TABLE users;--"
    assert_test("Protección SQL Injection", is_safe, "Consultas parametrizadas (?) OK.", "¡Vulnerabilidad SQLi!")
except Exception as e:
    assert_test("Protección SQL Injection", False, "", str(e))

# TEST 4: Caracteres especiales (Emojis, Tildes y Alfabetos raros)
try:
    emoji_id = str(uuid.uuid4())
    emoji_email = f"emoji_{emoji_id[:5]}@test.com"
    user_dao.create({
        "id": emoji_id,
        "name": "José María 🎸 (テスト)", # Tildes, emojis y japonés
        "email": emoji_email,
        "password_hash": "hash",
        "avatar": None
    })
    db_emoji = user_dao.get_by_email(emoji_email)
    assert_test("Codificación UTF-8", db_emoji['name'] == "José María 🎸 (テスト)", "Guarda y recupera emojis y tildes perfectamente.", "Los caracteres se corrompieron.")
except Exception as e:
    assert_test("Codificación UTF-8", False, "", str(e))


print("\n--- BLOQUE 3: INTEGRIDAD DE LA BASE DE DATOS (RESTRICCIONES) ---")

# TEST 5: Restricción UNIQUE (Email Duplicado)
try:
    duplicate_id = str(uuid.uuid4())
    user_dao.create({
        "id": duplicate_id,
        "name": "Clon Malvado",
        "email": base_email, # Usamos el email del TEST 1
        "password_hash": "hash123",
        "avatar": None
    })
    assert_test("Restricción UNIQUE (Email)", False, "", "¡CRÍTICO! Permitió registrar un email duplicado.")
except Exception as e:
    # Tiene que dar error obligatoriamente
    assert_test("Restricción UNIQUE (Email)", "UNIQUE" in str(e).upper() or "INTEGRITY" in str(e).upper(), f"Bloqueó duplicado exitosamente: {e}", f"Falló por otro motivo: {e}")

# TEST 6: Restricción NOT NULL (Falta un campo obligatorio)
try:
    bad_id = str(uuid.uuid4())
    user_dao.create({
        "id": bad_id,
        "name": None, # ¡El nombre no puede ser nulo!
        "email": f"bad_{bad_id[:5]}@test.com",
        "password_hash": "hash123",
        "avatar": None
    })
    assert_test("Restricción NOT NULL", False, "", "¡CRÍTICO! Permitió guardar un usuario sin nombre.")
except Exception as e:
    assert_test("Restricción NOT NULL", "NOT NULL" in str(e).upper() or "INTEGRITY" in str(e).upper(), f"Bloqueó dato nulo exitosamente: {e}", f"Falló por otro motivo: {e}")


print("\n--- BLOQUE 4: CASOS LÍMITE (EDGE CASES) ---")

# TEST 7: Textos extremadamente largos (Estresando el VARCHAR)
try:
    long_id = str(uuid.uuid4())
    long_email = f"long_{long_id[:5]}@test.com"
    super_long_name = "A" * 255 # Genera un string de 255 'A's
    user_dao.create({
        "id": long_id,
        "name": super_long_name,
        "email": long_email,
        "password_hash": "hash123",
        "avatar": None
    })
    db_long = user_dao.get_by_email(long_email)
    assert_test("Límites VARCHAR", db_long['name'] == super_long_name, "Soporta cadenas de texto en el límite máximo.", "Recortó o corrompió la cadena larga.")
except Exception as e:
    assert_test("Límites VARCHAR", False, "", str(e))


# ==========================================
# 📊 RESUMEN FINAL
# ==========================================
print("\n" + "="*40)
print(f"📊 RESULTADOS DE LA PRUEBA EXHAUSTIVA")
print("="*40)
print(f"Total de pruebas: {tests_passed + tests_failed}")
print(f"✅ Exitosas: {tests_passed}")
print(f"❌ Fallidas: {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ESTADO: LA ARQUITECTURA ES BLINDADA Y LISTA PARA PRODUCCIÓN 🏆")
else:
    print("\n⚠️ ESTADO: HAY VULNERABILIDADES QUE REVISAR ⚠️")