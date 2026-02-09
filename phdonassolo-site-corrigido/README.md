# 🌐 Site PHDonassolo.com - Versão 2.0

**Hub de Conteúdo Profissional**  
Site moderno com React + TypeScript + WordPress Headless

---

## 📋 Sobre o Projeto

Site profissional do Prof. Paulo H. Donassolo, especialista em gestão comercial, vendas e negociação. O site serve como hub de conteúdo organizado em 4 pilares:

1. **Professor Paulo** - Educação e mentoria profissional
2. **Consultoria Imobiliária** - Conteúdos para o mercado imobiliário
3. **4050oumais** - Longevidade produtiva
4. **Academia do Gás** - Gestão de revendas de GLP

---

## 🚀 Stack Tecnológico

- **Frontend:** React 19.2.4 + TypeScript
- **Build:** Vite 6.2.0
- **CMS:** WordPress (Headless via REST API)
- **Design:** Tailwind CSS + Inspiração Apple
- **Ícones:** Lucide React
- **Hospedagem:** HostGator

---

## ⚡ Início Rápido

### Instalação

```bash
# 1. Instale dependências
npm install

# 2. Execute em desenvolvimento
npm run dev

# 3. Acesse http://localhost:3000
```

### Build para Produção

```bash
# Build otimizado
npm run build

# Pasta dist/ será criada com arquivos prontos para deploy
```

---

## 🚀 Deploy no HostGator

**📖 Guia completo:** Veja `DEPLOY.md`

**Resumo:**
1. `npm run build`
2. Upload de `dist/*` para `public_html/`
3. Garantir `.htaccess` está presente
4. Testar: https://phdonassolo.com

---

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local
npm run build        # Build de produção
npm run preview      # Preview do build
npm run clean        # Limpar caches
```

---

## 🔧 Configuração

### Google Analytics

No `index.html`, substitua `G-XXXXXXXXXX` pelo seu ID real.

### WhatsApp

No `config/site-config.ts`, atualize o número se necessário.

---

## 🔄 Integração WordPress

Site sincroniza artigos do WordPress automaticamente:

**Endpoint:** `https://phdonassolo.com/wordpress/wp-json/wp/v2/posts`

**Categorias:** Os posts devem ter uma das categorias:
- `professor-paulo`
- `consultoria-imobiliaria`
- `4050oumais`
- `academia-do-gas`

---

## 📚 Documentação

- **Deploy:** `DEPLOY.md` - Guia passo a passo completo
- **Mudanças:** `CHANGELOG.md` - Todas as alterações
- **Auditoria:** `AUDITORIA_SITE_PHDONASSOLO.md` - Análise inicial

---

## 🐛 Problemas Comuns

### Artigos não aparecem
1. Teste: `https://phdonassolo.com/wordpress/wp-json/wp/v2/posts`
2. Se erro 404: WordPress → Configurações → Permalinks → Salvar
3. Limpe cache: `localStorage.clear()` no console (F12)

### Site em branco
1. Limpe cache do navegador (Ctrl+Shift+Del)
2. Teste em aba anônima
3. Verifique console (F12)

---

## 📞 Contato

**Prof. Paulo H. Donassolo**  
📧 paulo@phdonassolo.com  
📱 +351 910 298 213  
🌐 https://phdonassolo.com

---

**Desenvolvido por:** Claude (Anthropic)  
**Versão:** 2.0 (31/01/2026)
