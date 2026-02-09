
import time
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from tasks import send_email_task

# Load environment variables
load_dotenv()

# Firebase Setup
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def process_queued_campaigns():
    print("Checking for queued campaigns...")
    campaigns_ref = db.collection('campaigns')
    # Query for campaigns with status 'queued'
    query = campaigns_ref.where('status', '==', 'queued')
    results = query.stream()

    for doc in results.stream(): # .stream() is correct for query results
        campaign_data = doc.to_dict()
        campaign_id = doc.id
        print(f"Processing Campaign: {campaign_data.get('name')}")

        # Update status to 'sending'
        campaigns_ref.document(campaign_id).update({'status': 'sending'})

        # Get recipients
        recipients = campaign_data.get('contacts', [])
        subject = campaign_data.get('subject', 'No Subject')
        content = campaign_data.get('content', '')

        print(f"Dispatching {len(recipients)} emails to Celery queue...")
        
        for recipient in recipients:
            # Dispatch task to Celery
            # delay() is the shortcut for apply_async()
            send_email_task.delay(recipient, subject, content, campaign_id)
            
        # Note: We can't easily track "15/100 sent" in real-time here because loading is async.
        # We update to 'sent' here assuming the queue accepted them.
        # ideally, a separate process or callback updates the campaign status when all tasks are done.
        # For simplicity in this 'orchastrator', we mark as 'processing' or leave as 'sending'.
        # Let's set to 'sending' and maybe have a way to check completion later.
        
        # campaigns_ref.document(campaign_id).update({'status': 'sent'}) # Maybe don't mark sent immediately?
        print(f"Campaign {campaign_id} dispatched to queue.")

if __name__ == "__main__":
    print("Campaign Orchestrator Started")
    print("Press Ctrl+C to stop")
    while True:
        try:
             # Re-query every loop to get fresh snapshot
             campaigns_ref = db.collection('campaigns')
             query = campaigns_ref.where('status', '==', 'queued')
             results = query.stream()
             
             has_campaigns = False
             for doc in results:
                 has_campaigns = True
                 campaign_data = doc.to_dict()
                 campaign_id = doc.id
                 print(f"Processing Campaign: {campaign_data.get('name')}")
                 
                 campaigns_ref.document(campaign_id).update({'status': 'sending'})
                 
                 recipients = campaign_data.get('contacts', [])
                 subject = campaign_data.get('subject')
                 content = campaign_data.get('content')
                 
                 for recipient in recipients:
                     send_email_task.delay(recipient, subject, content, campaign_id)
                 
                 print(f"Dispatched {len(recipients)} tasks.")
                 # Mark as sent for now, or keep as sending if we track individually
                 campaigns_ref.document(campaign_id).update({
                     'status': 'sent', 
                     'sentAt': firestore.SERVER_TIMESTAMP
                 })

             if not has_campaigns:
                 print("No queued campaigns found.")
                 
        except Exception as e:
            print(f"Error in loop: {e}")
            
        time.sleep(10)
