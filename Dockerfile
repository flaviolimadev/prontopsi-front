# Dockerfile para ProntuPsi Frontend
# Multi-stage build para otimização

# Stage 1: Build
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache otimizado)
COPY package*.json ./
COPY bun.lockb* ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --silent

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Remover configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build da aplicação do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 87
EXPOSE 87

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:87/health || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]