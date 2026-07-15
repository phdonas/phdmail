
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def extract_content():
    campaign_name = "Você conhece a Margem de Contribuição sexta"
    print(f"Buscando campanha: '{campaign_name}'...")
    
    campaigns_ref = db.collection('campaigns')
    query = campaigns_ref.where('name', '==', campaign_name).limit(1)
    results = query.stream()
    
    found = False
    for doc in results:
        found = True
        data = doc.to_dict()
        
        output_file = "conteudo_campanha_extrated.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"=== CAMPANHA: {data.get('name')} ===\n\n")
            f.write(f"ASSUNTO: {data.get('subject')}\n")
            f.write("-" * 40 + "\n\n")
            
            f.write("CONTEÚDO (HTML):\n")
            f.write(data.get('content', ''))
            f.write("\n\n" + "-" * 40 + "\n\n")
            
            f.write("LINKS E IMAGENS:\n")
            f.write(f"Imagem Principal URL: {data.get('imageUrl')}\n")
            f.write(f"Link da Imagem: {data.get('imageLink')}\n")
            f.write(f"Botão CTA Texto: {data.get('ctaText')}\n")
            f.write(f"Botão CTA URL: {data.get('ctaUrl')}\n\n")
            
            f.write("RODAPÉ:\n")
            f.write(f"Texto Rodapé: {data.get('footerText')}\n")
            f.write(f"Link Rodapé Texto: {data.get('footerLinkText')}\n")
            f.write(f"Link Rodapé URL: {data.get('footerLinkUrl')}\n")
            f.write(f"Botão Rodapé Texto: {data.get('footerButtonText')}\n")
            f.write(f"Botão Rodapé URL: {data.get('footerButtonUrl')}\n")
            f.write(f"Imagem Rodapé URL: {data.get('footerImageUrl')}\n")
            
        print(f"Conteúdo salvo em: {output_file}")
        
    if not found:
        print("Campanha não encontrada! Verifique o nome exato.")

if __name__ == "__main__":
    extract_content()
