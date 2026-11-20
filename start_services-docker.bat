@echo off
title Orquestador Docker - Subsonic Festival
echo Levantando toda la arquitectura de Subsonic...
cd /d "%~dp0"
docker-compose up --build
pause