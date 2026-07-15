import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firestore
cred = credentials.Certificate('backend/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def inspect_campaign(campaign_name):
    print(f"--- Searching for Campaign: '{campaign_name}' ---")
    
    docs = db.collection('campaigns').where('name', '==', campaign_name).stream()
    
    campaign = None
    for doc in docs:
        campaign = doc.to_dict()
        print(f"Found Campaign ID: {doc.id}")
        break
        
    if not campaign:
        print("Campaign not found.")
        return

    print("\n--- Links in Campaign Data ---")
    print(f"Subject: {campaign.get('subject')}")
    print(f"CTA URL: {campaign.get('ctaUrl')}")
    print(f"Image Link: {campaign.get('imageLink')}")
    print(f"Footer Button URL: {campaign.get('footerButtonUrl')}")
    print(f"Footer Link URL: {campaign.get('footerLinkUrl')}")
    print(f"Footer Image Link: {campaign.get('footerImageLink')}")
    
    social_links = campaign.get('socialLinks', [])
    print(f"\nSocial Links: {len(social_links)}")
    for link in social_links:
        print(f"  {link.get('platform')}: {link.get('url')}")

    print("\n--- Raw Content Excerpt (first 500 chars) ---")
    content = campaign.get('content', '')
    print(content[:500])
    
    # Analyze if links are present in content
    import re
    links = re.findall(r'href="([^"]+)"', content)
    print(f"\nLinks found in HTML body: {len(links)}")
    for l in links:
        print(f"  - {l}")

if __name__ == "__main__":
    inspect_campaign("teste de campanha agora ")
