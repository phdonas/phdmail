import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, timezone

cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

print("--- Active/Recent Campaigns Summary ---")
docs = db.collection('campaigns').stream()
for doc in docs:
    d = doc.to_dict()
    status = d.get('status')
    if status in ['sending', 'queued'] or d.get('sentCount', 0) > 0:
        print(f"ID: {doc.id} | Name: {d.get('name')} | Status: {status} | Sent: {d.get('sentCount')}/{d.get('totalRecipients')}")
