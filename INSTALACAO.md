# 📋 Guia de Instalação - ONG Amigo dos Amigos

Este guia fornece instruções detalhadas para instalar e configurar o site da ONG Amigo dos Amigos.

## 🎯 Visão Geral

O projeto consiste em:
- **Frontend React** - Interface do usuário moderna e responsiva
- **Backend Node.js** - API REST com autenticação e integração de pagamentos
- **Banco MySQL** - Armazenamento de dados
- **Integrações** - Stripe, PIX, WhatsApp, Email

## 🔧 Pré-requisitos

### Software Necessário

1. **Node.js 18+**
   ```bash
   # Verificar versão
   node --version
   npm --version
   ```

2. **MySQL 8.0+**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # macOS
   brew install mysql
   
   # Windows
   # Baixar do site oficial: https://dev.mysql.com/downloads/
   ```

3. **pnpm** (para o frontend)
   ```bash
   npm install -g pnpm
   ```

4. **Git**
   ```bash
   git --version
   ```

### Contas e Chaves Necessárias

1. **Stripe** (pagamentos)
   - Criar conta em https://stripe.com
   - Obter chaves de API (test e live)

2. **Google Maps** (localização)
   - Criar projeto no Google Cloud Console
   - Ativar Maps JavaScript API
   - Obter chave de API

3. **Email SMTP** (notificações)
   - Gmail: Configurar senha de app
   - Ou outro provedor SMTP

## 📥 Instalação

### Método 1: Instalação Automática (Recomendado)

```bash
# 1. Clonar o repositório
git clone https://github.com/sua-org/ong-amigo-dos-amigos.git
cd ong-amigo-dos-amigos

# 2. Executar script de instalação
chmod +x deploy.sh
./deploy.sh development

# 3. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Editar backend/.env com suas configurações
```

### Método 2: Instalação Manual

#### Passo 1: Clonar e Configurar

```bash
git clone https://github.com/sua-org/ong-amigo-dos-amigos.git
cd ong-amigo-dos-amigos
```

#### Passo 2: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
```

**Editar arquivo `.env`:**
```env
# Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/ong_amigo_dos_amigos"

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789

# Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_stripe_aqui

# Email
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# WhatsApp
WHATSAPP_NUMBER=5511999999999

# Google Maps
GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
```

#### Passo 3: Configurar Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE ong_amigo_dos_amigos;
exit

# Gerar cliente Prisma
npx prisma generate

# Aplicar schema
npx prisma db push

# Executar setup inicial
node scripts/setup-database.js
```

#### Passo 4: Configurar Frontend

```bash
cd ../frontend/ong-frontend

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
echo "REACT_APP_API_URL=http://localhost:3001" > .env.local
echo "REACT_APP_SITE_URL=http://localhost:3000" >> .env.local
```

## 🚀 Executar em Desenvolvimento

### Iniciar Backend

```bash
cd backend
npm run dev
# Servidor rodando em http://localhost:3001
```

### Iniciar Frontend

```bash
cd frontend/ong-frontend
pnpm run dev
# Aplicação rodando em http://localhost:3000
```

## 🔐 Primeiro Acesso

### Login Administrativo

- **URL**: http://localhost:3000/admin/login
- **Email**: admin@amigodosamigos.org
- **Senha**: admin123

**⚠️ IMPORTANTE**: Altere a senha após o primeiro login!

### Funcionalidades Disponíveis

1. **Dashboard** - Visão geral das estatísticas
2. **Gerenciar Cães** - Adicionar/editar cães para adoção
3. **Blog** - Criar e publicar artigos
4. **Adoções** - Acompanhar solicitações
5. **Voluntários** - Gerenciar cadastros
6. **Doações** - Visualizar histórico
7. **Contatos** - Responder mensagens

## 🛠️ Configurações Avançadas

### Configurar Pagamentos

#### Stripe (Cartão de Crédito)

1. Criar conta no [Stripe](https://stripe.com)
2. Obter chaves de API no Dashboard
3. Configurar webhook endpoint: `https://seusite.com/api/payments/stripe/webhook`
4. Adicionar chaves no `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### PIX

1. Configurar chave PIX (email, telefone, CPF/CNPJ ou chave aleatória)
2. Adicionar no `.env`:
   ```env
   PIX_KEY=contato@amigodosamigos.org
   ```

### Configurar Email

#### Gmail

1. Ativar verificação em 2 etapas
2. Gerar senha de app específica
3. Configurar no `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu_email@gmail.com
   SMTP_PASS=sua_senha_de_app
   ```

#### Outros Provedores

```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# Provedor personalizado
SMTP_HOST=mail.seudominio.com
SMTP_PORT=587
```

### Configurar WhatsApp

1. Obter número comercial do WhatsApp Business
2. Configurar no `.env`:
   ```env
   WHATSAPP_NUMBER=5511999999999
   ```

### Configurar Google Maps

1. Acessar [Google Cloud Console](https://console.cloud.google.com)
2. Criar novo projeto ou selecionar existente
3. Ativar "Maps JavaScript API"
4. Criar credencial (chave de API)
5. Restringir chave por domínio (recomendado)
6. Adicionar no `.env`:
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSy...
   ```

## 📦 Deploy em Produção

### Preparar para Produção

```bash
# 1. Build do frontend
cd frontend/ong-frontend
pnpm run build

# 2. Configurar variáveis de produção
cd ../../backend
cp .env.example .env.production
# Editar .env.production com dados de produção

# 3. Executar deploy
./deploy.sh production
```

### Opções de Hospedagem

#### Frontend (Sites Estáticos)

1. **Netlify** (Recomendado)
   - Conectar repositório GitHub
   - Build command: `cd frontend/ong-frontend && pnpm run build`
   - Publish directory: `frontend/ong-frontend/dist`

2. **Vercel**
   - Importar projeto do GitHub
   - Framework preset: React
   - Root directory: `frontend/ong-frontend`

3. **GitHub Pages**
   - Ativar GitHub Pages no repositório
   - Usar GitHub Actions para build automático

#### Backend (Servidor)

1. **Railway** (Recomendado)
   - Conectar repositório GitHub
   - Detecta automaticamente Node.js
   - Adicionar banco MySQL

2. **Heroku**
   - Criar app Heroku
   - Adicionar addon MySQL (ClearDB ou JawsDB)
   - Deploy via Git

3. **VPS/Servidor Próprio**
   - Ubuntu/CentOS com Nginx
   - PM2 para gerenciar processo Node.js
   - SSL com Let's Encrypt

### Configurar Domínio

1. **Registrar domínio** (ex: amigodosamigos.org)
2. **Configurar DNS**:
   ```
   A     @           IP_DO_SERVIDOR
   CNAME www         amigodosamigos.org
   CNAME api         servidor-backend.com
   ```
3. **Configurar SSL** (Let's Encrypt gratuito)

## 🔍 Solução de Problemas

### Problemas Comuns

#### Erro de Conexão com Banco

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar conexão
mysql -u root -p -e "SELECT 1"

# Verificar URL no .env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_banco"
```

#### Erro de Dependências

```bash
# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Erro de Porta em Uso

```bash
# Verificar processo usando porta 3001
lsof -i :3001

# Matar processo
kill -9 PID_DO_PROCESSO

# Ou usar porta diferente no .env
PORT=3002
```

#### Erro de Permissões

```bash
# Dar permissão para uploads
chmod 755 backend/uploads
chown -R $USER:$USER backend/uploads

# Permissão para scripts
chmod +x deploy.sh
```

### Logs e Debug

#### Backend

```bash
# Ver logs em tempo real
cd backend
npm run dev

# Logs de produção
pm2 logs ong-backend
```

#### Frontend

```bash
# Modo desenvolvimento com debug
cd frontend/ong-frontend
pnpm run dev

# Build com análise
pnpm run build --analyze
```

### Performance

#### Otimizar Imagens

```bash
# Instalar ferramenta de otimização
npm install -g imagemin-cli

# Otimizar imagens
imagemin backend/uploads/*.jpg --out-dir=backend/uploads/optimized
```

#### Monitorar Performance

- **Frontend**: Lighthouse no Chrome DevTools
- **Backend**: `npm install clinic` para profiling
- **Banco**: `SHOW PROCESSLIST` no MySQL

## 📞 Suporte

### Documentação

- **README.md** - Visão geral do projeto
- **API.md** - Documentação da API
- **CONTRIBUTING.md** - Guia para contribuidores

### Contato

- **Issues**: [GitHub Issues](https://github.com/sua-org/ong-amigo-dos-amigos/issues)
- **Email**: dev@amigodosamigos.org
- **Discord**: [Servidor da Comunidade](https://discord.gg/ong-amigos)

### Recursos Úteis

- [Documentação do React](https://react.dev)
- [Documentação do Express](https://expressjs.com)
- [Documentação do Prisma](https://prisma.io/docs)
- [Documentação do Stripe](https://stripe.com/docs)
- [Guia do PIX](https://www.bcb.gov.br/estabilidadefinanceira/pix)

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] MySQL 8.0+ instalado e rodando
- [ ] Repositório clonado
- [ ] Dependências instaladas (backend e frontend)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado e migrado
- [ ] Usuário admin criado
- [ ] Frontend buildado com sucesso
- [ ] Backend iniciando sem erros
- [ ] Login admin funcionando
- [ ] Integração de pagamentos testada
- [ ] Email de notificação testado
- [ ] WhatsApp link funcionando
- [ ] Google Maps carregando
- [ ] Deploy em produção realizado

---

*Desenvolvido com ❤️ para salvar vidas*
