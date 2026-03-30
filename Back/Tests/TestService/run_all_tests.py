import subprocess
import sys
import os

# Lista de archivos de prueba de servicios
service_tests = [
    "user_test.py",
    "merch_test.py",
    "vendor_test.py",
    "event_test.py",
    "ticket_test.py"
]

def run_services_suite():
    print("="*60)
    print("🚀 SUBSONIC - EXECUTOR DE PRUEBAS DE SERVICIOS (LÓGICA)")
    print("="*60)
    
    python_exe = sys.executable
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Subimos niveles para encontrar la raíz 'Back'
    # Estamos en Tests/TestService -> Tests -> Back
    project_root = os.path.abspath(os.path.join(current_dir, "../../"))
    
    # --- LIMPIEZA DE BÚNKER (Reset de DB) ---
    db_file = os.path.join(project_root, "subsonic.db")
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print("🧹 Reset de Base de Datos: OK (Iniciando con entorno limpio)")
        except Exception as e:
            print(f"⚠️ Nota: No se pudo borrar la DB ({e}), los tests usarán datos existentes.")

    # Configuración del entorno Python
    env = os.environ.copy()
    env["PYTHONPATH"] = project_root + os.pathsep + env.get("PYTHONPATH", "")

    passed = 0
    failed = 0

    for test in service_tests:
        test_path = os.path.join(current_dir, test)
        if not os.path.exists(test_path):
            print(f"❓ Saltando {test}: Archivo no encontrado.")
            continue
            
        print(f"\n▶️  Validando lógica en: {test}...")
        
        # Ejecutamos el test individual
        result = subprocess.run([python_exe, test_path], capture_output=False, env=env)
        
        if result.returncode == 0:
            print(f"✅ {test} PASADO")
            passed += 1
        else:
            print(f"❌ {test} FALLADO (Código: {result.returncode})")
            failed += 1

    print("\n" + "="*60)
    print("📊 RESUMEN DE LÓGICA DE NEGOCIO")
    print("="*60)
    print(f"✅ Servicios validados:  {passed}")
    print(f"❌ Errores detectados:   {failed}")
    print("="*60)
    
    if failed == 0:
        print("🏆 ¡LISTO PARA EL LANZAMIENTO! Todos los servicios responden correctamente.")
    else:
        print("🛠️  REVISIÓN NECESARIA: Algunos servicios tienen errores de lógica.")

if __name__ == "__main__":
    run_services_suite()