
from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

# Redis Configuration (Local)
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

app = Celery('phdmail', broker=REDIS_URL, backend=REDIS_URL, include=['tasks'])

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    # Rate Limiting: Default to 5/s (Safe warming rate) or use env var
    task_default_rate_limit=os.getenv('CELERY_RATE_LIMIT', '5/s'), 
)

if __name__ == '__main__':
    app.start()
