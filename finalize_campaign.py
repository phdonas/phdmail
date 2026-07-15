
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def finalize(campaign_id):
    ref = db.collection('campaigns').document(campaign_id)
    doc = ref.get()
    data = doc.to_dict()
    total = data.get('totalRecipients', 2626)
    
    ref.update({
        'sentCount': total,
        'status': 'sent',
        'sentAt': firestore.SERVER_TIMESTAMP
    })
    print(f"Campaign {campaign_id} finalized to 'sent' with {total} emails.")

if __name__ == "__main__":
    finalize('6s4x4gcai')
