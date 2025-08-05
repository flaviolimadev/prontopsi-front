#!/bin/bash

# Script de teste atualizado para verificar se o build Docker funcionará
echo "🧪 Testando pré-requisitos para build Docker do Frontend..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório do frontend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretório correto encontrado${NC}"

# Verificar se é um projeto Vite/React
if ! grep -q "vite" package.json; then
    echo -e "${RED}❌ Este não parece ser um projeto Vite${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Projeto Vite detectado${NC}"

# Verificar se Docker está disponível
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está disponível${NC}"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está rodando${NC}"

# Verificar arquivos necessários
files=("Dockerfile" "package.json" "nginx.conf" "index.html" "vite.config.ts")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Arquivo necessário não encontrado: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ $file encontrado${NC}"
done

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado${NC}"
    echo -e "${YELLOW}   Instalando dependências...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha ao instalar dependências${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${GREEN}✅ node_modules encontrado${NC}"
fi

# Verificar se Vite está disponível
if ! npx vite --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Vite não está funcionando${NC}"
    echo -e "${YELLOW}   Tente: npm install vite@latest${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Vite está funcionando${NC}"

# Teste de build local
echo -e "${YELLOW}🔨 Testando build local...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build local bem-sucedido${NC}"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Diretório dist criado${NC}"
        file_count=$(find dist -type f | wc -l)
        echo -e "${GREEN}📁 $file_count arquivos gerados${NC}"
        
        # Verificar se index.html existe
        if [ -f "dist/index.html" ]; then
            echo -e "${GREEN}✅ index.html encontrado em dist/${NC}"
        else
            echo -e "${RED}❌ index.html não encontrado em dist/${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Build local falhou${NC}"
    echo -e "${YELLOW}   Tente executar: npm run build${NC}"
    echo -e "${YELLOW}   Para ver os erros detalhados${NC}"
    exit 1
fi

# Verificar configuração do nginx
if [ -f "nginx.conf" ]; then
    if grep -q "try_files" nginx.conf && grep -q "/health" nginx.conf; then
        echo -e "${GREEN}✅ nginx.conf configurado corretamente${NC}"
    else
        echo -e "${YELLOW}⚠️  nginx.conf pode precisar de ajustes${NC}"
    fi
fi

# Verificar porta disponível
if command -v netstat &> /dev/null; then
    if netstat -an | grep -q ":80"; then
        echo -e "${YELLOW}⚠️  Porta 80 está em uso${NC}"
        echo -e "${YELLOW}   Use docker run -p 8080:80 para mapear para porta 8080${NC}"
    else
        echo -e "${GREEN}✅ Porta 80 disponível${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Pré-requisitos verificados! O build Docker deve funcionar agora.${NC}"
echo ""
echo -e "${YELLOW}💡 Para fazer o build Docker, execute:${NC}"
echo "   docker build -t prontupsi-frontend ."
echo ""
echo -e "${YELLOW}💡 Para executar o container:${NC}"
echo "   docker run -p 8080:80 prontupsi-frontend"
echo ""
echo -e "${YELLOW}💡 Para testar localmente com compose:${NC}"
echo "   docker-compose up --build"
echo ""
echo -e "${YELLOW}💡 URL após deploy:${NC}"
echo "   http://localhost:8080"