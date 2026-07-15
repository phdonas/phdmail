
import boto3
from botocore.exceptions import ClientError
from celery_app import app
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.api_core import exceptions

load_dotenv()

# Initialize Firebase (if not already initialized in main process, but Celery workers are separate processes)
# We need to ensure we don't initialize multiple times if workers fork
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# AWS SES Configuration
SES_REGION = os.getenv('SES_REGION', 'eu-north-1')
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
SENDER_EMAIL = os.getenv('SENDER_EMAIL') # Must be verified in SES

ses_client = boto3.client(
    'ses',
    region_name=SES_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

@app.task(bind=True, max_retries=3)
def send_email_task(self, recipient_email, subject, context, campaign_id):
    """
    Sends an email using AWS SES with a full HTML template.
    context: dict containing 'content', 'imageUrl', 'imageLink', 'ctaText', 'ctaUrl', 'socialLinks'
    """
    charset = "UTF-8"
    
    # Extract fields with safe defaults
    # If context is just a string (legacy support), treat it as content
    if isinstance(context, str):
        content_html = context
        image_url = None
        image_link = None
        cta_text = None
        cta_url = None
        social_links = []
    else:
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

    # Build HTML Template
    # We use a table-based layout for maximum compatibility with email clients
    
    # Header Image Logic
    header_html = ""
    if image_url:
        img_tag = f'<img src="{image_url}" alt="Banner" style="width: 100%; max-width: 600px; height: auto; border: 0; display: block;" />'
        if image_link:
            header_html = f'<a href="{image_link}" target="_blank">{img_tag}</a>'
        else:
            header_html = img_tag

    # CTA Button Logic
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

    # Tracking Configuration
    TRACKING_BASE_URL = "https://us-central1-phdmail-683eb.cloudfunctions.net/api"
    
    import base64
    def safe_b64encode(s):
        return base64.urlsafe_b64encode(s.encode()).decode()

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
    
    # Social Links Logic
    social_html = ""
    if social_links:
        icons_html = ""
        for link in social_links:
            new_link = link.copy()
            if new_link.get('url'):
                new_link['url'] = create_tracking_link(new_link['url'])
            
            platform = new_link.get('platform', '')
            url = new_link.get('url', '#')
            icons_html += f'<a href="{url}" style="margin: 0 10px; text-decoration: none; color: #64748b; font-size: 14px; font-family: sans-serif;">{platform.capitalize()}</a>'
        
        social_html = f'''
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            {icons_html}
        </div>
        '''

    # Footer Section Logic
    custom_footer_html = ""
    
    # Optional Footer Button
    if footer_button_text and footer_button_url:
        custom_footer_html += f'''
        <div style="text-align: center; margin-bottom: 20px;">
             <a href="{footer_button_url}" target="_blank" style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; background-color: #64748b; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold;">{footer_button_text}</a>
        </div>
        '''

    # Optional Footer Text and Link
    if footer_text or (footer_link_text and footer_link_url):
        custom_footer_html += '<div style="text-align: center; margin-bottom: 20px; color: #64748b; font-size: 14px;">'
        if footer_text:
            custom_footer_html += f'<p>{footer_text}</p>'
        if footer_link_text and footer_link_url:
            custom_footer_html += f'<p><a href="{footer_link_url}" style="color: #4F46E5;">{footer_link_text}</a></p>'
        custom_footer_html += '</div>'

    # Optional Footer Image
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
                
                <div style="text-align: center;">
                    {cta_html}
                </div>
                
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

    # Idempotency Check: Prevent duplicate sends for the same campaign
    delivery_ref = db.collection('campaigns').document(campaign_id).collection('deliveries').document(recipient_email)
    try:
        delivery_ref.create({'sentAt': firestore.SERVER_TIMESTAMP})
    except exceptions.AlreadyExists:
        print(f"SKIP | Already sent to {recipient_email} (Campaign: {campaign_id})")
        return {"status": "skipped", "message": "Already sent", "recipient": recipient_email}
    except Exception as e:
        print(f"IDEMPOTENCY_ERROR | {recipient_email}: {e}")
        # If firestore fails, we proceed with caution or log it.

    try:
        response = ses_client.send_email(
            Destination={'ToAddresses': [recipient_email]},
            Message={
                'Body': {
                    'Html': {'Charset': charset, 'Data': full_html},
                    'Text': {'Charset': charset, 'Data': "Visualize este email em um navegador para ver o conteúdo completo."} 
                },
                'Subject': {'Charset': charset, 'Data': subject},
            },
            Source=SENDER_EMAIL,
        )
        
        # Log success (In production, maybe update a 'campaign_logs' subcollection)
        print(f"SUCCESS | Sent to {recipient_email} | Campaign: {campaign_id}")
        
        # Atomic increment of sentCount with self-healing
        campaign_ref = db.collection('campaigns').document(campaign_id)
        try:
            # We first try to increment. If it fails or if we want to ensure fields exist:
            campaign_ref.update({'sentCount': firestore.Increment(1)})
        except Exception as e:
            print(f"RECOVERY | Attempting to initialize missing counters for {campaign_id}")
            try:
                # Fallback: Fetch doc to get total contacts and initialize
                snap = campaign_ref.get()
                if snap.exists:
                    c_data = snap.to_dict()
                    total = len(c_data.get('contacts', []))
                    campaign_ref.update({
                        'sentCount': 1,
                        'failedCount': 0,
                        'totalRecipients': total,
                        'status': 'sending'
                    })
                else:
                    print(f"ERROR | Campaign {campaign_id} not found during recovery")
            except Exception as re_err:
                print(f"CRITICAL | Auto-healing failed for {campaign_id}: {re_err}")
        
        return {"status": "success", "id": response['MessageId'], "recipient": recipient_email}

    except ClientError as e:
        error_message = e.response['Error']['Message']
        print(f"Error sending to {recipient_email}: {error_message}")
        
        # If it's a throttling error or temporary issue, retry
        if "Throttling" in error_message or "ServiceUnavailable" in error_message:
             raise self.retry(exc=e, countdown=60)
             
        # Persist error and increment failedCount
        try:
            campaign_ref = db.collection('campaigns').document(campaign_id)
            campaign_ref.update({
                'failedCount': firestore.Increment(1),
                'failedResults': firestore.ArrayUnion([{
                    'email': recipient_email,
                    'error': error_message,
                    'timestamp': firestore.SERVER_TIMESTAMP
                }])
            })
            

        except Exception as db_err:
            print(f"Failed to log error to Firestore: {db_err}")

        return {"status": "error", "message": error_message, "recipient": recipient_email}

    except Exception as e:
        print(f"Unexpected error sending to {recipient_email}: {e}")
        try:
            campaign_ref = db.collection('campaigns').document(campaign_id)
            campaign_ref.update({
                'failedCount': firestore.Increment(1),
                'failedResults': firestore.ArrayUnion([{
                    'email': recipient_email,
                    'error': f"Unexpected: {str(e)}",
                    'timestamp': firestore.SERVER_TIMESTAMP
                }])
            })
        except Exception as db_err:
            print(f"Failed to log unexpected error to Firestore: {db_err}")
            
        return {"status": "error", "message": str(e), "recipient": recipient_email}

