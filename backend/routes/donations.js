const express = require('express');
const { prisma } = require('../config/database');
const { donationDataSchema } = require('../utils/validation');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Middleware combinado para admin
const authenticateAdmin = [authenticateToken, requireAdmin];

// Função para remover acentos e caracteres especiais para compatibilidade bancária
function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-0\s]/g, '') // Mantém apenas letras, números e espaços
    .trim();
}

// Função para gerar payload PIX válido seguindo padrão EMV
function generatePixPayload(pixKey, amount, recipientName, city) {
  // Normalizar valores
  const amountStr = amount.toFixed(2);
  const normalizedName = normalizeString(recipientName).substring(0, 25);
  const normalizedCity = normalizeString(city).substring(0, 15);
  
  // Normalizar Chave PIX
  let normalizedKey = pixKey.trim();
  // Se for e-mail ou chave aleatória, não removemos caracteres especiais exceto espaços
  // Se for CPF (11), CNPJ (14) ou Telefone (10+) e conter apenas números/pontos/traços
  if (normalizedKey.match(/^[0-9.\-\s+]+$/)) {
    normalizedKey = normalizedKey.replace(/[^0-9]/g, '');
    // Se for telefone brasileiro e não tiver o prefixo +55, adicionamos (opcional, mas recomendado)
    if (normalizedKey.length >= 10 && normalizedKey.length <= 11) {
      // Alguns bancos preferem 55+DDD+Número
      // mas vamos manter apenas os números por enquanto pois varia entre bancos
    }
  }
  
  // Função auxiliar para criar campo EMV
  function createEMVField(id, value) {
    // A especificação EMV usa COMPRIMENTO EM BYTES, não caracteres
    const valueBuffer = Buffer.from(value, 'utf8');
    const length = valueBuffer.length.toString().padStart(2, '0');
    return id + length + value;
  }
  
  // Construir payload PIX seguindo especificação EMV
  let payload = '';
  
  // 00: Payload Format Indicator
  payload += createEMVField('00', '01');
  
  // 01: Point of Initiation Method (11 para Estático, 12 para Dinâmico)
  // Como estamos gerando um valor fixo, 12 é tecnicamente mais correto, 
  // mas 11 é mais universal para chaves estáticas simples
  payload += createEMVField('01', '12');
  
  // 26: Merchant Account Information (PIX)
  const pixData = createEMVField('00', 'br.gov.bcb.pix') + createEMVField('01', normalizedKey);
  payload += createEMVField('26', pixData);
  
  // 52: Merchant Category Code (0000 = não especificado)
  payload += createEMVField('52', '0000');
  
  // 53: Transaction Currency (BRL = 986)
  payload += createEMVField('53', '986');
  
  // 54: Transaction Amount
  payload += createEMVField('54', amountStr);
  
  // 58: Country Code
  payload += createEMVField('58', 'BR');
  
  // 59: Merchant Name
  payload += createEMVField('59', normalizedName);
  
  // 60: Merchant City
  payload += createEMVField('60', normalizedCity);
  
  // 62: Additional Data Field (Informações adicionais)
  const additionalData = createEMVField('05', 'DOACAO');
  payload += createEMVField('62', additionalData);
  
  // 63: CRC16 - OBRIGATÓRIO NA ESTRUTURA
  // Adiciona o marcador do CRC (ID 63, Tamanho 04)
  payload += '6304';
  
  // Calcular CRC16 sobre TODO o payload (incluindo o '6304')
  const crc16 = calculateCRC16(payload);
  
  // Concatena o valor do CRC ao final
  return payload + crc16;
}

// Função para calcular CRC16 conforme especificação PIX (polinomial 0x1021)
function calculateCRC16(payload) {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  const data = Buffer.from(payload, 'utf8');
  
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Criar doação PIX (público)
router.post('/pix', async (req, res) => {
  try {
    console.log('Recebendo dados PIX:', req.body);
    const { error, value } = donationDataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Criar doação no banco
    const donation = await prisma.donation.create({
      data: {
        ...value,
        paymentMethod: 'pix',
        status: 'pending'
      }
    });

    // Buscar chave PIX no banco de dados
    const settings = await prisma.setting.findFirst();
    const pixKey = settings?.pixKey || process.env.PIX_KEY;

    if (!pixKey) {
      console.error('Chave PIX não configurada');
      return res.status(500).json({ error: 'Pagamento PIX temporariamente indisponível' });
    }

    // Gerar dados do PIX com payload válido
    const pixPayload = generatePixPayload(
      pixKey,
      value.amount,
      'ONG Amigo dos Amigos',
      'Guaranesia'
    );
    
    console.log('PIX Payload gerado:', pixPayload);
    console.log('Chave PIX utilizada:', pixKey);
    console.log('Valor:', value.amount);
    
    // Gerar QR Code
    const qrCodeDataURL = await QRCode.toDataURL(pixPayload);

    res.status(201).json({
      message: 'Doação PIX criada com sucesso',
      donation,
      pix: {
        payload: pixPayload,
        qrCode: qrCodeDataURL,
        key: pixKey
      }
    });
  } catch (error) {
    console.error('Erro ao criar doação PIX:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar sessão de pagamento Stripe (público)
router.post('/stripe', async (req, res) => {
  try {
    console.log('Recebendo dados Stripe:', req.body);
    
    // Buscar chaves do Stripe no banco de dados
    const settings = await prisma.setting.findFirst();
    const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    // Verificar se as chaves do Stripe estão configuradas
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_sua_chave_stripe_aqui') {
      console.error('Chave do Stripe não configurada');
      return res.status(500).json({ 
        error: 'Pagamentos com cartão temporariamente indisponíveis. Use PIX como alternativa.' 
      });
    }

    // Inicializar stripe com a chave correta
    const stripeInstance = require('stripe')(stripeSecretKey);
    
    const { error, value } = donationDataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Criar doação no banco
    const donation = await prisma.donation.create({
      data: {
        ...value,
        paymentMethod: 'stripe',
        status: 'pending'
      }
    });

    // Configurar sessão do Stripe
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Doação - ONG Amigo dos Amigos',
            description: 'Sua doação ajuda a salvar vidas de cães abandonados',
          },
          unit_amount: Math.round(value.amount * 100), // Stripe usa centavos
        },
        quantity: 1,
      }],
      mode: value.recurring ? 'subscription' : 'payment',
      success_url: `${process.env.FRONTEND_URL}/doacoes/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/doacoes`,
      metadata: {
        donationId: donation.id.toString(),
        donorName: value.donorName || '',
        donorEmail: value.donorEmail || '',
      },
    };

    // Para doações recorrentes
    if (value.recurring) {
      sessionConfig.line_items[0].price_data.recurring = { interval: 'month' };
    }

    const session = await stripeInstance.checkout.sessions.create(sessionConfig);

    // Atualizar doação com ID da sessão
    await prisma.donation.update({
      where: { id: donation.id },
      data: { stripeSessionId: session.id }
    });

    res.status(201).json({
      message: 'Sessão de pagamento criada com sucesso',
      donation,
      sessionId: session.id,
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error);
    
    // Tratar erros específicos do Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: 'Configuração de pagamento inválida. Use PIX como alternativa.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar pagamento. Tente usar PIX como alternativa.' 
    });
  }
});

// Verificar status de pagamento Stripe (público)
router.get('/stripe/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const settings = await prisma.setting.findFirst();
    const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    const stripeInstance = require('stripe')(stripeSecretKey);
    
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    
    // Buscar doação no banco
    const donation = await prisma.donation.findFirst({
      where: { stripeSessionId: sessionId }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    // Atualizar status se necessário
    if (session.payment_status === 'paid' && donation.status === 'pending') {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { 
          status: 'completed',
          paidAt: new Date()
        }
      });
    }

    res.json({
      donation,
      paymentStatus: session.payment_status,
      sessionStatus: session.status
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter detalhes de uma doação por ID (público) - usado na página de sucesso do PIX
router.get('/status-by-id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await prisma.donation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    res.json({ donation });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar doações (admin)
router.get('/', ...authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.donation.count({ where });

    res.json({
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status de doação (admin)
router.patch('/:id/status', ...authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const donation = await prisma.donation.update({
      where: { id: parseInt(id) },
      data: {
        status,
        notes,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Status da doação atualizado com sucesso',
      donation
    });
  } catch (error) {
    console.error('Erro ao atualizar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para confirmação de pagamento Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    const settings = await prisma.setting.findFirst();
    const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = settings?.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
    const stripeInstance = require('stripe')(stripeSecretKey);

    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err) {
      console.error('Erro na verificação do webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Processar evento
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleRecurringPayment(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Funções auxiliares para webhook
async function handleCheckoutCompleted(session) {
  try {
    const donation = await prisma.donation.findFirst({
      where: { stripeSessionId: session.id }
    });

    if (donation) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: 'completed',
          paidAt: new Date(),
          stripePaymentId: session.payment_intent
        }
      });
      
      // Aqui você pode adicionar lógica para enviar email de confirmação
      console.log(`Doação ${donation.id} confirmada via Stripe`);
    }
  } catch (error) {
    console.error('Erro ao processar checkout completado:', error);
  }
}

async function handleRecurringPayment(invoice) {
  try {
    // Lógica para pagamentos recorrentes
    console.log('Pagamento recorrente processado:', invoice.id);
  } catch (error) {
    console.error('Erro ao processar pagamento recorrente:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  try {
    // Lógica para cancelamento de assinatura
    console.log('Assinatura cancelada:', subscription.id);
  } catch (error) {
    console.error('Erro ao processar cancelamento:', error);
  }
}

module.exports = router;
