
import redis
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

try:
    r = redis.from_url(REDIS_URL)
    ping = r.ping()
    # Check queue length
    q_len = r.llen('celery')
    print(f"REDIS_STATUS|{'ONLINE' if ping else 'OFFLINE'}")
    print(f"QUEUE_LENGTH|{q_len}")
except Exception as e:
    print(f"REDIS_ERROR|{e}")
