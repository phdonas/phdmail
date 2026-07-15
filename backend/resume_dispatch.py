import firebase_admin
from firebase_admin import credentials, firestore
from tasks import send_email_task
import time

if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()
campaign_id = 'cw1oq8ru3' # ID da sua campanha

doc_ref = db.collection('campaigns').document(campaign_id)
doc = doc_ref.get()
data = doc.to_dict()

contacts = data.get('contacts', [])
skip = 880 # Já enviados anteriormente
remaining_contacts = contacts[skip:]

print(f"Retomando campanha: {data.get('name')}")
print(f"Total: {len(contacts)} | Já enviados: {skip} | Restantes: {len(remaining_contacts)}")

# Preparar o contexto do e-mail
context = {
    'content': data.get('content'), 'imageUrl': data.get('imageUrl'),
    'imageLink': data.get('imageLink'), 'ctaText': data.get('ctaText'),
    'ctaUrl': data.get('ctaUrl'), 'socialLinks': data.get('socialLinks'),
    'footerText': data.get('footerText'), 'footerLinkText': data.get('footerLinkText'),
    'footerLinkUrl': data.get('footerLinkUrl'), 'footerButtonText': data.get('footerButtonText'),
    'footerButtonUrl': data.get('footerButtonUrl'), 'footerImageUrl': data.get('footerImageUrl'),
    'footerImageLink': data.get('footerImageLink')
}
subject = data.get('subject')

print("Disparando tarefas restantes...")
count = 0
for recipient in remaining_contacts:
    send_email_task.delay(recipient, subject, context, campaign_id)
    count += 1
    if count % 100 == 0:
        print(f"Disparados: {count}...")
        time.sleep(1) # Pequena pausa para estabilidade

print(f"Sucesso! {count} novas tarefas foram para a fila.")