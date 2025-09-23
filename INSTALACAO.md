# 📋 Guia de Instalação Completo - ONG Amigo dos Amigos

Este guia fornece instruções detalhadas para instalar e configurar a plataforma digital completa da ONG Amigo dos Amigos.

## 🎯 Visão Geral da Plataforma

A plataforma consiste em uma solução digital moderna e completa:
- **🎨 Frontend React 19** - Interface moderna e responsiva com componentes interativos
- **⚙️ Backend Node.js** - API REST robusta com autenticação, sistema completo de doações e webhooks
- **📋 Banco MySQL** - Armazenamento otimizado com gestão completa de dados
- **🔗 Integrações Premium** - Stripe Checkout, PIX instantâneo, WhatsApp Business, Email transacional
- **📈 Analytics & SEO** - Monitoramento completo e otimização para buscadores

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

1. **Stripe** (sistema completo de doações)
   - Criar conta em https://stripe.com
   - Obter chaves de API (secret key, publishable key, webhook secret)
   - Configurar webhook para confirmação automática
   - **IMPORTANTE**: Sistema funciona sem Stripe (fallback para PIX)

2. **Google Maps** (localização)
   - Criar projeto no Google Cloud Console
   - Ativar Maps JavaScript API
   - Obter chave de API

3. **Email SMTP** (notificações)
   - Gmail: Configurar senha de app
   - Ou outro provedor SMTP

## 📥 Instalação

### Método 1: Instalação Automática (Recomendado)

```
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

```
git clone https://github.com/sua-org/ong-amigo-dos-amigos.git
cd ong-amigo-dos-amigos
```

#### Passo 2: Configurar Backend

```
cd backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
```

**Editar arquivo `.env`:**
```
# Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/ong_amigo_dos_amigos"

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789

# Stripe (Sistema Completo de Doações)
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_stripe_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_secret_aqui

# PIX (Doações Instantâneas - OBRIGATÓRIO)
PIX_KEY=sua_chave_pix_real_aqui

# Email
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# WhatsApp
WHATSAPP_NUMBER=5511999999999

# Google Maps
GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
```

#### Passo 3: Configurar Banco de Dados

```
# Criar banco de dados
mysql -u root -p
CREATE DATABASE ong_amigo_dos_amigos;
exit

# Gerar cliente Prisma
npx prisma generate

# Aplicar schema (incluindo nova tabela de configurações)
npx prisma db push

# Executar setup inicial
node scripts/setup-database.js
```

#### Passo 4: Configurar Frontend

```
cd ../frontend/ong-frontend

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
echo "REACT_APP_API_URL=http://localhost:3001" > .env.local
echo "REACT_APP_SITE_URL=http://localhost:3000" >> .env.local
```

## 🚀 Executar em Desenvolvimento

### Iniciar Backend

```
cd backend
npm run dev
# Servidor rodando em http://localhost:3001
```

### Iniciar Frontend

```
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

### 📊 Funcionalidades Disponíveis

#### 🏠 Área Pública
1. **🏡 Home** - Landing page com estatísticas em tempo real e call-to-actions impactantes
2. **ℹ️ Sobre** - História, missão e apresentação da equipe
3. **🐾 Adoção** - Catálogo avançado com filtros inteligentes e favoritos
4. **💰 Doações** - Sistema completo PIX + Stripe com interface modal
5. **🤝 Voluntariado** - Formulário detalhado para cadastro
6. **✂️ Castração Social** - Sistema completo com validação de renda
7. **📊 Prestação de Contas** - Transparência total com download público
8. **📝 Blog** - Artigos categorizados e otimizados para SEO
9. **📞 Contato** - Formulário integrado com informações dinâmicas

#### 🔐 Painel Administrativo
1. **📊 Dashboard** - KPIs, estatísticas em tempo real e ações rápidas
2. **🐾 Gerenciar Pets** - CRUD completo com upload múltiplo de imagens
3. **🏠 Adoções** - Workflow completo de aprovação com histórico
4. **📝 Blog** - Editor rich text com preview e agendamento
5. **🤝 Voluntários** - Gestão completa com aprovação e comunicação
6. **💰 Doações** - Dashboard avançado com filtros, gráficos e exportação
7. **✂️ Castração Social** - Gestão de solicitações com validação de documentos
8. **📊 Prestação de Contas** - Upload, organização e publicação de relatórios
9. **📞 Contatos** - Central de mensagens com status de leitura
10. **⚙️ Configurações** - Painel centralizado para personalização completa
11. **👥 Usuários** - Gerenciamento de administradores

## 🛠️ Configurações Avançadas

### Configurar Sistema de Doações

#### PIX (Obrigatório - Funciona Imediatamente)

1. **Obter chave PIX**:
   - Email, telefone, CPF/CNPJ ou chave aleatória
   - Configurar na conta bancária da ONG

2. **Configurar no projeto**:
   ```env
   PIX_KEY=CHAVE_CNPJ
   # ou
   PIX_KEY=CHAVE_EMAIL
   ```

3. **Funcionalidades PIX**:
   - ✅ Geração automática de QR Code
   - ✅ Código Copia e Cola
   - ✅ Modal interativo
   - ✅ Confirmação manual

#### Stripe (Opcional - Cartão de Crédito)

1. **Criar conta no [Stripe](https://stripe.com)**
2. **Obter chaves de API no Dashboard**:
   - Secret Key: `sk_test_...` (teste) ou `sk_live_...` (produção)
   - Publishable Key: `pk_test_...` (teste) ou `pk_live_...` (produção)

3. **Configurar webhook** (opcional para confirmação automática):
   - Endpoint: `https://seusite.com/api/donations/webhook`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`

4. **Adicionar chaves no `.env`**:
   ```env
   STRIPE_SECRET_KEY=sk_test_sua_chave_real
   STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_real
   STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_real
   ```

5. **Funcionalidades Stripe**:
   - ✅ Checkout Session completo
   - ✅ Doações recorrentes (assinaturas)
   - ✅ Webhook para confirmação automática
   - ✅ Fallback automático para PIX se falhar

**⚠️ IMPORTANTE**: Se as chaves Stripe não estiverem configuradas, o sistema automaticamente sugere PIX como alternativa.

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

```
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

```
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar conexão
mysql -u root -p -e "SELECT 1"

# Verificar URL no .env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_banco"
```

#### Erro de Dependências

```
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

```
# Verificar processo usando porta 3001
lsof -i :3001

# Matar processo
kill -9 PID_DO_PROCESSO

# Ou usar porta diferente no .env
PORT=3002
```

#### Erro de Permissões

```
# Dar permissão para uploads
chmod 755 backend/uploads
chown -R $USER:$USER backend/uploads

# Permissão para scripts
chmod +x deploy.sh
```

### Logs e Debug

#### Backend

```
# Ver logs em tempo real
cd backend
npm run dev

# Logs de produção
pm2 logs ong-backend
```

#### Frontend

```
# Modo desenvolvimento com debug
cd frontend/ong-frontend
pnpm run dev

# Build com análise
pnpm run build --analyze
```

### Performance

#### Otimizar Imagens

```
# Instalar ferramenta de otimização
npm install -g imagemin-cli

# Otimizar imagens
imagemin backend/uploads/*.jpg --out-dir=backend/uploads/optimized
```

#### Monitorar Performance

- **Frontend**: Lighthouse no Chrome DevTools
- **Backend**: `npm install clinic` para profiling
- **Banco**: `SHOW PROCESSLIST` no MySQL

## 🆕 Novidades da Versão Atual 2.0

### 💰 Sistema de Doações Revolucionário

**Principais Inovações:**
- ✨ **Interface Modal Intuitiva** - UX fluida com modais responsivos e feedback visual imediato
- 🚀 **PIX Instantâneo Real** - Geração automática de QR Code EMV válido e Copia e Cola
- 💳 **Stripe Checkout Premium** - Integração completa com cartão e doações recorrentes
- 🔄 **Fallback Inteligente** - Sugestão automática de PIX quando cartão falha
- 📋 **Painel Admin Avançado** - Dashboard com filtros, estatísticas e gestão completa
- 🔍 **Webhooks Automáticos** - Confirmação instantânea de pagamentos Stripe

**Benefícios Diretos:**
- ✅ Processo de doação 70% mais rápido
- ✅ Múltiplas opções de pagamento sem complicação
- ✅ Interface mais amigável para todos os públicos
- ✅ Confirmações automáticas que geram confiança

### ⚙️ Sistema de Configurações Centralizadas

**Recursos Premium:**
- ✨ **Painel Unificado** - Gerencie todas as informações da ONG em um único local
- 🏴‍☠️ **Logo Personalizado** - Upload fácil do logo da sua organização
- 🏢 **Informações de Contato** - Endereço, telefone, WhatsApp e email sempre atualizados
- 🌍 **Nome Personalizável** - Customize o nome exibido em todo o site
- 🔄 **Atualização Dinâmica** - Mudanças refletidas instantaneamente em todo o site

**Como Utilizar:**
1. Acesse a área administrativa
2. Clique em "Configurações" no menu lateral
3. Preencha as informações desejadas
4. Clique em "Salvar Configurações"
5. Veja as mudanças aplicadas instantaneamente

### ✂️ Castração Social Inteligente

**Sistema Completo:**
- 📋 **Formulário Detalhado** - Coleta completa de dados do animal e tutor
- 📈 **Validação de Renda** - Sistema automático de verificação de elegibilidade
- 📷 **Upload de Documentos** - Anexo de fotos do animal e comprovantes
- 📄 **Workflow de Aprovação** - Processo estruturado com status e histórico completo
- 🔔 **Notificações Automáticas** - Alertas para equipe e confirmações para solicitantes

**Benefícios Sociais:**
- ✅ Democratização do acesso à castração
- ✅ Controle de natalidade animal eficiente
- ✅ Redução do abandono por prevenção
- ✅ Atendimento focado em famílias de baixa renda

### 📊 Prestação de Contas Transparente

**Transparência Total:**
- 📁 **Gestão de Relatórios** - Upload simples e organização automatizada
- 📅 **Organização Temporal** - Estruturação por períodos (mensal, trimestral, anual)
- ⬇️ **Download Público** - Acesso livre para transparência total
- 🗃️ **Metadados Completos** - Informações sobre tamanho, data e responsável
- 🎯 **SEO Otimizado** - Páginas indexadas para descoberta fácil

### 🔧 Melhorias Técnicas Avançadas

- **🔄 React 19** - Framework de última geração com performance superior
- **🗺️ Prisma 5.19** - ORM otimizado com type safety e performance
- **⚙️ Validação Joi** - Schemas robustos para cada tipo de operação
- **📈 Logging Winston** - Sistema de logs estruturado para debug avançado
- **📱 Responsividade Premium** - Modais e interfaces otimizadas para mobile
- **🔍 SEO de Elite** - Core Web Vitals e otimizações avançadas

## 📝 Documentação Adicional

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

## ✅ Checklist de Instalação Completo

### 🔧 Configuração Básica
- [ ] **Node.js 18+** instalado e funcionando
- [ ] **MySQL 8.0+** instalado, configurado e rodando
- [ ] **pnpm** instalado globalmente
- [ ] **Git** configurado com credenciais
- [ ] Repositório clonado com sucesso

### 💻 Configuração do Backend
- [ ] Dependências do backend instaladas (`npm install`)
- [ ] Arquivo `.env` criado e configurado
- [ ] **Banco de dados** criado (`ong_amigo_dos_amigos`)
- [ ] **Prisma** gerado (`npx prisma generate`)
- [ ] **Schema** aplicado (`npx prisma db push`)
- [ ] **Setup inicial** executado (`node scripts/setup-database.js`)
- [ ] **Tabela de configurações** criada corretamente
- [ ] Servidor backend iniciando sem erros

### 🎨 Configuração do Frontend
- [ ] Dependências do frontend instaladas (`pnpm install`)
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Build do frontend executado com sucesso
- [ ] Servidor de desenvolvimento rodando

### 🔐 Acesso Administrativo
- [ ] **Login admin** funcionando (admin@amigodosamigos.org)
- [ ] **Dashboard** carregando com estatísticas
- [ ] **Menu lateral** com todas as opções visíveis
- [ ] **Configurações do site** acessíveis e editáveis
- [ ] **Senha padrão alterada** para maior segurança

### 💰 Sistema de Doações
- [ ] **PIX funcionando** - QR Code gerado corretamente
- [ ] **PIX Copia e Cola** - Payload EMV válido
- [ ] **Modal PIX** responsivo em mobile e desktop
- [ ] **Stripe configurado** (se desejado) - chaves válidas
- [ ] **Fallback PIX** ativo quando Stripe falha
- [ ] **Dashboard de doações** com filtros funcionando
- [ ] **Webhook Stripe** configurado (opcional)

### ✂️ Castração Social
- [ ] **Formulário público** acessível e funcional
- [ ] **Upload de arquivos** funcionando (fotos/documentos)
- [ ] **Validação de renda** configurada
- [ ] **Painel administrativo** para gestão de solicitações
- [ ] **Status de aprovação** funcionando corretamente

### 📊 Prestação de Contas
- [ ] **Página pública** acessível (/prestacao-contas)
- [ ] **Upload de relatórios** funcionando (admin)
- [ ] **Download público** de arquivos PDF
- [ ] **Organização por períodos** funcionando
- [ ] **Metadados** exibidos corretamente

### 📧 Comunicação
- [ ] **Email SMTP** configurado e testado
- [ ] **Notificações automáticas** funcionando
- [ ] **WhatsApp** links funcionando corretamente
- [ ] **Formulário de contato** enviando mensagens
- [ ] **Central de mensagens** (admin) operacional

### 🗺️ Integrações Externas
- [ ] **Google Maps** carregando (se configurado)
- [ ] **Google Analytics** rastreando (se configurado)
- [ ] **SEO** otimizado - meta tags dinâmicas
- [ ] **Sitemap.xml** gerado automaticamente
- [ ] **Robots.txt** configurado corretamente

### 🚀 Performance e SEO
- [ ] **Lazy loading** de imagens funcionando
- [ ] **Core Web Vitals** otimizados (LCP, FID, CLS)
- [ ] **Lighthouse Score** acima de 90
- [ ] **Cache** configurado corretamente
- [ ] **Compressão** de assets ativa

### 📱 Responsividade
- [ ] **Mobile** - todas as páginas funcionando
- [ ] **Tablet** - layout adaptado corretamente
- [ ] **Desktop** - experiência completa
- [ ] **Modais** responsivos em todos os dispositivos
- [ ] **Formulários** usáveis em telas pequenas

### 🛡️ Segurança
- [ ] **HTTPS** configurado (produção)
- [ ] **Headers de segurança** (Helmet.js) ativos
- [ ] **CORS** configurado corretamente
- [ ] **Validação de entrada** em todos os formulários
- [ ] **Tokens JWT** funcionando com expiração

### 🌐 Deploy e Produção
- [ ] **Build de produção** executado com sucesso
- [ ] **Variáveis de ambiente** de produção configuradas
- [ ] **Domínio** apontando corretamente
- [ ] **SSL/TLS** certificado válido
- [ ] **Backup** do banco de dados configurado
- [ ] **Monitoramento** (logs, uptime) ativo

---

*Desenvolvido com ❤️ para salvar vidas*