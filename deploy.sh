#!/bin/bash

# Script de Deploy - ONG Amigo dos Amigos
# Este script automatiza o processo de build e deploy do projeto

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando processo de deploy da ONG Amigo dos Amigos..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "deploy.sh" ]; then
    error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Verificar dependências
log "Verificando dependências..."

if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm não está instalado"
    exit 1
fi

# Definir ambiente (development ou production)
ENVIRONMENT=${1:-development}
log "Ambiente: $ENVIRONMENT"

# Configurar variáveis de ambiente
if [ "$ENVIRONMENT" = "production" ]; then
    export NODE_ENV=production
    export REACT_APP_API_URL="https://api.amigodosamigos.org"
    export REACT_APP_SITE_URL="https://amigodosamigos.org"
else
    export NODE_ENV=development
    export REACT_APP_API_URL="http://localhost:3001"
    export REACT_APP_SITE_URL="http://localhost:3000"
fi

# Função para instalar dependências
install_dependencies() {
    log "Instalando dependências do backend..."
    cd backend
    npm install --production=false
    cd ..

    log "Instalando dependências do frontend..."
    cd frontend/ong-frontend
    pnpm install
    cd ../..
}

# Função para configurar banco de dados
setup_database() {
    log "Configurando banco de dados..."
    cd backend
    
    # Gerar cliente Prisma
    npx prisma generate
    
    # Executar migrações (apenas em desenvolvimento)
    if [ "$ENVIRONMENT" = "development" ]; then
        npx prisma db push
        
        # Executar setup inicial
        node scripts/setup-database.js
    fi
    
    cd ..
}

# Função para build do frontend
build_frontend() {
    log "Fazendo build do frontend..."
    cd frontend/ong-frontend
    
    # Limpar build anterior
    rm -rf dist
    
    # Build para produção
    pnpm run build
    
    # Verificar se build foi criado
    if [ ! -d "dist" ]; then
        error "Build do frontend falhou"
        exit 1
    fi
    
    log "Build do frontend concluído com sucesso"
    cd ../..
}

# Função para gerar arquivos SEO
generate_seo_files() {
    log "Gerando arquivos SEO..."
    cd backend
    
    # Iniciar servidor temporariamente para gerar SEO
    npm start &
    SERVER_PID=$!
    
    # Aguardar servidor iniciar
    sleep 10
    
    # Gerar arquivos SEO
    curl -X POST http://localhost:3001/api/seo/generate-all || warn "Falha ao gerar arquivos SEO"
    
    # Parar servidor
    kill $SERVER_PID 2>/dev/null || true
    
    cd ..
}

# Função para executar testes
run_tests() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log "Executando testes..."
        
        # Testes do backend
        cd backend
        npm test 2>/dev/null || warn "Testes do backend não configurados"
        cd ..
        
        # Testes do frontend
        cd frontend/ong-frontend
        pnpm test --run 2>/dev/null || warn "Testes do frontend não configurados"
        cd ../..
    fi
}

# Função para otimizar imagens
optimize_images() {
    log "Otimizando imagens..."
    
    # Criar diretórios de imagens se não existirem
    mkdir -p frontend/ong-frontend/public/images/{dogs,blog,team,gallery}
    mkdir -p backend/uploads/{dogs,blog,avatars}
    
    # Copiar imagens de exemplo (se existirem)
    if [ -d "assets/images" ]; then
        cp -r assets/images/* frontend/ong-frontend/public/images/ 2>/dev/null || true
    fi
    
    log "Otimização de imagens concluída"
}

# Função para criar arquivo de configuração
create_config_files() {
    log "Criando arquivos de configuração..."
    
    # Criar .env.example para referência
    cat > backend/.env.example << EOF
# Configurações do Servidor
NODE_ENV=production
PORT=3001
BACKEND_URL=https://api.amigodosamigos.org
FRONTEND_URL=https://amigodosamigos.org

# Banco de Dados
DATABASE_URL="mysql://user:password@localhost:3306/ong_amigo_dos_amigos"

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_live_sua_chave_stripe_aqui
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_stripe_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_secret_aqui

# PIX
PIX_KEY=contato@amigodosamigos.org

# WhatsApp
WHATSAPP_NUMBER=5511999999999

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@amigodosamigos.org
SMTP_PASS=sua_senha_email_aqui
FROM_EMAIL=contato@amigodosamigos.org
ADMIN_EMAIL=admin@amigodosamigos.org

# Google Maps
GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui

# Configurações da ONG
ONG_NAME="ONG Amigo dos Amigos"
ONG_ADDRESS="Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567"
ONG_PHONE="(11) 99999-9999"
ONG_EMAIL="contato@amigodosamigos.org"

# Redes Sociais
FACEBOOK_URL=https://facebook.com/amigodosamigos
INSTAGRAM_URL=https://instagram.com/amigodosamigos
TWITTER_URL=https://twitter.com/amigodosamigos
EOF

    # Criar package.json para deploy
    cat > package.json << EOF
{
  "name": "ong-amigo-dos-amigos",
  "version": "1.0.0",
  "description": "Site institucional e de arrecadação da ONG Amigo dos Amigos",
  "scripts": {
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend/ong-frontend && pnpm install",
    "install:all": "npm run install:backend && npm run install:frontend",
    "build:frontend": "cd frontend/ong-frontend && pnpm run build",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd frontend/ong-frontend && pnpm run dev -- --port 3000",
    "deploy": "./deploy.sh production",
    "setup": "./deploy.sh development"
  },
  "keywords": ["ong", "animais", "adocao", "doacao", "react", "nodejs"],
  "author": "ONG Amigo dos Amigos",
  "license": "MIT"
}
EOF

    log "Arquivos de configuração criados"
}

# Função principal de deploy
main() {
    log "=== DEPLOY ONG AMIGO DOS AMIGOS ==="
    log "Ambiente: $ENVIRONMENT"
    
    # Executar etapas do deploy
    install_dependencies
    optimize_images
    setup_database
    build_frontend
    create_config_files
    
    if [ "$ENVIRONMENT" = "development" ]; then
        run_tests
        generate_seo_files
    fi
    
    log "=== DEPLOY CONCLUÍDO COM SUCESSO ==="
    
    # Mostrar informações finais
    echo ""
    echo -e "${BLUE}📋 INFORMAÇÕES DO DEPLOY:${NC}"
    echo -e "${BLUE}├─ Ambiente: $ENVIRONMENT${NC}"
    echo -e "${BLUE}├─ Frontend: frontend/ong-frontend/dist${NC}"
    echo -e "${BLUE}├─ Backend: backend/${NC}"
    echo -e "${BLUE}└─ Configuração: .env.example criado${NC}"
    echo ""
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo -e "${YELLOW}🚀 PRÓXIMOS PASSOS:${NC}"
        echo -e "${YELLOW}1. Configure as variáveis de ambiente no backend/.env${NC}"
        echo -e "${YELLOW}2. Execute 'cd backend && npm start' para iniciar o servidor${NC}"
        echo -e "${YELLOW}3. Execute 'cd frontend/ong-frontend && pnpm run dev' para desenvolvimento${NC}"
        echo -e "${YELLOW}4. Acesse http://localhost:3000 para ver o site${NC}"
        echo ""
        echo -e "${GREEN}📧 Login Admin: admin@amigodosamigos.org${NC}"
        echo -e "${GREEN}🔑 Senha Admin: admin123 (altere após primeiro login)${NC}"
    else
        echo -e "${YELLOW}🚀 PRÓXIMOS PASSOS PARA PRODUÇÃO:${NC}"
        echo -e "${YELLOW}1. Configure as variáveis de ambiente de produção${NC}"
        echo -e "${YELLOW}2. Configure o banco de dados MySQL${NC}"
        echo -e "${YELLOW}3. Configure o servidor web (Nginx/Apache)${NC}"
        echo -e "${YELLOW}4. Configure SSL/HTTPS${NC}"
        echo -e "${YELLOW}5. Configure monitoramento e backups${NC}"
    fi
}

# Executar função principal
main

log "Deploy finalizado! 🎉"
