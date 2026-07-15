import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firestore
cred = credentials.Certificate('backend/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def audit_campaigns():
    print("--- Detailed Campaign Audit ---")
    docs = db.collection('campaigns').order_by('createdAt', direction=firestore.Query.DESCENDING).limit(10).stream()
    
    for doc in docs:
        c = doc.to_dict()
        name = c.get('name', 'N/A')
        status = c.get('status', 'N/A')
        stats = c.get('stats', {})
        contacts = c.get('contacts', [])
        total_contacts = len(contacts)
        print(f"ID: {doc.id}")
        print(f"  Name: {name}")
        print(f"  Status: {status}")
        print(f"  Stats: {stats}")
        print(f"  Contacts List Length: {total_contacts}")
        print("-" * 30)

if __name__ == "__main__":
    audit_campaigns()
