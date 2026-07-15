@echo off
echo Encerrando todos os processos de Python e Celery...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM celery.exe /T >nul 2>&1
echo Feito! Pode rodar o start_backend.bat agora.
pause
