#!/bin/bash

# Script de teste para verificar se o build Docker funcionará
echo "🧪 Testando pré-requisitos para build Docker..."

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
files=("Dockerfile" "nginx.conf" "package.json")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Arquivo necessário não encontrado: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ $file encontrado${NC}"
done

# Verificar se node_modules existe (para build local)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Execute 'npm install' primeiro.${NC}"
fi

# Teste de build local (opcional)
echo -e "${YELLOW}🔨 Testando build local...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build local bem-sucedido${NC}"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Diretório dist criado${NC}"
        file_count=$(find dist -type f | wc -l)
        echo -e "${GREEN}📁 $file_count arquivos gerados${NC}"
    fi
else
    echo -e "${RED}❌ Build local falhou${NC}"
    echo -e "${YELLOW}   Tente executar: npm install && npm run build${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Pré-requisitos verificados!${NC}"
echo -e "${YELLOW}💡 Para fazer o build Docker, execute:${NC}"
echo "   docker build -t prontupsi-frontend ."
echo ""
echo -e "${YELLOW}💡 Para executar o container:${NC}"
echo "   docker run -p 3000:80 prontupsi-frontend"