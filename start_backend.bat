@echo off
echo Iniciando o Servidor de Emails (PHDMail)...
echo.

cd backend

:: Inicia o Redis via Docker (caso nao esteja rodando)
docker start redis >nul 2>&1

:: Inicia o Celery Worker em uma nova janela minimizada
start "PHDMail Worker" /min cmd /k "celery -A celery_app worker --pool=solo --loglevel=info"

:: Inicia o Orquestrador em uma nova janela minimizada
start "PHDMail Orchestrator" /min cmd /k "python main.py"

echo Backend rodando em segundo plano!
echo Pode fechar esta janela, mas nao feche as janelas "PHDMail Worker" e "Orchestrator".
pause
