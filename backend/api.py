from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import json
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = FastAPI()

# CORS Middleware
origins = [
    "http://localhost:5173", # Frontend Vite dev server
    "http://localhost:3000", # Potential production URL
    "*" # For testing purposes, maybe restrict later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UnsubscribeRequest(BaseModel):
    email: str

@app.post("/api/unsubscribe")
async def unsubscribe(request: UnsubscribeRequest):
    email = request.email
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    try:
        # 1. Update Contact Status
        contacts_ref = db.collection('contacts')
        query = contacts_ref.where('email', '==', email).limit(1)
        docs = query.stream()

        contact_found = False
        for doc in docs:
            contact_found = True
            doc.reference.update({'status': 'unsubscribed'})
            logger.info(f"Unsubscribed contact: {email}")

        # 2. Log Request
        db.collection('unsubscribe_requests').add({
            'email': email,
            'requestedAt': firestore.SERVER_TIMESTAMP,
            'source': 'web_form',
            'status': 'processed' # Since we processed it immediately here
        })

        return {"message": "Unsubscribed successfully"}

    except Exception as e:
        logger.error(f"Error processing unsubscribe for {email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhooks/ses")
async def ses_webhook(request: Request):
    try:
        # SES notifications come as JSON in the body
        payload = await request.json()
        
        # Handle SNS Subscription Confirmation (first time setup)
        if payload.get('Type') == 'SubscriptionConfirmation':
            logger.info(f"Confirming subscription: {payload.get('SubscribeURL')}")
            # In a real scenario, we might need to GET this URL to confirm.
            # requests.get(payload.get('SubscribeURL'))
            return {"status": "ok", "message": "Subscription confirmation received"}

        # Handle Notification
        if payload.get('Type') == 'Notification':
            message = json.loads(payload.get('Message'))
            notification_type = message.get('notificationType')
            
            if notification_type == 'Bounce':
                bounce = message.get('bounce', {})
                bounced_recipients = bounce.get('bouncedRecipients', [])
                
                for recipient in bounced_recipients:
                    email = recipient.get('emailAddress')
                    logger.info(f"Processing Bounce for: {email}")
                    
                    # Update Contact Status
                    contacts_ref = db.collection('contacts')
                    query = contacts_ref.where('email', '==', email).limit(1)
                    docs = query.stream()
                    
                    for doc in docs:
                        doc.reference.update({
                            'status': 'bounced',
                            'bounceType': bounce.get('bounceType'),
                            'lastBounceAt': firestore.SERVER_TIMESTAMP
                        })

            elif notification_type == 'Complaint':
                complaint = message.get('complaint', {})
                complained_recipients = complaint.get('complainedRecipients', [])
                
                for recipient in complained_recipients:
                    email = recipient.get('emailAddress')
                    logger.info(f"Processing Complaint for: {email}")
                    
                    # Update Contact Status
                    contacts_ref = db.collection('contacts')
                    query = contacts_ref.where('email', '==', email).limit(1)
                    docs = query.stream()
                    
                    for doc in docs:
                        doc.reference.update({
                            'status': 'complained', # or 'unsubscribed'
                            'complaintType': complaint.get('complaintFeedbackType'),
                            'lastComplaintAt': firestore.SERVER_TIMESTAMP
                        })

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
