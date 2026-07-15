
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def fix_current_campaign(campaign_id, sent_count):
    ref = db.collection('campaigns').document(campaign_id)
    ref.update({
        'sentCount': sent_count,
        'failedCount': 0,
        'status': 'sending' # Ensure it's sending
    })
    print(f"Campaign {campaign_id} updated with sentCount={sent_count}")

if __name__ == "__main__":
    fix_current_campaign('6s4x4gcai', 1065) # Using 1065 as a safe estimate based on SES
