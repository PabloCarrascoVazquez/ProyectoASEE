@echo off
title Orquestador Kubernetes - Subsonic Festival
cd /d "%~dp0"

echo ========================================================
echo   Desplegando arquitectura Subsonic en Kubernetes...
echo ========================================================
echo.

powershell -ExecutionPolicy Bypass -File ".\k8s\deploy.ps1"

echo.
echo ========================================================
echo   Esperando 15 segundos a que arranquen los Pods...
echo ========================================================
timeout /t 15 /nobreak >nul

kubectl get pods
echo.
echo Frontend disponible en: http://localhost:48080
echo Gateway API disponible en: http://localhost:8000
echo.
pause