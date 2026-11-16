import sqlite3
import pytest
from unittest.mock import MagicMock, patch
try:
    import psycopg2
    PG_ERROR = psycopg2.Error
except ImportError:
    psycopg2 = None
    PG_ERROR = Exception

from app.daos.sqlite_impl.catalog_dao import CatalogDAOSQLite
from app.daos.postgres_impl.catalog_dao import CatalogDAOPostgres
from app.daos.factories import DatabaseConnectionFactory, DAOFactory


class TestCatalogDAOSQLite:
    def test_get_all_festivales(self, catalog_dao, seed_db):
        festivales = catalog_dao.get_all_festivales()
        assert len(festivales) > 0

        fest_mock = next((f for f in festivales if f["id_festival"] == seed_db), None)
        assert fest_mock is not None
        assert fest_mock["nombre"] == "Festival Test"
        assert isinstance(fest_mock["artistas_destacados"], list)

    def test_get_espacios_by_festival(self, catalog_dao, seed_db):
        espacios = catalog_dao.get_espacios_by_festival(seed_db)
        assert len(espacios) > 0
        assert espacios[0]["id_espacio"] == "esp-test-1"
        assert espacios[0]["tipo"] == "foodtruck"

    def test_get_entradas_by_festival(self, catalog_dao, seed_db):
        entradas = catalog_dao.get_entradas_by_festival(seed_db)
        assert len(entradas) > 0
        assert entradas[0]["tipo"] == "weekend"
        assert entradas[0]["disponibles"] == 100

    def test_bloquear_cupo_success(self, catalog_dao, seed_db):
        exito = catalog_dao.bloquear_cupo(seed_db, "weekend", 2)
        assert exito is True

        entradas = catalog_dao.get_entradas_by_festival(seed_db)
        assert entradas[0]["disponibles"] == 98

    def test_bloquear_cupo_fails_no_stock(self, catalog_dao, seed_db):
        exito = catalog_dao.bloquear_cupo(seed_db, "weekend", 200)
        assert exito is False

    def test_liberar_cupo(self, catalog_dao, seed_db):
        exito = catalog_dao.liberar_cupo(seed_db, "weekend", 5)
        assert exito is True

    def test_create_alquiler(self, catalog_dao, seed_db):
        alquiler_data = {
            "id_contrato": "alq-uuid-1234",
            "id_espacio": "esp-test-1",
            "nombre_negocio": "Super Burgers",
            "tipo_negocio": "Restauración",
            "necesita_conexion_electrica": True,
            "estado": "Pendiente de firma",
            "fecha_solicitud": "2026-10-15T18:15:00Z"
        }

        exito = catalog_dao.create_alquiler(alquiler_data)
        assert exito is True

        espacios = catalog_dao.get_espacios_by_festival(seed_db)
        espacio_actualizado = next(e for e in espacios if e["id_espacio"] == "esp-test-1")
        assert espacio_actualizado["estado"] == "alquilado"

    def test_add_artista_favorito(self, catalog_dao, seed_db):
        exito = catalog_dao.add_artista_favorito("user-123", seed_db, "Carl Cox")
        assert exito is True


class TestCatalogDAOPostgres:
    def test_get_all_festivales_postgres(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {"id_festival": "pg-1", "nombre": "Festi Postgres", "artistas_destacados": '["A"]'}
        ]
        mock_conn.cursor.return_value = mock_cursor

        dao = CatalogDAOPostgres(mock_conn)
        res = dao.get_all_festivales()
        assert len(res) == 1
        assert res[0]["id_festival"] == "pg-1"
        assert res[0]["artistas_destacados"] == ["A"]
        assert mock_cursor.close.called

    def test_bloquear_cupo_postgres_success(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor

        dao = CatalogDAOPostgres(mock_conn)
        exito = dao.bloquear_cupo("festi-1", "vip", 2)
        assert exito is True
        assert mock_conn.commit.called
        assert mock_cursor.close.called

    def test_bloquear_cupo_postgres_error_rollback(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = PG_ERROR("Connection error")
        mock_conn.cursor.return_value = mock_cursor

        dao = CatalogDAOPostgres(mock_conn)
        with pytest.raises(PG_ERROR):
            dao.bloquear_cupo("festi-1", "day", 1)

        assert mock_conn.rollback.called
        assert mock_cursor.close.called


class TestFactories:
    def test_sqlite_connection_factory(self, temp_db):
        conn = DatabaseConnectionFactory.get_connection()
        assert isinstance(conn, sqlite3.Connection)
        assert conn.row_factory == sqlite3.Row

    def test_unsupported_engine(self, monkeypatch):
        monkeypatch.setenv("DB_ENGINE", "oracle")
        with pytest.raises(ValueError, match="Motor de base de datos no soportado"):
            DatabaseConnectionFactory.get_connection()

    def test_dao_factory_sqlite(self, temp_db, monkeypatch):
        monkeypatch.setenv("DB_ENGINE", "sqlite")
        dao = DAOFactory.get_catalog_dao()
        assert isinstance(dao, CatalogDAOSQLite)

    def test_dao_factory_postgres(self, monkeypatch):
        monkeypatch.setenv("DB_ENGINE", "postgres")
        with patch.object(DatabaseConnectionFactory, "get_connection") as mock_conn:
            mock_conn.return_value = MagicMock()
            dao = DAOFactory.get_catalog_dao()
            assert isinstance(dao, CatalogDAOPostgres)
