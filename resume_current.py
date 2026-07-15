import firebase_admin
from firebase_admin import credentials, firestore
import time
import os
import sys

# Ensure we can find the backend modules
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change directory to backend so serviceAccountKey.json and .env are found
os.chdir(backend_path)

try:
    from tasks import send_email_task
except ImportError as e:
    print(f"Error: Could not import 'tasks' from {backend_path}. {e}")
    sys.exit(1)

if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()
campaign_id = 'ggpqn2ok0'

doc_ref = db.collection('campaigns').document(campaign_id)
doc = doc_ref.get()
data = doc.to_dict()

contacts = data.get('contacts', [])
skip = 840 # Já enviados (conforme SES)
remaining_contacts = contacts[skip:]

print(f"Resuming Campaign: {data.get('name')}")
print(f"Total: {len(contacts)} | Already Sent: {skip} | Remaining: {len(remaining_contacts)}")

# Prepare context
context = {
    'content': data.get('content'), 'imageUrl': data.get('imageUrl'),
    'imageLink': data.get('imageLink'), 'ctaText': data.get('ctaText'),
    'ctaUrl': data.get('ctaUrl'), 'socialLinks': data.get('socialLinks'),
    'footerText': data.get('footerText'), 'footerLinkText': data.get('footerLinkText'),
    'footerLinkUrl': data.get('footerLinkUrl'), 'footerButtonText': data.get('footerButtonText'),
    'footerButtonUrl': data.get('footerButtonUrl'), 'footerImageUrl': data.get('footerImageUrl'),
    'footerImageLink': data.get('footerImageLink')
}
subject = data.get('subject')

print("Dispatching remaining tasks to Celery...")
count = 0
for recipient in remaining_contacts:
    try:
        send_email_task.delay(recipient, subject, context, campaign_id)
        count += 1
        if count % 100 == 0:
            print(f"Dispatched: {count}...")
            time.sleep(1)
    except Exception as e:
        print(f"Error dispatching task for {recipient}: {e}")

print(f"Success! {count} tasks added to queue.")
