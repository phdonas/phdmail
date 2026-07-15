
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_progress():
    docs = db.collection('campaigns').where('status', '==', 'sending').stream()
    found = False
    for doc in docs:
        found = True
        c = doc.to_dict()
        sent = c.get('sentCount', 0)
        total = c.get('totalRecipients', 0)
        failed = c.get('failedCount', 0)
        name = c.get('name', 'Sem nome')
        if total is None: 
            # If total is not set, try to get from contacts length
            contacts = c.get('contacts', [])
            total = len(contacts) if isinstance(contacts, list) else 0
            
        print(f"PROGRESS_UPDATE|{name}|{sent}|{total}|{failed}")
    
    if not found:
        print("NO_ACTIVE_CAMPAIGNS")

if __name__ == "__main__":
    get_progress()
