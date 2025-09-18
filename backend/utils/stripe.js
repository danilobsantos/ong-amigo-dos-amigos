const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Criar sessão de checkout
  async createCheckoutSession(donationData) {
    try {
      const { amount, donorEmail, donorName, recurring } = donationData;

      const sessionData = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Doação - ONG Amigo dos Amigos',
                description: 'Sua doação ajuda a salvar vidas de cães abandonados',
                images: ['https://example.com/logo.png'], // Substituir pela URL real do logo
              },
              unit_amount: Math.round(amount * 100), // Stripe usa centavos
            },
            quantity: 1,
          },
        ],
        mode: recurring ? 'subscription' : 'payment',
        success_url: `${process.env.FRONTEND_URL}/doacoes/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/doacoes`,
        metadata: {
          donorName: donorName || '',
          donorEmail: donorEmail || '',
          recurring: recurring.toString(),
        },
      };

      // Para doações recorrentes, criar um produto e preço recorrente
      if (recurring) {
        const product = await stripe.products.create({
          name: 'Doação Mensal - ONG Amigo dos Amigos',
          description: 'Doação mensal recorrente para ajudar cães abandonados',
        });

        const price = await stripe.prices.create({
          unit_amount: Math.round(amount * 100),
          currency: 'brl',
          recurring: { interval: 'month' },
          product: product.id,
        });

        sessionData.line_items = [
          {
            price: price.id,
            quantity: 1,
          },
        ];
      }

      // Adicionar email do cliente se fornecido
      if (donorEmail) {
        sessionData.customer_email = donorEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionData);

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Erro ao criar sessão Stripe:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Verificar status da sessão
  async getSessionStatus(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        success: true,
        session,
      };
    } catch (error) {
      console.error('Erro ao verificar sessão Stripe:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Processar webhook
  async processWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleRecurringPayment(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;
        default:
          console.log(`Evento não tratado: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no webhook Stripe:', error);
      return { success: false, error: error.message };
    }
  }

  // Tratar checkout completado
  async handleCheckoutCompleted(session) {
    try {
      const { prisma } = require('../config/database');

      const donationData = {
        amount: session.amount_total / 100, // Converter de centavos
        currency: session.currency.toUpperCase(),
        paymentMethod: 'stripe',
        paymentId: session.id,
        donorName: session.metadata.donorName || null,
        donorEmail: session.customer_email || session.metadata.donorEmail || null,
        recurring: session.metadata.recurring === 'true',
        status: 'completed',
      };

      await prisma.donation.create({
        data: donationData,
      });

      console.log('Doação registrada com sucesso:', donationData);
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
    }
  }

  // Tratar pagamento recorrente
  async handleRecurringPayment(invoice) {
    try {
      const { prisma } = require('../config/database');

      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(invoice.customer);

      const donationData = {
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        paymentMethod: 'stripe',
        paymentId: invoice.id,
        donorName: customer.name || null,
        donorEmail: customer.email || null,
        recurring: true,
        status: 'completed',
      };

      await prisma.donation.create({
        data: donationData,
      });

      console.log('Doação recorrente registrada:', donationData);
    } catch (error) {
      console.error('Erro ao registrar doação recorrente:', error);
    }
  }

  // Tratar cancelamento de assinatura
  async handleSubscriptionCanceled(subscription) {
    console.log('Assinatura cancelada:', subscription.id);
    // Aqui você pode implementar lógica adicional para lidar com cancelamentos
  }

  // Criar link de pagamento direto
  async createPaymentLink(donationData) {
    try {
      const { amount, donorEmail, donorName, recurring } = donationData;

      const productData = {
        name: 'Doação - ONG Amigo dos Amigos',
        description: 'Sua doação ajuda a salvar vidas de cães abandonados',
      };

      const product = await stripe.products.create(productData);

      const priceData = {
        unit_amount: Math.round(amount * 100),
        currency: 'brl',
        product: product.id,
      };

      if (recurring) {
        priceData.recurring = { interval: 'month' };
      }

      const price = await stripe.prices.create(priceData);

      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          donorName: donorName || '',
          donorEmail: donorEmail || '',
          recurring: recurring.toString(),
        },
      });

      return {
        success: true,
        url: paymentLink.url,
      };
    } catch (error) {
      console.error('Erro ao criar link de pagamento:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new StripeService();
