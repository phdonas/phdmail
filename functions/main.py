import os
import re
import base64
import json
import urllib.parse
import boto3
from botocore.exceptions import ClientError
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore
from google.cloud.firestore import FieldFilter
from google.api_core import exceptions as google_exceptions
from concurrent.futures import ThreadPoolExecutor
import threading

initialize_app()

# AWS SES Configuration
SES_REGION = os.environ.get('SES_REGION', 'eu-north-1')
AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')

def get_ses_client():
    return boto3.client(
        'ses',
        region_name=SES_REGION,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY
    )

def safe_b64encode(s):
    return base64.urlsafe_b64encode(s.encode()).decode()

def safe_b64decode(s):
    if not s: return None
    try:
        s = re.sub(r'[^a-zA-Z0-9\-_+/=]', '', s)
        padding_needed = (4 - (len(s) % 4)) % 4
        padded = s + ('=' * padding_needed)
        for decoder in [base64.urlsafe_b64decode, base64.b64decode]:
            try:
                return decoder(padded.encode()).decode('utf-8', errors='ignore').strip()
            except: continue
    except: pass
    return None

def send_email_ses(recipient_email, subject, context, campaign_id):
    """
    Sends an email using AWS SES.
    """
    ses_client = get_ses_client()
    charset = "UTF-8"
    
    # Extract fields
    content_html = context.get('content', '')
    image_url = context.get('imageUrl')
    image_link = context.get('imageLink')
    cta_text = context.get('ctaText')
    cta_url = context.get('ctaUrl')
    social_links = context.get('socialLinks', [])
    
    # Footer
    footer_text = context.get('footerText')
    footer_link_text = context.get('footerLinkText')
    footer_link_url = context.get('footerLinkUrl')
    footer_button_text = context.get('footerButtonText')
    footer_button_url = context.get('footerButtonUrl')
    footer_image_url = context.get('footerImageUrl')
    footer_image_link = context.get('footerImageLink')

    # Tracking Configuration
    TRACKING_BASE_URL = "https://us-central1-phdmail-683eb.cloudfunctions.net/api"
    
    # Encode Recipient
    email_enc = safe_b64encode(recipient_email)
    
    # 1. Open Pixel
    open_pixel_url = f"{TRACKING_BASE_URL}/track/open?c={campaign_id}&e={email_enc}"
    open_tracking_html = f'<img src="{open_pixel_url}" width="1" height="1" alt="" style="display:none;" />'

    # 2. Link Rewriting Helper
    def create_tracking_link(target_url):
        if not target_url: return target_url
        target_enc = safe_b64encode(target_url)
        return f"{TRACKING_BASE_URL}/track/click?url={target_enc}&c={campaign_id}&e={email_enc}"

    # Rewrite Links
    cta_url = create_tracking_link(cta_url)
    if image_link: image_link = create_tracking_link(image_link)
    footer_link_url = create_tracking_link(footer_link_url)
    footer_button_url = create_tracking_link(footer_button_url)
    footer_image_link = create_tracking_link(footer_image_link)
    
    # Social Links Rewriting
    new_social_links = []
    if social_links:
        for link in social_links:
            new_link = link.copy()
            if new_link.get('url'):
                new_link['url'] = create_tracking_link(new_link['url'])
            new_social_links.append(new_link)
    
    # HTML Construction
    header_html = ""
    if image_url:
        img_tag = f'<img src="{image_url}" alt="Banner" style="width: 100%; max-width: 600px; height: auto; border: 0; display: block;" />'
        if image_link:
            header_html = f'<a href="{image_link}" target="_blank">{img_tag}</a>'
        else:
            header_html = img_tag

    cta_html = ""
    if cta_text and cta_url:
        cta_html = f'''
        <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 30px;">
            <tr>
                <td align="center" bgcolor="#4F46E5" style="border-radius: 8px;">
                    <a href="{cta_url}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 1px solid #4F46E5; display: inline-block; font-weight: bold;">{cta_text}</a>
                </td>
            </tr>
        </table>
        '''

    social_html = ""
    if new_social_links:
        icons_html = ""
        for link in new_social_links:
            platform = link.get('platform', '')
            url = link.get('url', '#')
            icons_html += f'<a href="{url}" style="margin: 0 10px; text-decoration: none; color: #64748b; font-size: 14px; font-family: sans-serif;">{platform.capitalize()}</a>'
        
        social_html = f'''
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            {icons_html}
        </div>
        '''

    custom_footer_html = ""
    if footer_button_text and footer_button_url:
        custom_footer_html += f'''
        <div style="text-align: center; margin-bottom: 20px;">
             <a href="{footer_button_url}" target="_blank" style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; background-color: #64748b; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold;">{footer_button_text}</a>
        </div>
        '''

    if footer_text or (footer_link_text and footer_link_url):
        custom_footer_html += '<div style="text-align: center; margin-bottom: 20px; color: #64748b; font-size: 14px;">'
        if footer_text:
            custom_footer_html += f'<p>{footer_text}</p>'
        if footer_link_text and footer_link_url:
            custom_footer_html += f'<p><a href="{footer_link_url}" style="color: #4F46E5;">{footer_link_text}</a></p>'
        custom_footer_html += '</div>'

    if footer_image_url:
        f_img_tag = f'<img src="{footer_image_url}" alt="Logo" style="width: auto; max-width: 150px; height: auto; margin: 0 auto; display: block;" />'
        if footer_image_link:
            custom_footer_html += f'<div style="text-align: center; margin-bottom: 20px;"><a href="{footer_image_link}" target="_blank">{f_img_tag}</a></div>'
        else:
            custom_footer_html += f'<div style="text-align: center; margin-bottom: 20px;">{f_img_tag}</div>'

    unsubscribe_url = f"https://phdonas-site-corrigido.web.app/#/unsubscribe?email={recipient_email}"
    
    full_html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #f9fafb; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
            .content {{ padding: 20px 40px; line-height: 1.6; color: #334155; }}
            a {{ color: #4F46E5; }}
        </style>
    </head>
    <body style="margin: 0; padding: 20px;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            {header_html}
            <div class="content" style="padding: 30px 40px; color: #334155; font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                {content_html}
                <div style="text-align: center;">{cta_html}</div>
                {social_html}
                <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    {custom_footer_html}
                </div>
                <div style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
                    <p>Você recebeu este e-mail pois se inscreveu em nossa lista.</p>
                    <p><a href="{unsubscribe_url}" style="color: #94a3b8; text-decoration: underline;">Descadastrar-se</a></p>
                </div>
            </div>
            {open_tracking_html}
        </div>
    </body>
    </html>
    '''

    try:
        response = ses_client.send_email(
            Destination={'ToAddresses': [recipient_email]},
            Message={
                'Body': {
                    'Html': {'Charset': charset, 'Data': full_html},
                    'Text': {'Charset': charset, 'Data': "Visualize este email em um navegador."} 
                },
                'Subject': {'Charset': charset, 'Data': subject},
            },
            Source=SENDER_EMAIL,
        )
        print(f"Email sent to {recipient_email}: {response['MessageId']}")
        return True
    except Exception as e:
        print(f"Error sending to {recipient_email}: {e}")
        return False

@firestore_fn.on_document_updated(document="campaigns/{campaignId}", timeout_sec=540, memory=512)
def process_campaign(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    db = firestore.client()
    before_data = event.data.before.to_dict()
    after_data = event.data.after.to_dict()
    campaign_id = event.params["campaignId"]

    if not after_data:
        return

    status_before = before_data.get('status')
    status_after = after_data.get('status')

    if status_after == 'queued' and status_before != 'queued':
        print(f"Starting Campaign Processing: {campaign_id}")
        try:
            segment_type = after_data.get('segmentType', 'csv')
            segment_tags = after_data.get('segmentTags', [])
            
            if segment_type == 'all':
                contacts_ref = db.collection('contacts').where(filter=FieldFilter('status', '==', 'subscribed'))
                recipients = [c.get('email') for c in contacts_ref.stream() if c.get('email')]
            elif segment_type == 'tags' and segment_tags:
                contacts_ref = db.collection('contacts').where(filter=FieldFilter('status', '==', 'subscribed')).where(filter=FieldFilter('tags', 'array_contains_any', segment_tags))
                recipients = [c.get('email') for c in contacts_ref.stream() if c.get('email')]
            else:
                recipients = after_data.get('contacts', [])
                
            subject = after_data.get('subject')
            
            context = {
                'content': after_data.get('content'),
                'imageUrl': after_data.get('imageUrl'),
                'imageLink': after_data.get('imageLink'),
                'ctaText': after_data.get('ctaText'),
                'ctaUrl': after_data.get('ctaUrl'),
                'socialLinks': after_data.get('socialLinks'),
                'footerText': after_data.get('footerText'),
                'footerLinkText': after_data.get('footerLinkText'),
                'footerLinkUrl': after_data.get('footerLinkUrl'),
                'footerButtonText': after_data.get('footerButtonText'),
                'footerButtonUrl': after_data.get('footerButtonUrl'),
                'footerImageUrl': after_data.get('footerImageUrl'),
                'footerImageLink': after_data.get('footerImageLink')
            }
            
            # Fetch campaign data to see if this is a resume/retry
            campaign_ref = db.collection('campaigns').document(campaign_id)
            campaign_snap = campaign_ref.get()
            campaign_data = campaign_snap.to_dict() if campaign_snap.exists else {}
            
            current_sent = campaign_data.get('sentCount', 0)
            current_failed = campaign_data.get('failedCount', 0)
            
            # If counters are already initialized, keep them; otherwise start fresh
            if current_sent == 0 and current_failed == 0:
                campaign_ref.update({
                    'status': 'sending',
                    'sentCount': 0,
                    'failedCount': 0,
                    'totalRecipients': len(recipients)
                })
                sent_count = 0
                failed_count = 0
            else:
                campaign_ref.update({
                    'status': 'sending',
                    'totalRecipients': len(recipients)
                })
                sent_count = current_sent
                failed_count = current_failed

            lock = threading.Lock()
            runaway_triggered = False
            total_expected = len(recipients)
            safety_limit = total_expected + 10

            def send_single_email(recipient):
                nonlocal sent_count, failed_count, runaway_triggered
                
                if runaway_triggered:
                    return

                # Runaway guard check (reservation based)
                with lock:
                    if (sent_count + failed_count) > safety_limit:
                        runaway_triggered = True
                        print(f"RUNAWAY_GUARD | Safety guard triggered for campaign {campaign_id}. Halting execution.")
                        return
                    # Tentatively reserve count
                    sent_count += 1

                # 1. Idempotency Check (Check/Create delivery document in subcollection)
                delivery_ref = db.collection('campaigns').document(campaign_id).collection('deliveries').document(recipient)
                try:
                    delivery_ref.create({'sentAt': firestore.SERVER_TIMESTAMP})
                except google_exceptions.AlreadyExists:
                    print(f"SKIP | Already sent to {recipient} (Campaign: {campaign_id})")
                    with lock:
                        sent_count -= 1
                    return
                except Exception as e:
                    print(f"IDEMPOTENCY_ERROR | Failed to create delivery doc for {recipient}: {e}. Aborting send.")
                    with lock:
                        sent_count -= 1
                        failed_count += 1
                    return

                # 2. Send the Email
                success = send_email_ses(recipient, subject, context, campaign_id)

                # 3. Update Counters
                if success:
                    # Already incremented locally, update Firestore
                    campaign_ref.update({
                        'sentCount': firestore.Increment(1)
                    })
                else:
                    with lock:
                        sent_count -= 1
                        failed_count += 1
                    campaign_ref.update({
                        'failedCount': firestore.Increment(1)
                    })

            # Send concurrently using ThreadPoolExecutor to prevent GCF timeout
            max_workers = 5
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                executor.map(send_single_email, recipients)

            if runaway_triggered:
                campaign_ref.update({
                    'status': 'failed',
                    'error': 'Runaway safety guard triggered: too many send attempts detected.'
                })
            else:
                campaign_ref.update({
                    'status': 'sent',
                    'sentAt': firestore.SERVER_TIMESTAMP,
                    'sentCount': sent_count,
                    'failedCount': failed_count,
                    'totalRecipients': len(recipients),
                    'stats.opens': campaign_data.get('stats', {}).get('opens', 0),
                    'stats.clicks': campaign_data.get('stats', {}).get('clicks', 0)
                })

        except Exception as global_e:
            print(f"FATAL ERROR: {global_e}")
            try: db.collection('campaigns').document(campaign_id).update({'status': 'failed', 'error': str(global_e)})
            except: pass

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    db = firestore.client()
    path = req.path
    
    # 1. Open Tracking
    if '/track/open' in path:
        c_id = req.args.get('c')
        email_enc = req.args.get('e')
        if c_id:
            try: db.collection('campaigns').document(c_id).update({'stats.opens': firestore.Increment(1)})
            except Exception as e: print(f"Open Error: {e}")
            
            if email_enc:
                email = safe_b64decode(email_enc)
                if email:
                    try:
                        db.collection('campaigns').document(c_id).collection('opens').add({
                            'email': email,
                            'openedAt': firestore.SERVER_TIMESTAMP
                        })
                    except Exception as ie:
                        print(f"Failed to record open interaction: {ie}")
        
        transparent_gif = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        return https_fn.Response(transparent_gif, mimetype='image/gif')

    # 2. Click Tracking
    if '/track/click' in path:
        target_enc = req.args.get('url', '')
        c_id = req.args.get('c')
        email_enc = req.args.get('e')
        
        target_enc = urllib.parse.unquote(target_enc)
        if '&' in target_enc or '%26' in target_enc:
            target_enc = target_enc.replace('%26', '&')
            parts = target_enc.split('&')
            target_enc = parts[0]
            if not c_id:
                for p in parts[1:]:
                    if p.startswith('c='): c_id = p[2:]
            if not email_enc:
                for p in parts[1:]:
                    if p.startswith('e='): email_enc = p[2:]

        target_url = "https://www.phdonassolo.com"
        
        try:
            raw_url = None
            if target_enc:
                cleaned_enc = target_enc.strip()
                if cleaned_enc.lower().startswith('http') or cleaned_enc.lower().startswith('www.'):
                    raw_url = cleaned_enc
                    if raw_url.lower().startswith('www.'): raw_url = 'https://' + raw_url
                else:
                    b64_only = re.sub(r'[^a-zA-Z0-9\-_+/=]', '', cleaned_enc)
                    if b64_only:
                        padding_needed = (4 - (len(b64_only) % 4)) % 4
                        padded = b64_only + ('=' * padding_needed)
                        for decoder_func in [base64.urlsafe_b64decode, base64.b64decode]:
                            try:
                                decoded = decoder_func(padded.encode()).decode('utf-8', errors='ignore').strip()
                                if 'http' in decoded.lower() or 'www.' in decoded.lower() or '.' in decoded:
                                    raw_url = decoded
                                    break
                            except: continue

            if raw_url:
                print(f"DEBUG Audit: Found Raw URL: {raw_url}")
                url_match = re.search(r'(https?://[^\s<>"]+)', raw_url, re.IGNORECASE)
                if url_match: target_url = url_match.group(1)
                elif 'www.' in raw_url.lower():
                    domain_match = re.search(r'(www\.[^\s<>"]+)', raw_url, re.IGNORECASE)
                    if domain_match: target_url = 'https://' + domain_match.group(1)
                    else: target_url = raw_url if raw_url.startswith('http') else 'https://' + raw_url
                else: target_url = raw_url if raw_url.startswith('http') else 'https://' + raw_url
                
                if '/2/' in target_url: target_url = target_url.split('/2/')[0]
                print(f"DEBUG Audit: FINAL Redirect: {target_url}")
            else:
                print(f"DEBUG Audit: FAIL - No URL found in: {target_enc}")
            
            if c_id:
                try: db.collection('campaigns').document(c_id).update({'stats.clicks': firestore.Increment(1)})
                except Exception as dbe: print(f"Stats update failed: {dbe}")
                
                if email_enc:
                    email = safe_b64decode(email_enc)
                    if email:
                        try:
                            db.collection('campaigns').document(c_id).collection('clicks').add({
                                'email': email,
                                'clickedAt': firestore.SERVER_TIMESTAMP,
                                'url': target_url
                            })
                        except Exception as ie:
                            print(f"Failed to record click interaction: {ie}")
            
            return https_fn.Response(status=302, headers={'Location': target_url})
        except Exception as e:
            print(f"CRITICAL Tracking Click Error (Audited): {e}")
            return https_fn.Response(status=302, headers={'Location': target_url})

    # 3. Unsubscribe
    if '/unsubscribe' in path:
        if req.method != 'POST': return https_fn.Response("Method Not Allowed", status=405)
        data = req.get_json()
        email = data.get('email')
        if not email: return https_fn.Response("Email required", status=400)
        try:
            docs = db.collection('contacts').where(filter=FieldFilter('email', '==', email)).limit(1).stream()
            for doc in docs: doc.reference.update({'status': 'unsubscribed'})
            db.collection('unsubscribe_requests').add({'email': email, 'requestedAt': firestore.SERVER_TIMESTAMP, 'source': 'web_form', 'status': 'processed'})
            return https_fn.Response("Unsubscribed successfully", status=200)
        except Exception as e:
            print(f"Error unsubscribing: {e}")
            return https_fn.Response(str(e), status=500)

    # 4. SES Webhooks
    if '/webhooks/ses' in path:
        try:
            payload = req.get_json()
            if not payload: return https_fn.Response("Invalid Payload", status=400)
            if payload.get('Type') == 'SubscriptionConfirmation':
                print(f"Confirming SES subscription: {payload.get('SubscribeURL')}")
                return https_fn.Response("Subscription confirmation received", status=200)
            if payload.get('Type') == 'Notification':
                message = json.loads(payload.get('Message', '{}'))
                notification_type = message.get('notificationType')
                if notification_type in ['Bounce', 'Complaint']:
                    notif_data = message.get(notification_type.lower(), {})
                    recipients = notif_data.get('bouncedRecipients' if notification_type == 'Bounce' else 'complainedRecipients', [])
                    for r in recipients:
                        email = r.get('emailAddress')
                        docs = db.collection('contacts').where(filter=FieldFilter('email', '==', email)).limit(1).stream()
                        for doc in docs:
                            doc.reference.update({'status': notification_type.lower(), f'last{notification_type}At': firestore.SERVER_TIMESTAMP})
            return https_fn.Response("Webhook received", status=200)
        except Exception as e:
            print(f"Webhook Error: {e}")
            return https_fn.Response(str(e), status=500)

    return https_fn.Response("Not Found", status=404)
