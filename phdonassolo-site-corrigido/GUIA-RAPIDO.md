# ⚡ GUIA RÁPIDO - PHDonassolo.com

**Para quando você precisar lembrar rapidamente!**

---

## 🚀 DEPLOY EM 5 PASSOS

```bash
# 1. Build
npm run build

# 2. Copiar .htaccess
cp .htaccess dist/

# 3. Acessar cPanel
https://cpanel.hostgator.com

# 4. Upload
dist/* → public_html/

# 5. Testar
https://phdonassolo.com
```

---

## 📝 PUBLICAR ARTIGO NO WORDPRESS

1. WordPress Admin → Posts → Adicionar novo
2. **IMPORTANTE:** Selecionar UMA categoria:
   - Professor Paulo
   - Consultoria Imobiliária  
   - 4050oumais
   - Academia do Gás
3. Adicionar Featured Image
4. Publicar
5. Aguardar 10 seg → F5 no site

---

## 🔧 COMANDOS ÚTEIS

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Limpar tudo
npm run clean
npm run reinstall
```

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Site não carrega
- Ctrl+Shift+Del (limpar cache)
- Testar em aba anônima
- F12 → Console (ver erros)

### Artigos não aparecem
- Testar: phdonassolo.com/wordpress/wp-json/wp/v2/posts
- Console (F12): `localStorage.clear()` + F5
- WordPress: Configurações → Permalinks → Salvar

### CSS quebrado
- Verificar se `assets/` foi enviada
- Verificar se `.htaccess` está presente
- Limpar cache

---

## 📂 ESTRUTURA DE DEPLOY

```
public_html/
├── index.html           ← Do build
├── .htaccess            ← IMPORTANTE!
├── assets/              ← Do build
│   ├── index-[hash].js
│   └── index-[hash].css
└── wordpress/           ← NÃO MEXER!
```

---

## 🔗 LINKS IMPORTANTES

- **Site:** https://phdonassolo.com
- **WordPress:** https://phdonassolo.com/wordpress/wp-admin
- **API Test:** https://phdonassolo.com/wordpress/wp-json/wp/v2/posts
- **cPanel:** https://cpanel.hostgator.com
- **GitHub:** https://github.com/phdonas/site

---

## 📊 CHECKLIST RÁPIDO

Antes de considerar deploy OK:

- [ ] Site carrega
- [ ] Todas páginas funcionam
- [ ] Artigos aparecem
- [ ] WhatsApp funciona
- [ ] Mobile responsivo
- [ ] SSL ativo (https)
- [ ] Google Analytics tracking

---

## 🔐 SEGURANÇA

**Após cada deploy:**
- [ ] Trocar senha do cPanel
- [ ] Verificar permissões de arquivos
- [ ] Testar em aba anônima

---

## 💡 DICAS RÁPIDAS

1. **Sempre faça backup antes de deploy**
2. **Teste localmente primeiro** (`npm run dev`)
3. **Use aba anônima para testar** (sem cache)
4. **Categorias WordPress são ESSENCIAIS**
5. **Mantenha WordPress atualizado**

---

## 📞 CONTATO RÁPIDO

**Suporte HostGator:** suporte@hostgator.com.br  
**Em caso de problemas:** Consultar `DEPLOY.md`

---

**Versão:** 2.0  
**Última atualização:** 31/01/2026
