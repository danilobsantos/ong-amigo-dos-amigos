# 🔧 Configuração do Stripe para Doações

## Problema Comum
O erro 500 ao usar "Cartão de crédito/débito" ocorre porque as chaves do Stripe não estão configuradas com valores reais.

## ⚠️ Status Atual
- **PIX**: ✅ Funcionando perfeitamente
- **Stripe (Cartão)**: ❌ Chaves não configuradas

## 🛠️ Como Configurar o Stripe

### 1. Criar Conta no Stripe
1. Acesse [https://stripe.com](https://stripe.com)
2. Crie uma conta gratuita
3. Acesse o Dashboard

### 2. Obter as Chaves de API
No dashboard do Stripe:
1. Vá em **Developers** → **API keys**
2. Copie as chaves:
   - **Publishable key**: `pk_test_...` (para teste) ou `pk_live_...` (produção)
   - **Secret key**: `sk_test_...` (para teste) ou `sk_live_...` (produção)

### 3. Configurar no Projeto
Edite o arquivo `/backend/.env`:

```env
# Substitua pelos valores reais do Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_real_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_real_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_real_aqui
```

### 4. Configurar Webhook (Opcional)
Para confirmação automática de pagamentos:
1. No Stripe Dashboard: **Developers** → **Webhooks**
2. Adicione endpoint: `https://seudominio.com/api/donations/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
4. Copie o **Signing secret** para `STRIPE_WEBHOOK_SECRET`

## 🚀 Após Configuração
1. Reinicie o servidor backend
2. Teste as doações por cartão
3. Verifique os pagamentos no Dashboard do Stripe

## 💡 Dica de Desenvolvimento
Para testar sem configurar Stripe:
- Use **PIX** que está funcionando perfeitamente
- O sistema detecta automaticamente chaves inválidas e sugere PIX

## 🔒 Importante
- **Teste**: Use chaves `sk_test_` e `pk_test_`
- **Produção**: Use chaves `sk_live_` e `pk_live_`
- **Nunca** commite chaves reais no repositório