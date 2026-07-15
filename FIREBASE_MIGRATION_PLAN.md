# Plano de Migração para Arquitetura Serverless (Firebase)

Para rodar sua aplicação 100% na nuvem sem precisar manter seu computador ligado ou rodar scripts manuais (`main.py`, `celery`, `redis`), precisamos migrar o Backend para **Google Cloud Functions (2nd Gen)**.

Isso transforma sua automação "ativa" (loop infinito no seu PC) em "reativa" (o código só roda quando algo acontece no banco de dados).

## 1. Pré-requisitos Obrigatórios

1.  **Plano Blaze:** O Firebase exige o plano "Blaze" (Pay-as-you-go) para usar Cloud Functions.
    *   *Custo:* Para seu volume atual, provavelmente ficará dentro do nível gratuito (Free Tier), mas é necessário cadastrar um cartão de crédito.
2.  **Firebase CLI com suporte a Python:** Certifique-se de ter a versão mais recente.

---

## 2. O Novo Fluxo de Funcionamento

### Como é hoje (Local):
1.  **Frontend:** Roda no seu navegador.
2.  **Orchestrator (`main.py`):** Loop infinito no seu PC verificando campanhas novas.
3.  **Worker (`celery`):** Fila no seu PC que processa o envio.
4.  **Redis:** Banco temporário no seu PC (Docker).

### Como ficará (Serverless):
1.  **Frontend:** Hospedado no **Firebase Hosting** (URL pública).
2.  **Gatilho de Campanha (Firestore Trigger):**
    *   Assim que você salvar uma campanha como `queued` no Firestore, o Firebase **automaticamente** acorda uma função na nuvem.
    *   Essa função lê os contatos e envia os e-mails usando a AWS SES (igual seu script fazia).
3.  **API e Webhooks (HTTP Function):**
    *   Uma função HTTP substituirá seu servidor `uvicorn` para receber o `unsubscribe` e os Webhooks da AWS.

---

## 3. Passo a Passo da Migração

### Passo 1: Configurar Ambiente de Funções Python
Inicializaremos o suporte a funções Python dentro do projeto.

```bash
firebase init functions
# Selecione Python como linguagem
```

### Passo 2: Migrar a API (`api.py`)
Moveremos o código do FastAPI para uma Cloud Function HTTP. O Firebase suporta frameworks como Flask ou FastAPI nativamente com a biblioteca `firebase-functions`.

**Resultado:** Você terá uma URL pública (ex: `https://us-central1-phdmail.cloudfunctions.net/api`) para configurar no painel da AWS (SNS).

### Passo 3: Migrar o Orquestrador (`main.py`)
Em vez de um loop `while True`, criaremos uma função **on_document_updated**.

```python
@firestore_fn.on_document_updated(document="campaigns/{campaignId}")
def process_campaign(event):
    # Verifica se status mudou para 'queued'
    # Pega lista de contatos
    # Manda e-mails via AWS SES
```

*Nota:* Para listas muito grandes (>500 contatos), usaremos **Google Cloud Tasks** para não estourar o tempo limite de execução da função.

### Passo 4: Deploy
Com um único comando, tudo sobe para a nuvem:

```bash
firebase deploy
```

---

## 4. Vantagens
1.  **Zero Manutenção:** Não precisa ligar Docker, Redis ou terminais.
2.  **Escalabilidade:** Se 100 pessoas clicarem em descadastro ao mesmo tempo, o Google escala automaticamente.
3.  **Custo:** Você só paga pelos segundos que o código estiver rodando.

## Deseja iniciar este processo agora?
Se sim, o primeiro passo é confirmar se você pode ativar o plano **Blaze** no console do Firebase.
