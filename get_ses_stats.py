
import boto3
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

def get_ses_stats():
    ses = boto3.client(
        'ses',
        region_name=os.getenv('SES_REGION', 'eu-north-1'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    

    # SendDataPoints returns stats for the last 2 weeks
    response = ses.get_send_statistics()
    data_points = response['SendDataPoints']
    
    total_today = 0
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).date()
    
    for dp in data_points:
        if dp['Timestamp'].date() == today:
            total_today += dp['DeliveryAttempts']
            
    print(f"TOTAL_SENDS_TODAY|{total_today}")
    
    # Also get quota usage which is more immediate
    quota = ses.get_send_quota()
    sent_last_24h = quota['SentLast24Hours']
    print(f"SENT_LAST_24H|{sent_last_24h}")


if __name__ == "__main__":
    get_ses_stats()
