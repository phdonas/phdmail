
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Setup Inicial
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def fix_campaigns():
    campaigns_ref = db.collection('campaigns')
    print("Buscando campanhas travadas em 'sending'...")
    
    # Buscar campanhas com status 'sending'
    sending_campaigns = campaigns_ref.where('status', '==', 'sending').stream()
    
    found = False
    for doc in sending_campaigns:
        found = True
        data = doc.to_dict()
        name = data.get('name', 'Sem Nome')
        cid = doc.id
        
        print(f"\nEncontrada: {name} (ID: {cid})")
        
        # Lógica para a campanha Antiga (Dia 16 - Cópia) -> Mudar para SENT
        if "Cópia" in name or "Copía" in name: 
            print(f"--> AÇÃO: Mudando '{name}' para ENVIADA (sent).")
            campaigns_ref.document(cid).update({
                'status': 'sent',
                # Marcamos uma data aproximada apenas para constar
                'sentAt': firestore.SERVER_TIMESTAMP 
            })
            
        # Lógica para a campanha de Hoje (Quarta) -> Voltar para DRAFT
        elif "quarta" in name or "Quarta" in name:
            print(f"--> AÇÃO: Resetando '{name}' para RASCUNHO (draft).")
            # Resetamos também os erros anteriores para começar limpo
            campaigns_ref.document(cid).update({
                'status': 'draft',
                'sentCount': 0,
                'failedCount': 0,
                'totalRecipients': 0,
                'failedResults': [] 
            })
        else:
            print("--> Nenhuma ação automática definida para este nome. Mantendo como está.")

    if not found:
        print("Nenhuma campanha com status 'sending' encontrada.")
    else:
        print("\nProcesso concluído! Verifique o painel.")

if __name__ == "__main__":
    fix_campaigns()
