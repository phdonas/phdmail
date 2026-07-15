
import firebase_admin
from firebase_admin import credentials, firestore
from tasks import send_email_task
import sys
import os

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def resume(campaign_id):
    campaign_ref = db.collection('campaigns').document(campaign_id)
    doc = campaign_ref.get()
    
    if not doc.exists:
        print(f"Error: Campaign {campaign_id} not found.")
        return

    data = doc.to_dict()
    contacts = data.get('contacts', [])
    sent_count = data.get('sentCount', 0)
    total = len(contacts)
    
    # Safety: Update totalRecipients to match reality
    campaign_ref.update({'totalRecipients': total})

    if sent_count >= total:
        print(f"Campaign already complete ({sent_count}/{total}).")
        campaign_ref.update({'status': 'sent'})
        return

    print(f"Resuming Campaign: {data.get('name')}")
    print(f"Progress: {sent_count} / {total}")
    
    remaining_contacts = contacts[sent_count:]
    print(f"Dispatching to {len(remaining_contacts)} remaining contacts...")

    subject = data.get('subject', 'Sem Assunto')
    context = {
        'content': data.get('content', ''),
        'imageUrl': data.get('imageUrl'),
        'imageLink': data.get('imageLink'),
        'ctaText': data.get('ctaText'),
        'ctaUrl': data.get('ctaUrl'),
        'socialLinks': data.get('socialLinks'),
        'footerText': data.get('footerText'),
        'footerLinkText': data.get('footerLinkText'),
        'footerLinkUrl': data.get('footerLinkUrl'),
        'footerButtonText': data.get('footerButtonText'),
        'footerButtonUrl': data.get('footerButtonUrl'),
        'footerImageUrl': data.get('footerImageUrl'),
        'footerImageLink': data.get('footerImageLink')
    }

    # Set status to sending BEFORE dispatching to prevent main.py from picking it up
    campaign_ref.update({'status': 'sending'})

    dispatched = 0
    for contact in remaining_contacts:
        try:
            send_email_task.delay(contact, subject, context, campaign_id)
            dispatched += 1
            if dispatched % 100 == 0:
                print(f"Dispatched {dispatched}...")
        except Exception as e:
            print(f"Error dispatching to {contact}: {e}")

    print(f"Done. Successfully dispatched {dispatched} tasks.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python resume_campaign.py <campaign_id>")
    else:
        resume(sys.argv[1])
