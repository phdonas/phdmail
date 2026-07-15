import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

doc_id = 'ggpqn2ok0'
doc = db.collection('campaigns').document(doc_id).get().to_dict()
print(f"--- Campaign {doc_id} ---")
print(f"Name: {doc.get('name')}")
print(f"Status: {doc.get('status')}")
print(f"sentCount: {doc.get('sentCount')}")
print(f"failedCount: {doc.get('failedCount')}")
print(f"totalRecipients: {doc.get('totalRecipients')}")
print(f"failedResults count: {len(doc.get('failedResults', []))}")
if doc.get('failedResults'):
    print("Example failure:", doc.get('failedResults')[0])
print(f"Contacts total: {len(doc.get('contacts', []))}")
