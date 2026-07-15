import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

doc_id = 'ggpqn2ok0'
ses_sent = 840

doc_ref = db.collection('campaigns').document(doc_id)
doc = doc_ref.get().to_dict()

contacts = doc.get('contacts', [])
total = len(contacts)

print(f"Syncing campaign {doc_id}")
print(f"SES Sent: {ses_sent} | Total: {total}")

doc_ref.update({
    'sentCount': ses_sent,
    'totalRecipients': total,
    'status': 'sending',
    'failedCount': 0
})

print("Firestore synced. Progress bar should now show ~32%.")
