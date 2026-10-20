import os
import sqlite3
import pytest
from unittest.mock import MagicMock, patch
import mysql.connector

from app.daos.sqlite_impl.user_dao import UserDAOSQLite
from app.daos.mysql_impl.user_dao import UserDAOMySQL
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
            "role": "admin"  # tests role -> rol mapping
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


class TestUserDAOMySQL:
    def test_create_mysql(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        user_data = {
            "id": "my-1",
            "name": "MySQL User",
            "email": "my@example.com",
            "password_hash": "hashed",
            "avatar": "my.png",
            "rol": "client"
        }
        res = dao.create(user_data)
        assert res == "my-1"
        assert mock_cursor.execute.called
        assert mock_conn.commit.called
        assert mock_cursor.close.called

    def test_create_mysql_error_rollback(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = mysql.connector.Error("Connection error")
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        with pytest.raises(mysql.connector.Error):
            dao.create({"id": "1", "name": "A", "email": "a@a.com", "password_hash": "h"})

        assert mock_conn.rollback.called
        assert mock_cursor.close.called

    def test_get_by_email_mysql(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": "my-1", "email": "test@sub.com"}
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        res = dao.get_by_email("test@sub.com")
        assert res["id"] == "my-1"
        assert mock_cursor.close.called

    def test_get_by_id_mysql(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": "my-2", "name": "Test"}
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        res = dao.get_by_id("my-2")
        assert res["id"] == "my-2"
        assert mock_cursor.close.called

    def test_update_mysql(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        success = dao.update("my-1", {"name": "New Name", "role": "admin"})
        assert success is True
        assert mock_conn.commit.called
        assert mock_cursor.close.called

    def test_update_mysql_empty(self):
        mock_conn = MagicMock()
        dao = UserDAOMySQL(mock_conn)
        assert dao.update("my-1", {}) is False
        assert dao.update("my-1", {"invalid_col": 123}) is False

    def test_update_profile_and_role_mysql(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        assert dao.update_profile("my-1", "Name", "avatar.jpg") is True
        assert dao.update_role("my-1", "admin") is True

    def test_delete_mysql(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor

        dao = UserDAOMySQL(mock_conn)
        res = dao.delete("my-1")
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

    def test_dao_factory_mysql(self, monkeypatch):
        monkeypatch.setenv("DB_ENGINE", "mysql")
        with patch.object(DatabaseConnectionFactory, "get_connection") as mock_conn:
            mock_conn.return_value = MagicMock()
            dao = DAOFactory.get_user_dao()
            assert isinstance(dao, UserDAOMySQL)

