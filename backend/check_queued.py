
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def check_all():
    print("=== RELATÓRIO DE STATUS DAS CAMPANHAS ===")
    campaigns_ref = db.collection('campaigns')
    all_campaigns = campaigns_ref.stream()
    
    count = 0
    queued_count = 0
    
    for doc in all_campaigns:
        data = doc.to_dict()
        name = data.get('name', 'Sem Nome')
        status = data.get('status', 'Sem Status')
        cid = doc.id
        
        print(f"[{status.upper()}] - {name} (ID: {cid})")
        
        if status == 'queued':
            queued_count += 1
            
        count += 1

    print("-" * 30)
    print(f"Total de Campanhas: {count}")
    print(f"Total na Fila (QUEUED): {queued_count}")
    
    if queued_count > 0:
        print("\nALERTA: Existem campanhas na fila! O Orchestrator deveria estar processando isso.")
        print("Se ele está rodando e não processa, verifique se está conectado ao MESMO PROJETO Firebase:")
        print(f"Projeto atual do script: {db.project}")
    else:
        print("\nCONCLUSÃO: Não há nenhuma campanha 'queued'. O Orchestrator está certo em ficar quieto.")
        print("O problema é que o site NÃO salvou o status como 'queued' ao clicar em Enviar.")

if __name__ == "__main__":
    check_all()
