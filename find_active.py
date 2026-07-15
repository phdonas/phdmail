
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate('backend/serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase init error: {e}")

db = firestore.client()

def find_active_campaigns():
    print("Searching for campaigns with status 'sending', 'queued' or 'processing'...")
    campaigns_ref = db.collection('campaigns')
    
    # Check for specific statuses
    statuses = ['sending', 'queued', 'processing']
    found = False
    
    for status in statuses:
        docs = campaigns_ref.where('status', '==', status).stream()


        for doc in docs:
            found = True
            c = doc.to_dict()
            print(f"ID: {doc.id}")
            print(f"Name: {c.get('name')}")
            print(f"Status: {c.get('status')}")
            print(f"FULL DATA: {c}")
            print("-" * 20)


            
    if not found:
        print("No active campaigns found with those statuses.")
        print("\nChecking the very last campaign by creation/update time...")
        # Fallback: just list the last 5 regardless of status to be sure
        all_docs = campaigns_ref.order_by('updatedAt', direction=firestore.Query.DESCENDING).limit(5).stream()
        for doc in all_docs:
            c = doc.to_dict()
            print(f"ID: {doc.id} | Name: {c.get('name')} | Status: {c.get('status')} | Updated: {c.get('updatedAt')}")

if __name__ == "__main__":
    find_active_campaigns()
