# 🚀 Como Testar em Produção Agora

Seu sistema está pronto! Siga este roteiro exato para enviar sua primeira campanha real.

## 1. Ligue os Motores (Backend)
Vá até a pasta do projeto e clique duas vezes no arquivo `start_backend.bat`.
-   Isso vai abrir duas janelas pretas (terminais) minimizadas.
-   Uma é o **Worker** (que envia os e-mails).
-   A outra é o **Orchestrator** (que vigia o banco de dados).
-   **NÃO FECHE ESSAS JANELAS.**

## 2. Abra o Painel de Controle (Frontend)
Abra um terminal na pasta do projeto e rode:
```bash
npm run dev
```
Acesse o link que aparecer (geralmente `http://localhost:5173`).

## 3. Crie sua Lista de Teste (CSV)
Crie um arquivo simples no Bloco de Notas chamado `teste.csv` com e-mails que você tem acesso (ex: seu pessoal, seu profissional, etc):

```csv
seu.email@gmail.com
outro.email@hotmail.com
```

## 4. Dispare a Campanha
1.  No site, clique em **Nova Campanha**.
2.  Preencha:
    -   **Nome**: Teste de Produção 01
    -   **Assunto**: Olá do PHDMail (Teste AWS)
    -   **Conteúdo**: Este é um teste real enviando via Amazon SES!
3.  No passo **Público**, importe o seu arquivo `teste.csv`.
4.  No passo **Revisão**, clique em **Confirmar e Enviar**.

## 5. Acompanhe a Mágica
Volte para as janelas pretas do backend.
-   No **Orchestrator**, você verá: `Processing Campaign: Teste de Produção 01... Dispatched 2 tasks.`
-   No **Worker**, você verá: `Email sent to seu.email@gmail.com: MessageId=...`

## 6. Verifique sua Caixa de Entrada
Os e-mails devem chegar em instantes. Verifique também a caixa de Spam (às vezes acontece no primeiro envio de domínio novo).
