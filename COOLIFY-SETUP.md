# 🌐 Coolify Setup - ProntuPsi Frontend

## 📋 Configuração Completa no Coolify

### **1. Variáveis de Ambiente Obrigatórias**

Configure estas variáveis no painel do Coolify:

```env
# URL da API Backend (OBRIGATÓRIO)
VITE_API_URL=https://api.seudominio.com/api

# Configurações da Aplicação
VITE_APP_NAME=ProntuPsi
VITE_NODE_ENV=production

# Configurações de Build
NODE_ENV=production
```

### **2. Configuração do Projeto**

#### **Build Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Dockerfile**: Use o Dockerfile fornecido
- **Port**: `87`

#### **Health Check:**
- **URL**: `http://localhost:87/health`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3

### **3. Domínio e SSL**

#### **Domínio Principal:**
- **Domain**: `prontupsi.seudominio.com`
- **SSL**: Automático (Let's Encrypt)

#### **Subdomínio da API (se necessário):**
- **Domain**: `api.seudominio.com`
- **SSL**: Automático

### **4. Configuração do Backend**

**IMPORTANTE**: O backend deve estar configurado antes do frontend!

#### **Backend Settings:**
- **Port**: `3000`
- **Health Check**: `http://localhost:3000/api/health`
- **Domain**: `api.seudominio.com`

### **5. Ordem de Deploy**

1. **Primeiro**: Deploy do Backend
2. **Segundo**: Deploy do Frontend
3. **Terceiro**: Configurar variáveis de ambiente

### **6. Troubleshooting**

#### **Erro 502 (Bad Gateway):**
- ✅ Verificar se `VITE_API_URL` está configurada
- ✅ Verificar se o backend está rodando
- ✅ Verificar se o domínio da API está acessível

#### **Verificar Configuração:**
```bash
# No console do navegador
console.log(import.meta.env.VITE_API_URL)

# Deve retornar: https://api.seudominio.com/api
```

### **7. URLs Finais**

- **Frontend**: `https://prontupsi.seudominio.com`
- **Backend API**: `https://api.seudominio.com/api`
- **Health Check Frontend**: `https://prontupsi.seudominio.com/health`
- **Health Check Backend**: `https://api.seudominio.com/api/health`

---

**🎯 Resultado**: Frontend conectado ao backend via HTTPS!