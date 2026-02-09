
from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

# Redis Configuration (Local)
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

app = Celery('phdmail', broker=REDIS_URL, backend=REDIS_URL)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    # Rate Limiting: 5 tasks per second (Safe warming rate)
    task_default_rate_limit='5/s', 
)

if __name__ == '__main__':
    app.start()
