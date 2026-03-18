import subprocess
import sys
import os

test_files = [
    "test_users_db.py",
    "test_events_db.py",
    "test_tickets_db.py",
    "test_purchase_integrity.py",
    "test_merch_db.py",
    "test_artists_db.py",
    "test_vendors_db.py"
]

def run_tests():
    print("="*60)
    print("🏗️  EJECUTOR INTEGRAL DE PRUEBAS - PROYECTO SUBSONIC")
    print("="*60)
    
    python_exe = sys.executable
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../../"))
    
    # --- LIMPIEZA PREVIA ---
    db_file = os.path.join(project_root, "subsonic.db")
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print("🧹 Base de datos antigua borrada. Iniciando tests limpios...")
        except Exception as e:
            print(f"⚠️ No se pudo borrar la DB: {e}. Los tests podrían fallar por datos duplicados.")

    env = os.environ.copy()
    env["PYTHONPATH"] = project_root + os.pathsep + env.get("PYTHONPATH", "")

    passed_files = 0
    failed_files = 0

    for test in test_files:
        test_path = os.path.join(current_dir, test)
        if not os.path.exists(test_path):
            continue
            
        print(f"\n▶️  Ejecutando: {test}...")
        result = subprocess.run([python_exe, test_path], capture_output=False, env=env)
        
        if result.returncode == 0:
            print(f"✅ {test} finalizado con éxito.")
            passed_files += 1
        else:
            print(f"❌ {test} falló.")
            failed_files += 1

    print("\n" + "="*60)
    print("📊 RESUMEN FINAL DE LA SUITE DE PRUEBAS")
    print("="*60)
    print(f"✅ Suites superadas:  {passed_files}")
    print(f"❌ Suites fallidas:   {failed_files}")
    print("="*60)

if __name__ == "__main__":
    run_tests()