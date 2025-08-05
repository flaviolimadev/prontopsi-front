#!/bin/bash

echo "🧪 Testando configuração do nginx..."

# Verificar se o arquivo existe
if [ ! -f "nginx.conf" ]; then
    echo "❌ nginx.conf não encontrado"
    exit 1
fi

echo "✅ nginx.conf encontrado"

# Verificar se não tem diretivas proibidas
if grep -q "^user " nginx.conf; then
    echo "❌ Diretiva 'user' encontrada - não permitida em conf.d/"
    exit 1
fi

if grep -q "^worker_processes" nginx.conf; then
    echo "❌ Diretiva 'worker_processes' encontrada - não permitida em conf.d/"
    exit 1
fi

if grep -q "^events {" nginx.conf; then
    echo "❌ Bloco 'events' encontrado - não permitido em conf.d/"
    exit 1
fi

if grep -q "^http {" nginx.conf; then
    echo "❌ Bloco 'http' encontrado - não permitido em conf.d/"
    exit 1
fi

echo "✅ Configuração parece correta"

# Verificar se tem server block
if grep -q "^server {" nginx.conf; then
    echo "✅ Bloco 'server' encontrado"
else
    echo "❌ Bloco 'server' não encontrado"
    exit 1
fi

# Verificar se tem health check
if grep -q "location /health" nginx.conf; then
    echo "✅ Health check configurado"
else
    echo "⚠️  Health check não encontrado"
fi

       # Verificar se tem SPA fallback
       if grep -q "try_files.*index.html" nginx.conf; then
           echo "✅ SPA fallback configurado"
       else
           echo "❌ SPA fallback não encontrado"
           exit 1
       fi

       # Verificar se não tem proxy ativo (para Coolify)
       if grep -v "^[[:space:]]*#" nginx.conf | grep -q "proxy_pass"; then
           echo "❌ Proxy ativo encontrado - pode causar erro no Coolify"
           echo "   Comente a seção de proxy para deploy no Coolify"
           exit 1
       else
           echo "✅ Nenhum proxy ativo encontrado"
       fi

echo ""
echo "🎉 Configuração do nginx parece estar correta!"
echo "💡 Agora o deploy no Coolify deve funcionar." 