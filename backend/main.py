
import time
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from tasks import send_email_task
# Import FieldFilter to avoid deprecation warning
from google.cloud.firestore import FieldFilter

# Load environment variables
load_dotenv()

# Firebase Setup
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

if __name__ == "__main__":
    print("Campaign Orchestrator Started (STABLE VERSION)")
    print("Press Ctrl+C to stop")
    while True:
        try:
            # Re-query every loop to get fresh snapshot
            campaigns_ref = db.collection('campaigns')
            
            # Check for scheduled campaigns that are ready to run
            import datetime
            try:
                scheduled_query = campaigns_ref.where(filter=FieldFilter('status', '==', 'scheduled'))
                for s_doc in scheduled_query.stream():
                    s_data = s_doc.to_dict()
                    scheduled_for = s_data.get('scheduledFor')
                    if scheduled_for:
                        sf_clean = scheduled_for.replace('Z', '+00:00')
                        sf_dt = datetime.datetime.fromisoformat(sf_clean)
                        now_dt = datetime.datetime.now(datetime.timezone.utc)
                        if sf_dt <= now_dt:
                            print(f"Scheduled campaign {s_doc.id} ({s_data.get('name')}) is ready! Queuing it.")
                            campaigns_ref.document(s_doc.id).update({
                                'status': 'queued'
                            })
            except Exception as sched_err:
                print(f"Error checking scheduled campaigns: {sched_err}")
            
            # Use FieldFilter to avoid warning and ensure correct query
            query = campaigns_ref.where(filter=FieldFilter('status', '==', 'queued'))
            results = query.stream()
            
            @firestore.transactional
            def claim_campaign_transaction(transaction, c_ref):
                snapshot = c_ref.get(transaction=transaction)
                data = snapshot.to_dict()
                if data.get('status') == 'queued':
                    # Atomic update to 'sending' before we even start looping through contacts
                    transaction.update(c_ref, {
                        'status': 'sending',
                        'lastDispatchAt': firestore.SERVER_TIMESTAMP,
                        'sentAt': firestore.SERVER_TIMESTAMP if data.get('sentAt') is None else data.get('sentAt')
                    })
                    return data
                return None

            has_campaigns = False
            for doc in results:
                campaign_id = doc.id
                campaign_ref = campaigns_ref.document(campaign_id)
                
                # ATOMIC LOCK: Only one process can move status from 'queued' to 'sending'
                campaign_data = claim_campaign_transaction(db.transaction(), campaign_ref)
                
                if not campaign_data:
                    print(f"Campaign {campaign_id} already claimed by another process. Skipping.")
                    continue

                has_campaigns = True
                print(f"Processing Campaign: {campaign_data.get('name')}")
                
                recipients = campaign_data.get('contacts', [])
                total_recipients = len(recipients)
                
                # Initialize counters if missing
                if campaign_data.get('sentCount') is None or campaign_data.get('failedCount') is None:
                    campaign_ref.update({
                        'sentCount': campaign_data.get('sentCount', 0),
                        'failedCount': campaign_data.get('failedCount', 0),
                        'totalRecipients': total_recipients
                    })
                
                subject = campaign_data.get('subject', 'Sem Assunto')
                
                context = {
                    'content': campaign_data.get('content', ''),
                    'imageUrl': campaign_data.get('imageUrl'),
                    'imageLink': campaign_data.get('imageLink'),
                    'ctaText': campaign_data.get('ctaText'),
                    'ctaUrl': campaign_data.get('ctaUrl'),
                    'socialLinks': campaign_data.get('socialLinks'),
                    
                    # Footer Fields
                    'footerText': campaign_data.get('footerText'),
                    'footerLinkText': campaign_data.get('footerLinkText'),
                    'footerLinkUrl': campaign_data.get('footerLinkUrl'),
                    'footerButtonText': campaign_data.get('footerButtonText'),
                    'footerButtonUrl': campaign_data.get('footerButtonUrl'),
                    'footerImageUrl': campaign_data.get('footerImageUrl'),
                    'footerImageLink': campaign_data.get('footerImageLink')
                }
                
                dispatched_count = 0
                for recipient in recipients:
                    try:
                        send_email_task.delay(recipient, subject, context, campaign_id)
                        dispatched_count += 1
                    except Exception as e:
                        print(f"Error dispatching to {recipient}: {e}")
                
                print(f"Dispatched {dispatched_count} tasks for campaign {campaign_id}.")

            # ---------------------------------------------------------
            # 2. Process Unsubscribe Requests
            # ---------------------------------------------------------
            unsub_ref = db.collection('unsubscribe_requests')
            unsub_query = unsub_ref.where(filter=FieldFilter('status', '==', 'pending'))
            unsub_results = unsub_query.stream()
            
            for doc in unsub_results:
                data = doc.to_dict()
                email_to_remove = data.get('email')
                request_time = data.get('timestamp')
                
                print(f"Processing Unsubscribe: {email_to_remove}")
                
                # Notify Admin (Optional)
                admins = ["contato@academiadogas.com.br", "pdonassolo@gmail.com"]
                subject = f"Solicitação de Descadastro: {email_to_remove}"
                body = f"Novo Descadastro Solicitado: {email_to_remove} em {request_time}"
                
                for admin in admins:
                    send_email_task.delay(admin, subject, body, 'SYSTEM_NOTIFICATION')
                
                unsub_ref.document(doc.id).update({'status': 'processed'})

            # ---------------------------------------------------------
            # 3. Check for Finished Campaigns (Optimization)
            # ---------------------------------------------------------
            active_campaigns = campaigns_ref.where(filter=FieldFilter('status', '==', 'sending')).stream()
            for ac in active_campaigns:
                data = ac.to_dict()
                sent = data.get('sentCount', 0)
                failed = data.get('failedCount', 0)
                total = data.get('totalRecipients', 0)
                
                # Watchdog: If campaign is 'sending' but total is missing, fix it
                if total == 0 or total is None:
                    contacts = data.get('contacts', [])
                    total = len(contacts)
                    if total > 0:
                        print(f"Watchdog: Initializing missing totalRecipients for {ac.id}")
                        campaigns_ref.document(ac.id).update({'totalRecipients': total})
                
                # Normal finalization or N-1 fallback for robustness
                if total > 0 and (sent + failed) >= total:
                    print(f"Finalizing Campaign: {data.get('name')} (Complete: {sent+failed}/{total})")
                    campaigns_ref.document(ac.id).update({
                        'status': 'sent',
                        'sentAt': firestore.SERVER_TIMESTAMP
                    })
                elif total > 10 and (sent + failed) >= (total - 1) and (sent + failed) > 0:
                    # Finalize if stuck at 99.9%
                    print(f"Robust Finalization: {data.get('name')} ({sent+failed}/{total})")
                    campaigns_ref.document(ac.id).update({
                        'status': 'sent',
                        'sentAt': firestore.SERVER_TIMESTAMP
                    })

            if not has_campaigns:
                # No campaigns pending, wait a bit
                time.sleep(10)
            else:
                # Small wait between campaigns
                time.sleep(2)
                
        except Exception as e:
            print(f"Orchestrator Error: {e}")
            time.sleep(10)
