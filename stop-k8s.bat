@echo off
title Detener Kubernetes - Subsonic Festival
cd /d "%~dp0"
echo Eliminando recursos de Subsonic en Kubernetes...
kubectl delete -f .\k8s\
echo Todo detenido.
pause