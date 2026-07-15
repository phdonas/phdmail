
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def fix_campaign(campaign_id):
    ref = db.collection('campaigns').document(campaign_id)
    doc = ref.get()
    if not doc.exists:
        print("Campaign not found")
        return
        
    data = doc.to_dict()
    contacts = data.get('contacts', [])
    total = len(contacts)
    
    print(f"Fixing campaign {campaign_id}...")
    ref.update({
        'totalRecipients': total,
        'sentCount': 0 if data.get('sentCount') is None else data.get('sentCount'),
        'failedCount': 0 if data.get('failedCount') is None else data.get('failedCount'),
        'status': 'sending'
    })
    print("Done.")

if __name__ == "__main__":
    fix_campaign('hlmsrgoac')
