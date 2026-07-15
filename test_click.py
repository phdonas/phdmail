import base64
import re
import urllib.parse

def simulate_click(url_param, c_param=None, e_param=None):
    print(f"--- Simulating for url='{url_param}' ---")
    
    # 1. Unquote
    target_enc = urllib.parse.unquote(url_param)
    print(f"Step 1 (Unquote): {target_enc}")
    
    # 2. Handle merged parameters
    c_id = c_param
    email_enc = e_param
    if '&' in target_enc or '%26' in target_enc:
        target_enc = target_enc.replace('%26', '&')
        parts = target_enc.split('&')
        target_enc = parts[0]
        print(f"Step 2 (Split): target_enc={target_enc}")
        if not c_id:
            for p in parts[1:]:
                if p.startswith('c='): 
                    c_id = p[2:]
                    print(f"  Found c_id: {c_id}")
        if not email_enc:
            for p in parts[1:]:
                if p.startswith('e='): 
                    email_enc = p[2:]
                    print(f"  Found email_enc: {email_enc}")

    target_url = "https://www.phdonassolo.com"
    raw_url = None
    
    # 3. Decoding
    cleaned_enc = target_enc.strip()
    if cleaned_enc.lower().startswith('http'):
        raw_url = cleaned_enc
        print(f"Step 3: Raw URL detected: {raw_url}")
    else:
        b64_chars = re.sub(r'[^a-zA-Z0-9\-_=]', '', cleaned_enc)
        for attempt in [cleaned_enc, b64_chars]:
            if not attempt or len(attempt) < 4: continue
            print(f"  Attempting B64 decode on: {attempt}")
            try:
                padded = attempt + '=' * (-len(attempt) % 4)
                for decoder in [base64.urlsafe_b64decode, base64.b64decode]:
                    try:
                        decoded = decoder(padded.encode()).decode('utf-8', errors='ignore')
                        if 'http' in decoded.lower():
                            raw_url = decoded
                            print(f"  SUCCESS! Decoded: {raw_url}")
                            break
                    except: continue
                if raw_url: break
            except: continue

    # 4. Extraction
    if raw_url:
        url_match = re.search(r'(https?://[^\s<>"]+)', raw_url, re.IGNORECASE)
        if url_match:
            target_url = url_match.group(1)
            print(f"Step 4 (Match): FINAL URL = {target_url}")
        elif raw_url.lower().startswith('http'):
            target_url = raw_url
            print(f"Step 4 (Fallback): FINAL URL = {target_url}")
    else:
        print(f"Step 4: NO URL FOUND. Falling back to: {target_url}")

# Test with the link provided by user
test_url = "aHR0cHM6Ly93d3cucGhkb25hc3NvbG8uY29tL2xwL3NpbXVsYWRvci1wcmVjby1kdXBsYQ==%26c=s3f2xu10d%26e=cGRvbmFzc29sb0BnbWFpbC5jb20=/2/0110019c8a8369b6-40b03167-c9fb-4698-926f-7dfe219d9c67-000000/ZKXFD_F75cKryQ0DaVCEvSRSYvY=251"
simulate_click(test_url)
