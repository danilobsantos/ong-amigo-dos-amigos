# 🐕 ONG Amigo dos Amigos - Site Institucional

Um site completo e moderno para a ONG Amigo dos Amigos, focado no resgate, cuidado e adoção responsável de cães & gatos abandonados.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido para fornecer uma plataforma digital completa para a ONG Amigo dos Amigos, incluindo:

- **Site institucional** com informações sobre a ONG
- **Sistema de adoção** com catálogo de cães disponíveis
- **Plataforma de doações** com PIX e cartão de crédito
- **Blog** para compartilhar histórias e informações
- **Sistema de voluntariado** para cadastro de interessados
- **Área administrativa** para gerenciar todo o conteúdo

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Framework JavaScript moderno
- **TailwindCSS** - Framework CSS utilitário
- **Shadcn/UI** - Componentes de interface elegantes
- **Lucide React** - Ícones modernos
- **React Router** - Roteamento SPA
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **React Helmet Async** - Gerenciamento de SEO

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimalista
- **Prisma** - ORM moderno para banco de dados
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de emails

### Integrações
- **Stripe** - Processamento de pagamentos
- **PIX** - Pagamentos instantâneos brasileiros
- **WhatsApp** - Comunicação direta
- **Google Maps** - Localização da ONG

## 📁 Estrutura do Projeto

```
ong-amigo-dos-amigos/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configurações
│   ├── middlewares/        # Middlewares Express
│   ├── prisma/            # Schema e migrações do banco
│   ├── routes/            # Rotas da API
│   ├── scripts/           # Scripts utilitários
│   ├── uploads/           # Arquivos enviados
│   └── utils/             # Utilitários e serviços
├── frontend/              # Aplicação React
│   └── ong-frontend/      # Projeto React principal
│       ├── public/        # Arquivos estáticos
│       └── src/           # Código fonte
│           ├── components/ # Componentes reutilizáveis
│           ├── contexts/   # Contextos React
│           ├── hooks/      # Hooks customizados
│           ├── lib/        # Bibliotecas e configurações
│           └── pages/      # Páginas da aplicação
├── docs/                  # Documentação
├── deploy.sh             # Script de deploy automatizado
└── README.md             # Este arquivo
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **MySQL** 8.0+
- **pnpm** (para o frontend)
- **Git**

### Instalação Rápida

1. **Clone o repositório:**
```bash
git clone https://github.com/danilobsantos/ong-amigo-dos-amigos.git
cd ong-amigo-dos-amigos
```

2. **Execute o script de setup:**
```bash
./deploy.sh development
```

3. **Configure as variáveis de ambiente:**
```bash
cp backend/.env.example backend/.env
# Edite o arquivo .env com suas configurações
```

4. **Inicie os serviços:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend/ong-frontend
pnpm run dev
```

5. **Acesse a aplicação:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Admin: http://localhost:5173/admin/login

### Instalação Manual

#### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node scripts/setup-database.js
npm start
```

#### Frontend

```bash
cd frontend/ong-frontend
pnpm install
pnpm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```env
# Banco de Dados
DATABASE_URL="mysql://user:password@localhost:3306/ong_amigo_dos_amigos"

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_stripe

# Email
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# WhatsApp
WHATSAPP_NUMBER=5511999999999

# Google Maps
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

### Banco de Dados

O projeto usa MySQL com Prisma ORM. O schema está em `backend/prisma/schema.prisma`.

**Comandos úteis:**
```bash
npx prisma studio          # Interface visual do banco
npx prisma db push         # Aplicar mudanças no schema
npx prisma generate        # Gerar cliente Prisma
```

## 📱 Funcionalidades

### 🏠 Site Público

- **Home** - Apresentação da ONG com call-to-actions
- **Sobre** - História, missão e equipe
- **Adoção** - Catálogo de cães com filtros e busca
- **Doações** - Sistema completo de doações (PIX/Cartão)
- **Voluntariado** - Formulário para cadastro de voluntários
- **Blog** - Artigos sobre cuidados e histórias de sucesso
- **Contato** - Formulário e informações de contato

### 🔐 Área Administrativa

- **Dashboard** - Visão geral com estatísticas
- **Gerenciar Cães** - CRUD completo de animais
- **Adoções** - Acompanhar processos de adoção
- **Blog** - Criar e editar posts
- **Voluntários** - Gerenciar cadastros de voluntários
- **Doações** - Visualizar histórico de doações
- **Contatos** - Gerenciar mensagens recebidas

### 💳 Sistema de Pagamentos

- **PIX** - Geração automática de QR Code e Copia e Cola
- **Cartão** - Integração com Stripe (crédito/débito)
- **Recorrente** - Doações mensais automáticas
- **Transparência** - Relatórios de uso das doações

### 📧 Comunicação

- **Email** - Confirmações automáticas de doações/adoções
- **WhatsApp** - Links diretos para contato
- **Notificações** - Sistema de alertas para administradores

## 🎨 Design e UX

### Identidade Visual

- **Verde (#27ae60)** - Confiança e natureza
- **Laranja (#e67e22)** - Energia e ação  
- **Branco (#ffffff)** - Clareza e limpeza

### Responsividade

- Design mobile-first
- Breakpoints otimizados para todos os dispositivos
- Imagens adaptáveis com lazy loading
- Performance otimizada para conexões lentas

### Acessibilidade

- Contraste adequado para leitura
- Navegação por teclado
- Alt text em todas as imagens
- Estrutura semântica HTML5

## 🔍 SEO e Performance

### Otimizações Implementadas

- **Meta tags dinâmicas** para cada página
- **Sitemap.xml** gerado automaticamente
- **Robots.txt** configurado
- **Structured Data** (JSON-LD) para melhor indexação
- **Lazy loading** de imagens e componentes
- **Code splitting** automático do React
- **Compressão** de assets
- **Cache** otimizado

### Core Web Vitals

- **LCP** < 2.5s - Carregamento otimizado
- **FID** < 100ms - Interatividade rápida
- **CLS** < 0.1 - Layout estável

## 🚀 Deploy

### Desenvolvimento

```bash
./deploy.sh development
```

### Produção

```bash
./deploy.sh production
```

### Deploy Manual

#### Frontend (Netlify/Vercel)

```bash
cd frontend/ong-frontend
pnpm run build
# Upload da pasta dist/
```

#### Backend (Railway/Heroku/VPS)

```bash
cd backend
npm install --production
npx prisma generate
npx prisma db push
npm start
```

## 📊 Monitoramento

### Logs

- Logs estruturados com Winston
- Rotação automática de arquivos
- Níveis: error, warn, info, debug

### Analytics

- Google Analytics integrado
- Métricas de performance customizadas
- Tracking de eventos importantes

### Saúde da Aplicação

- Health check endpoint: `/api/health`
- Monitoramento de banco de dados
- Alertas automáticos por email

## 🧪 Testes

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend/ong-frontend
pnpm test
```

### E2E

```bash
pnpm run test:e2e
```

## 📚 API Documentation

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado

#### Cães
- `GET /api/dogs` - Listar cães disponíveis
- `GET /api/dogs/:id` - Detalhes de um cão
- `POST /api/dogs` - Criar novo cão (admin)
- `PUT /api/dogs/:id` - Atualizar cão (admin)
- `DELETE /api/dogs/:id` - Remover cão (admin)

#### Adoções
- `POST /api/adoptions` - Solicitar adoção
- `GET /api/adoptions` - Listar solicitações (admin)
- `PUT /api/adoptions/:id` - Atualizar status (admin)

#### Doações
- `POST /api/payments/stripe/create-session` - Criar sessão Stripe
- `POST /api/payments/pix/generate-qr` - Gerar PIX QR Code
- `GET /api/donations/stats` - Estatísticas de doações

#### Blog
- `GET /api/blog` - Listar posts publicados
- `GET /api/blog/:slug` - Detalhes de um post
- `POST /api/blog` - Criar post (admin)
- `PUT /api/blog/:id` - Atualizar post (admin)

### Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu_jwt_token>
```

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra** um Pull Request

### Padrões de Código

- **ESLint** para JavaScript/React
- **Prettier** para formatação
- **Conventional Commits** para mensagens
- **Testes** obrigatórios para novas features

### Issues

Use as labels apropriadas:
- `bug` - Correção de bugs
- `enhancement` - Melhorias
- `feature` - Novas funcionalidades
- `documentation` - Documentação
- `help wanted` - Ajuda necessária

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento** - Danilo Santos
- **Design** - Baseado nas melhores práticas de UX/UI

### Documentação
- [Wiki do Projeto](https://github.com/danilobsantos/ong-amigo-dos-amigos/wiki)
- [FAQ](https://github.com/danilobsantos/ong-amigo-dos-amigos/wiki/FAQ)

### Contato
- **Email**: danilo@devstudio.com.br
- **Issues**: [GitHub Issues](https://github.com/danilobsantos/ong-amigo-dos-amigos/issues)
- **Discussões**: [GitHub Discussions](https://github.com/danilobsantos/ong-amigo-dos-amigos/discussions)

## 🎯 Roadmap

### Versão 2.0 (Planejada)
- [ ] Sistema de apadrinhamento
- [ ] Sistema de doação recorrente via cartão de crédito
- [ ] Integração com redes sociais
- [ ] Sistema de eventos
- [ ] Sistema de prestação de contas

### Melhorias Contínuas
- [ ] Testes automatizados completos
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento avançado
- [ ] Otimizações de performance

---

## 🌟 Agradecimentos

Agradecemos a todos que contribuem para o bem-estar animal e apoiam o trabalho da ONG Amigo dos Amigos. Cada linha de código deste projeto foi escrita pensando em salvar vidas e conectar corações. 🐕❤️

**Juntos, fazemos a diferença!**

---

*Desenvolvido com ❤️ para a ONG Amigo dos Amigos*
