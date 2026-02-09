# 🚀 GUIA COMPLETO DE DEPLOY - Site PHDonassolo.com

**Versão:** 2.0 - Sem Gemini AI  
**Data:** 31 de Janeiro de 2026  
**Tempo estimado:** 30-40 minutos

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- ✅ Node.js instalado (versão 18 ou superior)
- ✅ Git instalado
- ✅ Acesso ao cPanel do HostGator
- ✅ WordPress com API REST funcionando
- ✅ 4 categorias criadas no WordPress

---

## 🔧 PASSO 1: PREPARAR O AMBIENTE LOCAL

### 1.1 Baixar os arquivos corrigidos

Você recebeu um ZIP com todos os arquivos. Descompacte em uma pasta local.

```bash
# Se estiver usando Git, faça pull do repositório
cd /caminho/do/seu/projeto
git pull origin main
```

### 1.2 Instalar dependências

```bash
npm install
```

**Aguarde:** Isso pode levar 2-5 minutos dependendo da sua conexão.

### 1.3 Testar localmente (OPCIONAL mas recomendado)

```bash
npm run dev
```

Abra: http://localhost:3000

**Valide:**
- ✅ Site carrega corretamente
- ✅ Não há erros no console do navegador
- ✅ Navegação entre páginas funciona
- ✅ Botão WhatsApp aparece
- ✅ Footer está correto

---

## 🏗️ PASSO 2: FAZER BUILD PARA PRODUÇÃO

### 2.1 Executar build

```bash
npm run build
```

**O que acontece:**
- TypeScript é compilado para JavaScript
- Código é minificado e otimizado
- Arquivos são gerados na pasta `dist/`

**Tempo estimado:** 30 segundos a 2 minutos

### 2.2 Verificar se build funcionou

Você deve ver uma pasta `dist/` criada com esta estrutura:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [outros arquivos]
└── .htaccess (se copiado)
```

### 2.3 Testar build localmente (OPCIONAL)

```bash
npm run preview
```

Abra: http://localhost:4173

---

## 📦 PASSO 3: PREPARAR ARQUIVOS PARA UPLOAD

### 3.1 Copiar .htaccess para dist/

```bash
# No terminal, dentro da pasta do projeto:
cp .htaccess dist/
```

**IMPORTANTE:** O .htaccess DEVE estar dentro da pasta dist/ antes do upload!

### 3.2 Verificar arquivos que serão enviados

Dentro de `dist/` você deve ter:
- ✅ index.html
- ✅ .htaccess
- ✅ pasta assets/ com os arquivos JS e CSS

---

## 🌐 PASSO 4: FAZER UPLOAD NO HOSTGATOR

### OPÇÃO A: Via cPanel File Manager (Recomendado)

#### 4.1 Fazer BACKUP do site atual (CRÍTICO!)

1. Entre no cPanel: https://cpanel.hostgator.com
2. Vá em: **Arquivos → Gerenciador de arquivos**
3. Navegue até: `public_html/`
4. Selecione TODOS os arquivos (exceto a pasta `wordpress/`)
5. Clique em **Comprimir**
6. Salve como: `backup-site-antigo-31jan2026.zip`
7. Baixe esse backup para seu computador

#### 4.2 Limpar arquivos antigos

Na pasta `public_html/`:
1. **CUIDADO:** NÃO delete a pasta `wordpress/`
2. Delete apenas:
   - `index.html` (se existir)
   - Pasta `assets/` (se existir do site antigo)
   - Qualquer outro arquivo do site antigo

**ATENÇÃO:** Mantenha INTACTAS estas pastas:
- ✅ `wordpress/` (NÃO MEXER!)
- ✅ `.well-known/` (certificado SSL)
- ✅ `cgi-bin/` (configurações)

#### 4.3 Fazer upload dos arquivos novos

1. Entre na pasta `public_html/`
2. Clique em **Upload** no menu superior
3. Selecione TODOS os arquivos de dentro da pasta `dist/`:
   - `index.html`
   - `.htaccess`
   - Pasta `assets/` completa
4. Aguarde upload completar (pode levar 2-5 minutos)

#### 4.4 Verificar permissões

1. Selecione o arquivo `.htaccess`
2. Clique em **Permissões** ou **Change Permissions**
3. Defina como: **644**
4. Clique OK

### OPÇÃO B: Via FTP (FileZilla)

1. Abra FileZilla
2. Conecte-se:
   - Host: `ftp.phdonassolo.com`
   - Usuário: `phdon519`
   - Senha: [sua senha]
   - Porta: 21
3. Navegue até: `/home2/phdon519/public_html/`
4. Faça backup (baixe tudo exceto `wordpress/`)
5. Delete arquivos antigos (mantenha `wordpress/`)
6. Envie conteúdo da pasta `dist/` para `public_html/`

---

## ✅ PASSO 5: VALIDAR O DEPLOY

### 5.1 Testar o site

Abra: https://phdonassolo.com

**Checklist de validação:**

- [ ] Site carrega sem erros
- [ ] Design aparece corretamente (fontes, cores)
- [ ] Navegação funciona (clique em todos os menus)
- [ ] Página de artigos carrega (mesmo que vazia)
- [ ] Botão WhatsApp aparece no canto inferior direito
- [ ] Footer aparece corretamente
- [ ] Site é responsivo (teste no celular)

### 5.2 Testar integração WordPress

1. Publique um post de teste no WordPress:
   - Título: "Teste de Sincronização"
   - Categoria: "Professor Paulo"
   - Featured Image: Qualquer imagem
   - Publique

2. Abra: https://phdonassolo.com/#/artigos

3. **Aguarde 10 segundos** (cache)

4. Dê F5 (refresh) na página

**Deve aparecer:** Seu artigo de teste na lista!

**Se NÃO aparecer:**
- Limpe cache do navegador (Ctrl+Shift+Del)
- Teste: https://phdonassolo.com/wordpress/wp-json/wp/v2/posts
- Deve retornar JSON com seus posts

### 5.3 Testar em diferentes dispositivos

- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Tablet
- [ ] Celular Android
- [ ] iPhone

### 5.4 Testar velocidade

Acesse: https://pagespeed.web.dev

Coloque: https://phdonassolo.com

**Meta:** Score acima de 80 no mobile e desktop

---

## 🔧 PASSO 6: CONFIGURAÇÕES FINAIS

### 6.1 Configurar Google Analytics (se ainda não fez)

1. Abra: `dist/index.html` em um editor de texto
2. Procure por: `G-XXXXXXXXXX` (aparece 2 vezes)
3. Substitua pelo seu ID real do Google Analytics
4. Salve e faça upload novamente

### 6.2 Adicionar imagem Open Graph

1. Crie uma imagem 1200x630px com:
   - Logo do site
   - Texto: "PH Donassolo - Hub de Conteúdo"
   - Fundo clean
2. Salve como: `og-image.jpg`
3. Faça upload para: `public_html/og-image.jpg`

### 6.3 Configurar SSL (se ainda não tiver)

1. cPanel → Segurança → SSL/TLS
2. Ative Let's Encrypt gratuito
3. Selecione: phdonassolo.com
4. Clique em Instalar

---

## 🐛 TROUBLESHOOTING - PROBLEMAS COMUNS

### Problema 1: Site mostra página em branco

**Solução:**
1. Abra console do navegador (F12)
2. Veja os erros
3. Geralmente é cache - limpe (Ctrl+Shift+Del)
4. Teste em aba anônima

### Problema 2: Artigos do WordPress não aparecem

**Soluções:**
1. Teste API: https://phdonassolo.com/wordpress/wp-json/wp/v2/posts
2. Se der 404, vá em WordPress → Configurações → Links Permanentes → Salvar
3. Limpe cache do localStorage:
   - Console do navegador (F12)
   - Digite: `localStorage.clear()`
   - Enter
   - Recarregue (F5)

### Problema 3: CSS não carrega (site sem estilo)

**Solução:**
1. Verifique se pasta `assets/` foi enviada completa
2. Verifique permissões do .htaccess (deve ser 644)
3. Limpe cache do navegador

### Problema 4: Links não funcionam (erro 404)

**Solução:**
1. Verifique se .htaccess está em `public_html/`
2. Verifique conteúdo do .htaccess (deve ter as regras de rewrite)
3. Entre no cPanel → Software → Select PHP Version
4. Verifique se mod_rewrite está ativo

### Problema 5: WhatsApp não abre

**Solução:**
1. Verifique número em `config/site-config.ts`
2. Formato correto: `351910298213` (sem espaços, sem +)
3. Faça build novamente e upload

---

## 📊 CHECKLIST FINAL

Antes de considerar o deploy concluído:

### Funcionalidade
- [ ] Site carrega em https://phdonassolo.com
- [ ] Todas as páginas navegam corretamente
- [ ] Artigos do WordPress sincronizam
- [ ] WhatsApp funciona
- [ ] Formulários funcionam (se houver)
- [ ] Site é responsivo

### Performance
- [ ] PageSpeed Score > 80
- [ ] Imagens carregam rápido
- [ ] Sem erros no console

### SEO
- [ ] Título da página está correto
- [ ] Meta description está ok
- [ ] Open Graph tags funcionando
- [ ] Google Analytics rastreando

### Segurança
- [ ] SSL ativo (https)
- [ ] .htaccess com regras de segurança
- [ ] WordPress atualizado
- [ ] Senhas fortes

---

## 🎉 PARABÉNS!

Se chegou até aqui, seu site está no ar e funcionando!

### Próximos passos recomendados:

1. **Publicar conteúdo no WordPress**
   - Vá categorizando seus posts nos 4 pilares
   - Adicione featured images
   - Otimize SEO de cada post

2. **Monitorar Analytics**
   - Acompanhe visitantes
   - Veja páginas mais acessadas
   - Analise comportamento

3. **Backup regular**
   - Configure backup automático no HostGator
   - Ou use plugin no WordPress

4. **Melhoria contínua**
   - Colete feedback dos usuários
   - Teste A/B
   - Adicione novos conteúdos

---

## 📞 SUPORTE

**Em caso de problemas:**

1. Revise este guia completamente
2. Veja a seção de Troubleshooting
3. Verifique console do navegador (F12) para erros
4. Teste em aba anônima
5. Se persistir, entre em contato com suporte HostGator

---

**Desenvolvido por:** Claude (Anthropic)  
**Para:** Prof. Paulo H. Donassolo  
**Data:** 31 de Janeiro de 2026  
**Versão:** 2.0 Final
