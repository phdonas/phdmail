import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

print("--- Recent Campaigns (Updated Today) ---")
docs = db.collection('campaigns').stream()
for doc in docs:
    d = doc.to_dict()
    # Check if updated today (roughly) or has sentCount > 0
    sent_count = d.get('sentCount')
    status = d.get('status')
    name = d.get('name')
    
    if sent_count is not None and sent_count > 0:
        print(f"ID: {doc.id} | Status: {status} | Sent: {sent_count}/{d.get('totalRecipients')} | Name: {name}")
    elif status in ['sending', 'queued']:
        print(f"ID: {doc.id} | Status: {status} | Sent: {sent_count}/{d.get('totalRecipients')} | Name: {name}")
