# 🛠️ Configurações do Site

## Visão Geral

A funcionalidade de configurações permite que os administradores gerenciem informações gerais da ONG diretamente pela área administrativa. Isso inclui:

- Nome do site
- Logo da organização
- Endereço físico
- Telefone de contato
- Número do WhatsApp
- Email de contato

## Acesso

1. Faça login na área administrativa: http://seudominio.com/admin/login
2. No menu lateral, clique em "Configurações"
3. A página de configurações será exibida com os campos disponíveis

## Campos Disponíveis

### Nome do Site
- Campo: Texto
- Descrição: Nome que aparece no título do site e em outros lugares
- Exemplo: "ONG Amigo dos Amigos"

### Logo do Site
- Campo: URL da imagem
- Descrição: URL completa para a logo da organização
- Exemplo: "https://seudominio.com/images/logo.png"

### Endereço
- Campo: Texto (área de texto)
- Descrição: Endereço completo da organização
- Exemplo: "Rua Exemplo, 123 - Centro, São Paulo/SP"

### Telefone
- Campo: Texto
- Descrição: Número de telefone para contato
- Exemplo: "(11) 1234-5678"

### WhatsApp
- Campo: Texto
- Descrição: Número do WhatsApp para contato
- Exemplo: "(11) 91234-5678"

### Email
- Campo: Texto
- Descrição: Email de contato da organização
- Exemplo: "contato@amigodosamigos.org"

## Como Usar

1. Preencha os campos desejados com as informações da sua organização
2. Clique no botão "Salvar Configurações"
3. Uma mensagem de sucesso será exibida quando as informações forem salvas

## Considerações Técnicas

### Backend
- As configurações são armazenadas em uma tabela `settings` no banco de dados
- A API fornece endpoints para obter e atualizar as configurações
- Os endpoints estão disponíveis em `/api/admin/settings`

### Frontend
- A página de configurações utiliza os componentes da biblioteca Shadcn/UI
- Os dados são carregados automaticamente ao acessar a página
- Validação de formulário é feita antes do envio

## Integração com Outras Partes do Site

As configurações podem ser utilizadas em outras partes do site, como:
- Cabeçalho e rodapé para exibir nome e logo
- Páginas de contato para mostrar endereço, telefone e email
- Links para WhatsApp

Para acessar as configurações em outras partes do frontend, utilize a API:

```javascript
import { adminAPI } from '../lib/api';

// Obter configurações
const response = await adminAPI.getSettings();
const settings = response.data;
```

## Manutenção

### Atualização do Banco de Dados

Ao adicionar novos campos de configuração, é necessário:

1. Atualizar o schema do Prisma em `backend/prisma/schema.prisma`
2. Executar a migração do banco:
   ```bash
   cd backend
   npx prisma migrate dev --name add_new_settings_field
   ```

### Adicionar Novos Campos

Para adicionar novos campos de configuração:

1. Atualizar o modelo `Setting` no schema do Prisma
2. Modificar os endpoints em `backend/routes/admin.js`
3. Atualizar a interface no frontend em `frontend/ong-frontend/src/pages/admin/Settings.jsx`
4. Atualizar as funções da API em `frontend/ong-frontend/src/lib/api.js`