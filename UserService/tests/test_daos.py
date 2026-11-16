import os
import sqlite3
import pytest
from unittest.mock import MagicMock, patch
import psycopg2

from app.daos.sqlite_impl.user_dao import UserDAOSQLite
from app.daos.postgres_impl.user_dao import UserDAOPostgres
from app.daos.factories import DatabaseConnectionFactory, DAOFactory


class TestUserDAOSQLite:
    def test_create_user(self, user_dao):
        user_data = {
            "id": "dao-u1",
            "name": "DAO User",
            "email": "dao@example.com",
            "password_hash": "hash123",
            "avatar": "dao.jpg",
            "rol": "client"
        }
        res_id = user_dao.create(user_data)
        assert res_id == "dao-u1"

        fetched = user_dao.get_by_id("dao-u1")
        assert fetched is not None
        assert fetched["name"] == "DAO User"
        assert fetched["email"] == "dao@example.com"
        assert fetched["avatar"] == "dao.jpg"
        assert fetched["rol"] == "client"

    def test_create_duplicate_email_fails(self, user_dao):
        user1 = {
            "id": "u-dup-1",
            "name": "User 1",
            "email": "duplicate@example.com",
            "password_hash": "hash1",
            "avatar": None,
            "rol": "client"
        }
        user2 = {
            "id": "u-dup-2",
            "name": "User 2",
            "email": "duplicate@example.com",
            "password_hash": "hash2",
            "avatar": None,
            "rol": "client"
        }
        user_dao.create(user1)
        with pytest.raises(Exception):
            user_dao.create(user2)

    def test_get_by_email_found_and_not_found(self, user_dao):
        user_dao.create({
            "id": "u-email",
            "name": "Email User",
            "email": "findme@example.com",
            "password_hash": "hash",
            "avatar": None,
            "rol": "client"
        })

        found = user_dao.get_by_email("findme@example.com")
        assert found is not None
        assert found["id"] == "u-email"

        not_found = user_dao.get_by_email("doesnotexist@example.com")
        assert not_found is None

    def test_get_by_id_found_and_not_found(self, user_dao):
        user_dao.create({
            "id": "u-specific-id",
            "name": "ID User",
            "email": "iduser@example.com",
            "password_hash": "hash",
            "avatar": None,
            "rol": "client"
        })

        found = user_dao.get_by_id("u-specific-id")
        assert found is not None
        assert found["email"] == "iduser@example.com"

        not_found = user_dao.get_by_id("non-existing-id")
        assert not_found is None

    def test_update_allowed_fields(self, user_dao):
        user_dao.create({
            "id": "u-update",
            "name": "Old Name",
            "email": "old@example.com",
            "password_hash": "hash",
            "avatar": "old.png",
            "rol": "client"
        })

        updated = user_dao.update("u-update", {
            "name": "Brand New Name",
            "avatar": "new.png",
            "role": "admin"
        })
        assert updated is True

        user = user_dao.get_by_id("u-update")
        assert user["name"] == "Brand New Name"
        assert user["avatar"] == "new.png"
        assert user["rol"] == "admin"

    def test_update_empty_or_disallowed_fields(self, user_dao):
        user_dao.create({
            "id": "u-disallowed",
            "name": "Name",
            "email": "disallowed@example.com",
            "password_hash": "hash",
            "avatar": None,
            "rol": "client"
        })

        assert user_dao.update("u-disallowed", {}) is False
        assert user_dao.update("u-disallowed", {"unsupported_field": "val"}) is False

    def test_delete_user(self, user_dao):
        user_dao.create({
            "id": "u-del",
            "name": "To Delete",
            "email": "delete@example.com",
            "password_hash": "hash",
            "avatar": None,
            "rol": "client"
        })

        assert user_dao.delete("u-del") is True
        assert user_dao.get_by_id("u-del") is None
        assert user_dao.delete("u-del") is False


class TestUserDAOPostgres:
    def test_create_postgres(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOPostgres(mock_conn)
        user_data = {
            "id": "pg-1",
            "name": "Postgres User",
            "email": "pg@example.com",
            "password_hash": "hashed",
            "avatar": "pg.png",
            "rol": "client"
        }
        res = dao.create(user_data)
        assert res == "pg-1"
        assert mock_cursor.execute.called
        assert mock_conn.commit.called
        assert mock_cursor.close.called

    def test_create_postgres_error_rollback(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = psycopg2.Error("Connection error")
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOPostgres(mock_conn)
        with pytest.raises(psycopg2.Error):
            dao.create({"id": "1", "name": "A", "email": "a@a.com", "password_hash": "h"})

        assert mock_conn.rollback.called
        assert mock_cursor.close.called

    def test_get_by_email_postgres(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": "pg-1", "email": "test@sub.com"}
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOPostgres(mock_conn)
        res = dao.get_by_email("test@sub.com")
        assert res["id"] == "pg-1"
        assert mock_cursor.close.called

    def test_get_by_id_postgres(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": "pg-2", "name": "Test"}
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOPostgres(mock_conn)
        res = dao.get_by_id("pg-2")
        assert res["id"] == "pg-2"
        assert mock_cursor.close.called

    def test_update_postgres(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOPostgres(mock_conn)
        success = dao.update("pg-1", {"name": "New Name", "role": "admin"})
        assert success is True
        assert mock_conn.commit.called
        assert mock_cursor.close.called

    def test_update_postgres_empty(self):
        mock_conn = MagicMock()
        dao = UserDAOPostgres(mock_conn)
        assert dao.update("pg-1", {}) is False
        assert dao.update("pg-1", {"invalid_col": 123}) is False

    def test_delete_postgres(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOPostgres(mock_conn)
        res = dao.delete("pg-1")
        assert res is True
        assert mock_conn.commit.called
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
        dao = DAOFactory.get_user_dao()
        assert isinstance(dao, UserDAOSQLite)

    def test_dao_factory_postgres(self, monkeypatch):
        monkeypatch.setenv("DB_ENGINE", "postgres")
        with patch.object(DatabaseConnectionFactory, "get_connection") as mock_conn:
            mock_conn.return_value = MagicMock()
            dao = DAOFactory.get_user_dao()
            assert isinstance(dao, UserDAOPostgres)