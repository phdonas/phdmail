
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase init error: {e}")

db = firestore.client()

def inspect_recent():
    print("Reading campaigns...")
    campaigns_ref = db.collection('campaigns')
    all_docs = campaigns_ref.stream()
    
    campaigns = []
    for doc in all_docs:
        data = doc.to_dict()
        data['id'] = doc.id
        campaigns.append(data)
        
    # Sort by 'sentAt' descending (string comparison works for ISO dates usually, but fallback to 0)
    campaigns.sort(key=lambda x: str(x.get('sentAt', '0')), reverse=True)
    
    output_filename = 'inspection_report.txt'
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write("=== INSPECIONANDO AS 5 ÚLTIMAS CAMPANHAS SALVAS ===\n")
        
        for c in campaigns[:5]:
            f.write(f"\nID: {c.get('id')}\n")
            f.write(f"Nome: {c.get('name')}\n")
            f.write(f"Status: {c.get('status')}\n")
            f.write(f"sentAt: {c.get('sentAt')}\n")
            
            contacts = c.get('contacts', [])
            total = c.get('totalRecipients', 'N/A')
            sent = c.get('sentCount', 'N/A')
            failed = c.get('failedCount', 'N/A')
            
            contacts_len = len(contacts) if isinstance(contacts, list) else 'NOT A LIST'
            f.write(f"Contacts (Array Length): {contacts_len}\n")
            
            if isinstance(contacts, list) and len(contacts) > 0:
                f.write(f"Sample Contact: {contacts[0]}\n")
            
            f.write(f"Stats stored: Total={total}, Sent={sent}, Failed={failed}\n")
            
            if c.get('status') == 'sent' and sent == 0 and failed == 0:
                 f.write(">> ALERTA: Campanha marcada como SENT mas contadores são 0.\n")
                 if isinstance(contacts, list) and len(contacts) > 0:
                     f.write("   ERRO GRAVE: Existem contatos mas não foram processados.\n")
                     f.write("   Causa Provável: Orchestrator antigo rodando ou falha ao salvar status 'queued'.\n")
            
            f.write("-" * 40 + "\n")

    print(f"Relatório salvo em {output_filename}")

if __name__ == "__main__":
    inspect_recent()
