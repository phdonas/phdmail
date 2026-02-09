# Rodando em Produção (Teste Real)

Como sua arquitetura é híbrida (Frontend na Nuvem + Backend Local), "rodar em produção" significa que o Frontend estará acessível na internet e o Backend processará os envios reais.

## 1. O Conceito

-   **Frontend (React)**: Pode rodar localmente (`localhost`) OU ser hospedado no Firebase Hosting (URL pública). Ambos acessam o **mesmo** banco de dados de produção.
-   **Backend (Python)**: Roda na sua máquina (ou num servidor VPS futuro). Ele lê do banco de produção e envia emails reais via AWS.

## 2. Passo a Passo para Teste Real

### A. Iniciar o Backend (O "Motor" de Envio)
Abra dois terminais na pasta `backend/`:

**Terminal 1 (Fila de Processamento):**
```bash
celery -A celery_app worker --pool=solo --loglevel=info
```
*(Deixe rodando. Você verá logs quando e-mails forem enviados.)*

**Terminal 2 (Orquestrador):**
```bash
python main.py
```
*(Deixe rodando. Ele buscará novas campanhas a cada 10 segundos.)*

### B. Iniciar ou Deployar o Frontend (A "Interface")

**Opção 1: Rodar Localmente (Mais Rápido)**
```bash
npm run dev
```
Acesse `http://localhost:5173`.

**Opção 2: Publicar na Internet (Firebase Hosting)**
1.  Instale as ferramentas do Firebase (se não tiver): `npm install -g firebase-tools`
2.  Faça login: `npx firebase login`
3.  Inicialize (apenas na primeira vez): `npx firebase init hosting`
    -   Public directory: `dist`
    -   Single-page app: `Yes`
4.  Faça o deploy:
    ```bash
    npm run build
    npx firebase deploy
    ```
5.  O terminal mostrará a URL do seu site (ex: `https://seu-projeto.web.app`).

### C. Testar o Envio
1.  Acesse o frontend (Local ou Publicado).
2.  Crie uma nova campanha.
3.  **Importante**: Use e-mails reais seus para teste (ex: seu.email@gmail.com).
4.  Clique em **Enviar**.
5.  **Observe o Terminal do Celery**: Você verá as tarefas sendo processadas e os logs de sucesso da AWS SES.
6.  Verifique sua caixa de entrada!
