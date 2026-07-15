
import subprocess
import os
import time

def main():
    # 1. Kill everything first (just to be sure)
    subprocess.run(["taskkill", "/F", "/IM", "python.exe", "/T"], capture_output=True)
    subprocess.run(["taskkill", "/F", "/IM", "celery.exe", "/T"], capture_output=True)
    
    time.sleep(2)
    
    # 2. Start Redis
    subprocess.run(["docker", "start", "redis"], capture_output=True)
    
    # 3. Start Workers and Orchestrator
    cwd = r"c:\Projetos\phdmail\backend"
    
    # Worker
    subprocess.Popen('start "PHDMail Worker" /min cmd /k "celery -A celery_app worker --pool=solo --loglevel=info"', shell=True, cwd=cwd)
    
    # Orchestrator
    subprocess.Popen('start "PHDMail Orchestrator" /min cmd /k "python main.py"', shell=True, cwd=cwd)
    
    # API
    subprocess.Popen('start "PHDMail API" /min cmd /k "python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"', shell=True, cwd=cwd)

if __name__ == "__main__":
    main()
