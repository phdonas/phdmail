import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# BUSQUE O ID DA CAMPANHA NO SEU DASHBOARD (ou usaremos o nome)
campaign_name = "Campanha DRE Sexta 20_02"
docs = db.collection('campaigns').where('name', '==', campaign_name).stream()

for doc in docs:
    print(f"Fixing campaign: {doc.id}")
    doc.reference.update({
        'totalRecipients': 2712,
        'sentCount': 880, # Coloque o número que você viu no SES aproximadamente
        'failedCount': 0
    })
    print("Pronto! Verifique o app agora.")