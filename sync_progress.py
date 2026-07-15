
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def sync_progress(campaign_id, count):
    ref = db.collection('campaigns').document(campaign_id)
    ref.update({
        'sentCount': count,
        'status': 'sending'
    })
    print(f"Synced campaign {campaign_id} to {count} sent emails.")

if __name__ == "__main__":
    sync_progress('hlmsrgoac', 1115) 

