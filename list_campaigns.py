import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firestore
cred = credentials.Certificate('backend/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def list_recent_campaigns():
    print("--- Listing Recent Campaigns ---")
    docs = db.collection('campaigns').order_by('sentAt', direction=firestore.Query.DESCENDING).limit(5).stream()
    
    for doc in docs:
        c = doc.to_dict()
        print(f"ID: {doc.id} | Name: '{c.get('name')}' | Status: {c.get('status')}")

if __name__ == "__main__":
    list_recent_campaigns()
