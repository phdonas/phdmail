
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def force_reset():
    campaigns_ref = db.collection('campaigns')
    # Busca por nome exato ou parcial da campanha problemática
    # Nota: Firestore não tem 'contains', então vamos pegar todas e filtrar no python (seguro para poucas campanhas)
    all_campaigns = campaigns_ref.stream()
    
    target_name = "Campanha DRE Sexta 20_02"
    
    print(f"Procurando campanha: '{target_name}'...")
    
    found = False
    for doc in all_campaigns:
        data = doc.to_dict()
        name = data.get('name', '')
        
        if target_name in name:
            found = True
            print(f"--> ENCONTRADA: {name} (Status Atual: {data.get('status')})")
            print("--> RESETANDO PARA RASCUNHO E ZERANDO CONTADORES...")
            
            campaigns_ref.document(doc.id).update({
                'status': 'draft',
                'sentAt': firestore.DELETE_FIELD, # Remove o campo de data de envio
                'sentCount': 0,
                'failedCount': 0,
                'totalRecipients': 0,
                'failedResults': []
            })
            print("--> FEITO!")
            break
    
    if not found:
        print("Campanha não encontrada pelo nome.")

if __name__ == "__main__":
    force_reset()
