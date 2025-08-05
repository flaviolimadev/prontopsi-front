#!/bin/bash

# Script de Build Docker para ProntuPsi Frontend
# Este script facilita o build e deploy da aplicação

echo "🚀 Iniciando build do ProntuPsi Frontend..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Inicie o Docker e tente novamente.${NC}"
    exit 1
fi

# Variáveis
IMAGE_NAME="prontupsi-frontend"
TAG=${1:-latest}
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

echo -e "${YELLOW}📦 Buildando imagem: $FULL_IMAGE_NAME${NC}"

# Build da imagem
docker build -t $FULL_IMAGE_NAME . --no-cache

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
    echo -e "${GREEN}📋 Imagem criada: $FULL_IMAGE_NAME${NC}"
    
    # Mostrar tamanho da imagem
    IMAGE_SIZE=$(docker images $FULL_IMAGE_NAME --format "table {{.Size}}" | tail -n 1)
    echo -e "${GREEN}📏 Tamanho da imagem: $IMAGE_SIZE${NC}"
    
    echo ""
    echo -e "${YELLOW}🔧 Comandos úteis:${NC}"
    echo "  • Executar localmente:"
    echo "    docker run -p 8080:80 $FULL_IMAGE_NAME"
    echo ""
    echo "  • Executar com docker-compose:"
    echo "    docker-compose up -d"
    echo ""
    echo "  • Fazer push para registry:"
    echo "    docker tag $FULL_IMAGE_NAME your-registry/$FULL_IMAGE_NAME"
    echo "    docker push your-registry/$FULL_IMAGE_NAME"
    echo ""
    echo -e "${GREEN}🎉 Pronto para deploy!${NC}"
else
    echo -e "${RED}❌ Erro no build da imagem.${NC}"
    echo ""
    echo -e "${YELLOW}💡 Possíveis soluções:${NC}"
    echo "  1. Execute: ./test-docker-build.sh (para verificar pré-requisitos)"
    echo "  2. Verifique se Vite está nas devDependencies"
    echo "  3. Tente build local: npm run build"
    echo "  4. Se erro 'vite: not found', o Dockerfile foi corrigido"
    echo ""
    echo -e "${YELLOW}🔍 Para debug detalhado:${NC}"
    echo "  docker build -t $FULL_IMAGE_NAME . --no-cache --progress=plain"
    exit 1
fi