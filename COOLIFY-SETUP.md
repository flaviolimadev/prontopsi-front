# 🚀 Setup ProntuPsi Frontend no Coolify

Guia completo para deploy do frontend ProntuPsi no Coolify.

## 📋 Pré-requisitos

- ✅ Coolify instalado e configurado
- ✅ Repositório Git com o código
- ✅ Domínio configurado (opcional)

## 🔧 Configuração no Coolify

### 1. Criar Novo Projeto

1. **Acesse o Coolify Dashboard**
2. **Clique em "New Project"**
3. **Conecte o Repositório Git**
   - GitHub/GitLab/Bitbucket
   - Selecione o repositório do ProntuPsi
   - Branch: `main` ou `production`

### 2. Configurar o Serviço

#### Configurações Básicas:
```
Nome: prontupsi-frontend
Tipo: Application
Framework: Static (Nginx)
```

#### Build Settings:
```
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
Node Version: 18
```

#### Docker Settings (Alternativa):
```
Use o Dockerfile fornecido
Context: ./frontEnd
Dockerfile: ./frontEnd/Dockerfile
```

### 3. Variáveis de Ambiente

Adicione as seguintes variáveis no Coolify:

```env
# OBRIGATÓRIO: URL da API
VITE_API_URL=https://api.seudominio.com/api

# Configurações da aplicação
VITE_APP_NAME=ProntuPsi
VITE_NODE_ENV=production

# Se usando backend também no Coolify
VITE_API_URL=https://prontupsi-backend.seudominio.com/api
```

### 4. Configurar Domínio

1. **Na aba "Domains"**
2. **Adicionar domínio**: `prontupsi.seudominio.com`
3. **Habilitar SSL**: Automático
4. **Configurar DNS**: Aponte para o IP do Coolify

### 5. Deploy

1. **Clique em "Deploy"**
2. **Acompanhe os logs** em tempo real
3. **Aguarde o build** finalizar (~2-5 minutos)

## 🔍 Logs e Monitoramento

### Verificar Logs de Build
```bash
# No Coolify, acesse a aba "Logs"
# Ou via CLI:
coolify logs prontupsi-frontend
```

### Health Check
```bash
# Teste se a aplicação está rodando
curl https://prontupsi.seudominio.com/health
```

## 🛠️ Troubleshooting

### ❌ Build Falha

**Problema**: Build timeout ou erro de memória
```
Solução:
1. Aumentar recursos no Coolify
2. Verificar se todas as dependências estão no package.json
3. Usar .dockerignore para otimizar
```

**Problema**: `VITE_API_URL` não funciona
```
Solução:
1. Verificar se a variável está no ambiente de build
2. Certificar que começa com VITE_
3. Rebuild da aplicação
```

### ❌ Deploy Falha

**Problema**: 404 em rotas do React Router
```
Solução:
1. Verificar se nginx.conf está correto
2. Confirmar fallback para index.html
3. Usar Dockerfile fornecido
```

**Problema**: CORS errors
```
Solução:
1. Configurar backend para aceitar origem do frontend
2. Verificar VITE_API_URL
3. Configurar proxy no nginx se necessário
```

### ❌ Performance Issues

**Problema**: Carregamento lento
```
Solução:
1. Verificar compressão Gzip (já configurado)
2. Usar CDN se necessário
3. Otimizar assets grandes
```

## 🔧 Configurações Avançadas

### Custom Nginx Config

Se precisar customizar o nginx, edite o arquivo `nginx.conf`:

```nginx
# Adicionar headers customizados
add_header X-Custom-Header "ProntuPsi";

# Configurar proxy para múltiplos backends
location /api/v2/ {
    proxy_pass http://backend-v2:3000/api/;
}
```

### Multi-Environment Setup

Para diferentes ambientes:

1. **Staging**:
   ```env
   VITE_API_URL=https://api-staging.seudominio.com/api
   VITE_NODE_ENV=staging
   ```

2. **Production**:
   ```env
   VITE_API_URL=https://api.seudominio.com/api
   VITE_NODE_ENV=production
   ```

### Auto-Deploy via Webhook

1. **Configure webhook** no repositório Git
2. **URL**: `https://coolify.seudominio.com/webhooks/projeto-id`
3. **Trigger**: Push to main branch

## 📊 Monitoramento

### Métricas Disponíveis

- **CPU Usage**: Via dashboard do Coolify
- **Memory Usage**: Limitado a 512MB por padrão
- **Request Logs**: Nginx access logs
- **Error Logs**: Nginx error logs

### Alertas

Configure alertas no Coolify para:
- ❗ Alto uso de CPU/Memória
- ❗ Falhas de health check
- ❗ Erros de deploy

## 🚀 Deploy Automatizado

### GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Coolify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Coolify Deploy
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK_URL }}"
```

## 📞 Suporte

### Links Úteis
- [Documentação Coolify](https://coolify.io/docs)
- [Troubleshooting Guide](https://coolify.io/docs/troubleshooting)
- [Community Discord](https://discord.gg/coolify)

### Comandos Úteis

```bash
# Rebuild forçado
coolify rebuild prontupsi-frontend

# Restart serviço
coolify restart prontupsi-frontend

# Ver logs em tempo real
coolify logs -f prontupsi-frontend

# Status dos serviços
coolify status
```

---

**✨ Seu ProntuPsi estará online em poucos minutos! 🎉**