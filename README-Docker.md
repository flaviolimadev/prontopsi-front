# 🐳 ProntuPsi Frontend - Deploy com Docker

Este documento explica como fazer o deploy do frontend ProntuPsi usando Docker, especialmente em serviços como Coolify.

## 📋 Pré-requisitos

- Docker instalado
- Node.js 18+ (para desenvolvimento local)
- Acesso ao registry de containers (opcional)

## 🚀 Quick Start

### 1. Verificar Pré-requisitos

```bash
# Testar se tudo está pronto para build
./test-docker-build.sh
```

### 2. Build da Imagem

```bash
# Build simples
docker build -t prontupsi-frontend .

# Build com tag específica
docker build -t prontupsi-frontend:v1.0.0 .

# Usando o script automatizado (Linux/Mac)
./build-docker.sh

# Debug detalhado se houver problemas
docker build -t prontupsi-frontend . --no-cache --progress=plain
```

### 2. Executar Localmente

```bash
# Executar na porta 87
docker run -p 87:87 prontupsi-frontend

# Executar em background
docker run -d -p 87:87 --name prontupsi-frontend prontupsi-frontend

# Com docker-compose
docker-compose up -d
```

### 3. Acessar a Aplicação

```
http://localhost:87
```

## 🔧 Configuração para Produção

### Variáveis de Ambiente

Crie um arquivo `.env.production` baseado no `.env.example`:

```env
VITE_API_URL=https://api.seudominio.com/api
VITE_APP_NAME=ProntuPsi
VITE_NODE_ENV=production
```

### Nginx Customizado

O arquivo `nginx.conf` já está otimizado para:
- ✅ SPAs React com routing
- ✅ Compressão Gzip
- ✅ Cache de assets estáticos
- ✅ Headers de segurança
- ✅ Health checks
- ✅ Proxy para API (se necessário)

## 🌐 Deploy em Coolify

### 1. Configuração no Coolify

1. **Criar Novo Projeto**
   - Conecte seu repositório Git
   - Selecione a branch de produção

2. **Configurar Build**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Dockerfile: Use o Dockerfile fornecido

3. **Variáveis de Ambiente**
   ```
   VITE_API_URL=https://api.seudominio.com/api
   VITE_NODE_ENV=production
   ```

4. **Configurar Domínio**
   - Adicione seu domínio personalizado
   - Configure SSL automático

### 2. Deploy Automático

O Coolify detectará automaticamente o Dockerfile e fará o build/deploy.

## 🚀 Deploy em Outros Serviços

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

### Vercel (alternativa sem Docker)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### DigitalOcean App Platform

1. Conecte o repositório
2. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - HTTP Port: 80

## 🔍 Health Checks

A aplicação inclui endpoints para monitoramento:

```bash
# Health check
curl http://localhost:87/health

# Nginx status
curl http://localhost:87/nginx_status
```

## 📊 Otimizações Incluídas

### Multi-stage Build
- 🔄 Stage 1: Build da aplicação
- 🚀 Stage 2: Servidor Nginx otimizado

### Compressão e Cache
- 📦 Gzip para todos os assets
- ⚡ Cache longo para assets estáticos
- 🔄 Cache apropriado para HTML

### Segurança
- 🛡️ Headers de segurança
- 👤 Usuário não-root
- 🔒 Configurações seguras do Nginx

## 🐛 Troubleshooting

### Problema: 404 em rotas

**Solução**: O nginx.conf já inclui fallback para SPAs:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: API não conecta

**Solução**: Verifique a variável `VITE_API_URL` e configure o proxy se necessário.

### Problema: Assets não carregam

**Solução**: Verifique se o build foi feito corretamente:
```bash
npm run build
ls -la dist/
```

### ❌ Problema: "vite: not found" durante build

**Sintomas**: Build falha com erro `sh: vite: not found`

**Causa**: Dockerfile estava instalando apenas dependências de produção (`--only=production`), mas o Vite é uma devDependency necessária para o build.

**Solução**: ✅ **JÁ CORRIGIDO** no Dockerfile atual!

```dockerfile
# ANTES (erro):
RUN npm ci --only=production --silent

# DEPOIS (correto):
RUN npm ci --silent
```

**Verificação**:
```bash
# Testar build local
npm run build

# Verificar se Vite está disponível
npx vite --version

# Testar pré-requisitos completos
./test-docker-build.sh
```

### ❌ Problema: nginx.conf não encontrado

**Sintomas**: Build falha ao copiar nginx.conf

**Solução**: Verificar se o arquivo existe:
```bash
ls -la nginx.conf
```

Se não existir, será criado automaticamente pelo script.

### ❌ Problema: "user directive is not allowed here"

**Sintomas**: Container falha com erro `nginx: [emerg] "user" directive is not allowed here in /etc/nginx/conf.d/default.conf:2`

**Causa**: O arquivo nginx.conf estava configurado como configuração principal do nginx (com `user`, `worker_processes`, `events`, `http`), mas estava sendo copiado para `/etc/nginx/conf.d/default.conf`, que é para configurações de servidor individuais.

**Solução**: ✅ **JÁ CORRIGIDO** no nginx.conf atual!

```nginx
# ❌ ANTES (erro):
user nextjs;
worker_processes auto;
events { ... }
http {
    server { ... }
}

# ✅ DEPOIS (correto):
server {
    listen 80;
    # ... configuração do servidor
}
```

**Verificação**:
```bash
# Testar configuração
./test-nginx.sh

# Verificar se não tem diretivas proibidas
grep -E "^(user|worker_processes|events|http)" nginx.conf
```

### ❌ Problema: "host not found in upstream backend"

**Sintomas**: Container falha com erro `nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:53`

**Causa**: O nginx.conf estava tentando fazer proxy para um host chamado "backend" que não existe no ambiente do Coolify, onde frontend e backend são containers separados.

**Solução**: ✅ **JÁ CORRIGIDO** no nginx.conf atual!

```nginx
# ❌ ANTES (erro):
location /api/ {
    proxy_pass http://backend:3000/api/;
    # ... configurações de proxy
}

# ✅ DEPOIS (correto):
# API Proxy (comentado para deploy no Coolify)
# No Coolify, frontend e backend são containers separados
# location /api/ {
#     proxy_pass http://backend:3000/api/;
#     # ... configurações de proxy
# }
```

**Verificação**:
```bash
# Verificar se não tem proxy ativo
grep -n "proxy_pass" nginx.conf

# Testar configuração
./test-nginx.sh
```

### ❌ Problema: "502 Bad Gateway" no Frontend

**Sintomas**: Frontend carrega mas mostra erro 502 ao tentar acessar a API

**Causa**: A variável `VITE_API_URL` não está configurada ou o backend não está rodando.

**Solução**: Configure as variáveis de ambiente no Coolify!

```env
# OBRIGATÓRIO no Coolify:
VITE_API_URL=https://api.seudominio.com/api
VITE_APP_NAME=ProntuPsi
VITE_NODE_ENV=production
```

**Verificação**:
```bash
# Testar conexão com API
node test-api-connection.js

# Verificar variáveis no console do navegador
console.log(import.meta.env.VITE_API_URL)
```

**Passos para corrigir**:
1. **No Coolify**: Configure `VITE_API_URL` nas variáveis de ambiente
2. **Backend**: Certifique-se que está rodando e acessível
3. **Re-deploy**: Faça novo deploy do frontend
4. **Teste**: Acesse a aplicação e verifique se o erro 502 sumiu

## 📝 Scripts Disponíveis

```bash
# Build para produção
npm run build

# Preview do build
npm run preview

# Build Docker
./build-docker.sh

# Executar testes
npm run test
```

## 🔗 URLs Importantes

- **Aplicação**: `http://localhost:87`
- **Health Check**: `http://localhost:87/health`
- **Logs**: `docker logs prontupsi-frontend`

## 📞 Suporte

Para problemas com o deploy:
1. Verifique os logs: `docker logs prontupsi-frontend`
2. Teste localmente primeiro
3. Verifique as variáveis de ambiente
4. Confirme que a API está acessível

---

**Pronto para produção! 🚀**