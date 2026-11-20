@echo off
title Suite de Tests Unitarios - Subsonic Festival
cd /d "%~dp0"

set "RES_USER=OK"
set "RES_CAT=OK"
set "RES_PUR=OK"
set "RES_SHIP=OK"
set "RES_ORD=OK"
set "ERRORES=0"

echo ========================================================
echo   EJECUTANDO TESTS UNITARIOS DE TODOS LOS MICROSERVICIOS
echo ========================================================
echo.

:: 1. UserService (Python / Pytest)
echo [1/5] Ejecutando tests unitarios de UserService (Python)...
docker run --rm -v "%cd%\UserService:/app" -w /app python:3.10-slim sh -c "pip install -q -r requirements.txt pytest && pytest tests"
if errorlevel 1 (
    set "RES_USER=FALLO"
    set "ERRORES=1"
)
echo.

:: 2. CatalogService (Python / Pytest)
echo [2/5] Ejecutando tests unitarios de CatalogService (Python)...
docker run --rm -v "%cd%\CatalogService:/app" -w /app python:3.10-slim sh -c "pip install -q -r requirements.txt pytest && pytest tests"
if errorlevel 1 (
    set "RES_CAT=FALLO"
    set "ERRORES=1"
)
echo.

:: 3. PurchaseService (Java / JUnit + Mockito + PostgreSQL temporal)
echo [3/5] Ejecutando tests unitarios de PurchaseService (Java/Maven + PostgreSQL)...
docker network create test-purchase-net >nul 2>&1
docker run -d --rm --name test-purchase-pg --network test-purchase-net ^
  -e POSTGRES_DB=purchase_db ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=postgres ^
  postgres:16-alpine >nul

:: Esperar a que PostgreSQL acepte conexiones
:wait_pg_purchase
docker exec test-purchase-pg pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_pg_purchase
)

docker run --rm --network test-purchase-net ^
  -e DB_ENGINE=postgres ^
  -e DB_HOST=test-purchase-pg ^
  -e DB_PORT=5432 ^
  -e DB_NAME=purchase_db ^
  -e DB_USER=postgres ^
  -e DB_PASSWORD=postgres ^
  -e SECRET_KEY=subsonic-super-secret-jwt-key-for-testing-2026 ^
  -v maven_repo:/root/.m2 ^
  -v "%cd%\PurchaseService:/app" ^
  -w /app maven:3.9-eclipse-temurin-21 mvn test

if errorlevel 1 (
    set "RES_PUR=FALLO"
    set "ERRORES=1"
)

:: Limpiar contenedor y red temporal
docker stop test-purchase-pg >nul 2>&1
docker network rm test-purchase-net >nul 2>&1
echo.

:: 4. ShipInventoryService (Java / JUnit + Mockito)
echo [4/5] Ejecutando tests unitarios de ShipInventoryService (Java/Maven)...
docker run --rm -v maven_repo:/root/.m2 -v "%cd%\ShipInventoryService:/app" -w /app maven:3.9-eclipse-temurin-21 mvn test
if errorlevel 1 (
    set "RES_SHIP=FALLO"
    set "ERRORES=1"
)
echo.

:: 5. OrderService (Go / go test)
echo [5/5] Ejecutando tests unitarios de OrderService (Go)...
docker run --rm -v "%cd%\OrderService:/app" -w /app golang:1.22-alpine go test -v ./...
if errorlevel 1 (
    set "RES_ORD=FALLO"
    set "ERRORES=1"
)
echo.

echo ========================================================
echo   RESUMEN DE TESTS UNITARIOS POR MICROSERVICIO
echo ========================================================
echo   1. UserService          : [%RES_USER%]
echo   2. CatalogService       : [%RES_CAT%]
echo   3. PurchaseService      : [%RES_PUR%]
echo   4. ShipInventoryService : [%RES_SHIP%]
echo   5. OrderService         : [%RES_ORD%]
echo ========================================================
echo.
pause