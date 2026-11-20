@echo off
title Detener Docker - Subsonic Festival
cd /d "%~dp0"

echo ========================================================
echo   Deteniendo contenedores Docker de Subsonic...
echo ========================================================
echo.

docker-compose down

echo.
echo Contenedores detenidos correctamente.
echo (Nota: Si quieres borrar tambien los datos de las BD, usa: docker-compose down -v)
echo.
pause