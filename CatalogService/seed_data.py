#!/usr/bin/env python3
"""
Script para poblar la base de datos de CatalogService de forma directa o manual.
Uso:
    python seed_data.py          # Puebla si está vacía
    python seed_data.py --force  # Fuerza la inserción
    python seed_data.py --reset  # Borra y repuebla desde cero
"""

import os
import sys

# Aseguramos que la raíz de CatalogService esté en sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.daos.factories import DatabaseConnectionFactory, SEED_DATA

def main():
    force = "--force" in sys.argv
    reset = "--reset" in sys.argv

    engine = os.getenv("DB_ENGINE", "sqlite").lower()
    print(f"🚀 Iniciando poblado de base de datos de Catálogo (Motor: {engine.upper()})...")

    conn = DatabaseConnectionFactory.get_connection()

    if reset:
        print("🧹 Limpiando tablas existentes...")
        cursor = conn.cursor()
        tablas = ["Artistas_Favoritos", "Alquileres", "Espacios", "Tipos_Entrada", "Festivales", "Artistas"]
        for tabla in tablas:
            try:
                cursor.execute(f"DELETE FROM {tabla}")
            except Exception as e:
                print(f"  Aviso al limpiar {tabla}: {e}")
        conn.commit()
        cursor.close()
        force = True

    DatabaseConnectionFactory.seed_sample_data(conn, engine, force=force)

    # Imprimir resumen de los datos
    cursor = conn.cursor()
    print("\n📊 Resumen del Catálogo poblado:")
    for tabla in ["Festivales", "Tipos_Entrada", "Espacios", "Alquileres", "Artistas", "Artistas_Favoritos"]:
        cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
        cnt = cursor.fetchone()[0]
        print(f"  - {tabla}: {cnt} registros")
    cursor.close()

    print("\n✨ Proceso de poblado finalizado con éxito.")

if __name__ == "__main__":
    main()
