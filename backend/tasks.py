
import boto3
from botocore.exceptions import ClientError
from celery_app import app
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

# Initialize Firebase (if not already initialized in main process, but Celery workers are separate processes)
# We need to ensure we don't initialize multiple times if workers fork
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# AWS SES Configuration
SES_REGION = os.getenv('SES_REGION', 'eu-north-1')
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
SENDER_EMAIL = os.getenv('SENDER_EMAIL') # Must be verified in SES

ses_client = boto3.client(
    'ses',
    region_name=SES_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

@app.task(bind=True, max_retries=3)
def send_email_task(self, recipient_email, subject, body_html, campaign_id):
    """
    Sends an email using AWS SES.
    Retries up to 3 times if SES fails with a retryable error.
    """
    charset = "UTF-8"
    
    try:
        response = ses_client.send_email(
            Destination={'ToAddresses': [recipient_email]},
            Message={
                'Body': {'Html': {'Charset': charset, 'Data': body_html}},
                'Subject': {'Charset': charset, 'Data': subject},
            },
            Source=SENDER_EMAIL,
        )
        
        # Log success (In production, maybe update a 'campaign_logs' subcollection)
        print(f"Email sent to {recipient_email}: MessageId={response['MessageId']}")
        
        return {"status": "success", "id": response['MessageId'], "recipient": recipient_email}

    except ClientError as e:
        error_message = e.response['Error']['Message']
        print(f"Error sending to {recipient_email}: {error_message}")
        
        # If it's a throttling error or temporary issue, retry
        if "Throttling" in error_message or "ServiceUnavailable" in error_message:
             raise self.retry(exc=e, countdown=60)
             
        return {"status": "error", "message": error_message, "recipient": recipient_email}

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"status": "error", "message": str(e), "recipient": recipient_email}
