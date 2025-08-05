# 🐳 ProntuPsi Frontend - Deploy com Docker

Este documento explica como fazer o deploy do frontend ProntuPsi usando Docker, especialmente em serviços como Coolify.

## 📋 Pré-requisitos

- Docker instalado
- Node.js 18+ (para desenvolvimento local)
- Acesso ao registry de containers (opcional)

## 🚀 Quick Start

### 1. Build da Imagem

```bash
# Build simples
docker build -t prontupsi-frontend .

# Build com tag específica
docker build -t prontupsi-frontend:v1.0.0 .

# Usando o script automatizado (Linux/Mac)
./build-docker.sh
```

### 2. Executar Localmente

```bash
# Executar na porta 3000
docker run -p 3000:80 prontupsi-frontend

# Executar em background
docker run -d -p 3000:80 --name prontupsi-frontend prontupsi-frontend

# Com docker-compose
docker-compose up -d
```

### 3. Acessar a Aplicação

```
http://localhost:3000
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
curl http://localhost:3000/health

# Nginx status
curl http://localhost:3000/nginx_status
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

- **Aplicação**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **Logs**: `docker logs prontupsi-frontend`

## 📞 Suporte

Para problemas com o deploy:
1. Verifique os logs: `docker logs prontupsi-frontend`
2. Teste localmente primeiro
3. Verifique as variáveis de ambiente
4. Confirme que a API está acessível

---

**Pronto para produção! 🚀**