@echo off
title Pruebas E2E Automatizadas - Subsonic Festival
cd /d "%~dp0"

echo ========================================================
echo   Preparando entorno de pruebas E2E...
echo ========================================================

:: 1. Crear un entorno virtual aislado (.venv) si no existe en el PC
if not exist "tests\.venv\Scripts\python.exe" (
    echo Creando entorno virtual local para las pruebas...
    if exist "C:\Lenguajes\Python\python.exe" (
        "C:\Lenguajes\Python\python.exe" -m venv tests\.venv
    ) else (
        py -m venv tests\.venv >nul 2>&1 || python -m venv tests\.venv
    )
)

set "VENV_PYTHON=tests\.venv\Scripts\python.exe"

if not exist "%VENV_PYTHON%" (
    echo [ERROR] No se encontro Python 3 instalado en este equipo.
    echo Instala Python 3 desde python.org y vuelve a ejecutar este script.
    pause
    exit /b 1
)

:: 2. Instalar Playwright y Chromium dentro del entorno virtual si faltan
"%VENV_PYTHON%" -m pip show playwright >nul 2>&1
if errorlevel 1 (
    echo Instalando Playwright y Chromium - solo la primera vez...
    "%VENV_PYTHON%" -m pip install --upgrade pip >nul 2>&1
    "%VENV_PYTHON%" -m pip install playwright
    "%VENV_PYTHON%" -m playwright install chromium
)

echo.
echo ========================================================
echo   Ejecutando suite de pruebas E2E en navegador...
echo   Asegurate de tener Docker o Kubernetes levantado
echo ========================================================
echo.

"%VENV_PYTHON%" tests\test_flujo_completo.py

echo.
pause