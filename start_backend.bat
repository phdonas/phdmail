@echo off
echo Iniciando o Servidor de Emails (PHDMail)...
echo.

:: Garante que nao haja instâncias antigas rodando
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM celery.exe /T >nul 2>&1

cd backend

:: Inicia o Redis via Docker (caso nao esteja rodando)
docker start redis >nul 2>&1

:: Inicia o Celery Worker em uma nova janela minimizada
start "PHDMail Worker" /min cmd /k "celery -A celery_app worker --pool=solo --loglevel=info"

:: Inicia o Orquestrador em uma nova janela minimizada
start "PHDMail Orchestrator" /min cmd /k "python main.py"

:: Inicia o Servidor API (Webhooks & Unsubscribe)
start "PHDMail API" /min cmd /k "python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"

echo Backend rodando em segundo plano!
echo Pode fechar esta janela, mas nao feche as janelas "PHDMail Worker" e "Orchestrator".
pause
