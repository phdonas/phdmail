
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('backend/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def check():
    # Get the specific campaign ID zrzog1lyk (from earlier inspection) or any with sending
    # Actually, zrzog1lyk was marked as 'sent' in inspection_report.txt.
    # The new one might be a different ID.
    
    docs = db.collection('campaigns').where('status', '==', 'sending').stream()
    for doc in docs:
        d = doc.to_dict()
        print(f"ID: {doc.id}")
        print(f"Name: {d.get('name')}")
        print(f"Sent: {d.get('sentCount')}")
        print(f"Total: {d.get('totalRecipients')}")
        print(f"Failed: {d.get('failedCount')}")
        print(f"ContactsLen: {len(d.get('contacts', []))}")

if __name__ == "__main__":
    check()
