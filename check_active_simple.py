import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection('campaigns').stream()
for doc in docs:
    d = doc.to_dict()
    status = d.get('status')
    if status in ['sending', 'queued', 'processing']:
        print(f"ACTIVE | ID: {doc.id} | Status: {status} | Sent: {d.get('sentCount')}/{d.get('totalRecipients')} | Name: {d.get('name')[:30]}")
    elif d.get('sentCount', 0) > 0:
         # Check if it was sent today
         # (We don't have a reliable today filter here easily without more code, but let's just print them all)
         pass

print("--- Checking for any queued ---")
queued = db.collection('campaigns').where('status', '==', 'queued').get()
for q in queued:
    print(f"QUEUED | ID: {q.id} | Name: {q.to_dict().get('name')}")
