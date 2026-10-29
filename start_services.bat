@echo off
chcp 65001 > nul
title Orquestador de Microservicios - Subsonic Festival

echo =======================================================
echo    Iniciando Microservicios de Subsonic Festival
echo =======================================================
echo.

set PROJECT_ROOT=C:\Clases\ASEE\ProyectoASEE
set CONDA_PATH=C:\Programas\Miniconda\files


:: Iniciar API Gateway (NGINX)
echo [3/3] Iniciando API Gateway (Puerto 8000)...
start "Subsonic - Gateway (8000)" cmd /k "cd /d C:\Programas\nginx && nginx"

:: ---------------------------------------------------------
:: 1. Iniciar Microservicio de Usuarios (Python / Flask)
:: ---------------------------------------------------------
echo [1/2] Iniciando Servicio de Usuarios (Puerto 8001)...
start "Subsonic - UserService (8001)" cmd /k "call "%CONDA_PATH%\Scripts\activate.bat" subsonic-env && cd /d "%PROJECT_ROOT%\UserService" && python main.py"

:: Pausa breve para evitar bloqueos y escalonar inicios
timeout /t 3 /nobreak > nul

:: ---------------------------------------------------------
:: 2. Iniciar Microservicio de Compras (Java / Spring Boot)
:: ---------------------------------------------------------
echo [2/3] Iniciando Servicio de Compras (Puerto 8003)...
start "Subsonic - PurchaseService (8003)" cmd /k "cd /d "%PROJECT_ROOT%\PurchaseService" && mvn spring-boot:run"

:: Pausa breve para escalonar inicios
timeout /t 3 /nobreak > nul

:: ---------------------------------------------------------
:: 3. Iniciar Microservicio de Pedidos y Wallet (Go)
:: ---------------------------------------------------------
echo [3/3] Iniciando Servicio de Pedidos y Wallet (Puerto 8005)...
start "Subsonic - OrderService (8005)" cmd /k "cd /d "%PROJECT_ROOT%\OrderService" && go run main.go"

echo.
echo =======================================================
echo    Todos los microservicios han sido lanzados.
echo    - UserService:     http://localhost:8001
echo    - PurchaseService: http://localhost:8003
echo    - OrderService:    http://localhost:8005
echo =======================================================
echo Presiona cualquier tecla para cerrar este lanzador...
pause > nul