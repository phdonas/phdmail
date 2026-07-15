
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def check_errors(campaign_id):
    ref = db.collection('campaigns').document(campaign_id)
    doc = ref.get()
    data = doc.to_dict()
    failed = data.get('failedResults', [])
    print(f"Failed count in data: {data.get('failedCount')}")
    print(f"FailedResults length: {len(failed)}")
    if failed:
        print("Last error:", failed[-1])

if __name__ == "__main__":
    check_errors('hlmsrgoac')
