const express = require('express');
const router = express.Router();
const stripeService = require('../utils/stripe');
const pixService = require('../utils/pix');
const emailService = require('../utils/email');
const { validateDonation } = require('../utils/validation');

// Criar sessão de pagamento Stripe
router.post('/stripe/create-session', async (req, res) => {
  try {
    const { error } = validateDonation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await stripeService.createCheckoutSession(req.body);
    
    if (result.success) {
      res.json({
        success: true,
        sessionId: result.sessionId,
        url: result.url
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar status da sessão Stripe
router.get('/stripe/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await stripeService.getSessionStatus(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        session: result.session
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook do Stripe
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await stripeService.processWebhook(req.body, signature);
    
    if (result.success) {
      res.json({ received: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro no webhook Stripe:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Gerar QR Code PIX
router.post('/pix/generate-qr', async (req, res) => {
  try {
    const { amount, description, donorName, donorEmail } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const result = await pixService.generateQRCode(amount, description);
    
    if (result.success) {
      // Registrar a doação PIX no banco
      const donationData = {
        amount,
        donorName,
        donorEmail,
        txId: result.txId,
        pixPayload: result.pixPayload
      };
      
      await pixService.registerPixDonation(donationData);
      
      res.json({
        success: true,
        qrCode: result.qrCode,
        pixPayload: result.pixPayload,
        txId: result.txId,
        amount: result.amount,
        instructions: [
          '1. Abra o app do seu banco',
          '2. Escolha a opção PIX',
          '3. Escaneie o QR Code ou use o código Copia e Cola',
          '4. Confirme os dados e finalize o pagamento'
        ]
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar PIX Copia e Cola
router.post('/pix/generate-copy-paste', async (req, res) => {
  try {
    const { amount, description, donorName, donorEmail } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const result = await pixService.generatePixCopyPaste(amount, description);
    
    if (result.success) {
      // Registrar a doação PIX no banco
      const donationData = {
        amount,
        donorName,
        donorEmail,
        txId: result.txId,
        pixPayload: result.pixPayload
      };
      
      await pixService.registerPixDonation(donationData);
      
      res.json({
        success: true,
        pixPayload: result.pixPayload,
        txId: result.txId,
        amount: result.amount,
        instructions: result.instructions
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao gerar PIX Copia e Cola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar status do pagamento PIX
router.get('/pix/status/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    const result = await pixService.checkPixPaymentStatus(txId);
    
    if (result.success) {
      res.json({
        success: true,
        status: result.status,
        donation: result.donation
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Erro ao verificar status PIX:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Confirmar pagamento PIX (simulação para desenvolvimento)
router.post('/pix/confirm/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    const { prisma } = require('../config/database');
    
    const donation = await prisma.donation.findFirst({
      where: {
        paymentId: txId,
        paymentMethod: 'pix'
      }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    if (donation.status === 'completed') {
      return res.json({ success: true, message: 'Pagamento já confirmado' });
    }

    // Atualizar status da doação
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: 'completed' }
    });

    // Enviar email de confirmação se tiver email
    if (donation.donorEmail) {
      await emailService.sendDonationConfirmation({
        donorEmail: donation.donorEmail,
        donorName: donation.donorName,
        amount: donation.amount,
        paymentMethod: 'pix',
        recurring: false
      });
    }

    res.json({
      success: true,
      message: 'Pagamento confirmado com sucesso',
      donation
    });
  } catch (error) {
    console.error('Erro ao confirmar pagamento PIX:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar métodos de pagamento disponíveis
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: 'pix',
        name: 'PIX',
        description: 'Pagamento instantâneo',
        icon: '📱',
        available: true,
        processingTime: 'Instantâneo',
        fees: 'Sem taxas'
      },
      {
        id: 'stripe',
        name: 'Cartão de Crédito/Débito',
        description: 'Visa, Mastercard, Elo',
        icon: '💳',
        available: true,
        processingTime: '1-2 dias úteis',
        fees: 'Taxas aplicáveis'
      }
    ]
  });
});

// Estatísticas de doações
router.get('/stats', async (req, res) => {
  try {
    const { prisma } = require('../config/database');
    
    const stats = await prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: 'completed' }
    });

    const monthlyStats = await prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const recurringCount = await prisma.donation.count({
      where: {
        recurring: true,
        status: 'completed'
      }
    });

    res.json({
      success: true,
      stats: {
        total: {
          amount: stats._sum.amount || 0,
          count: stats._count.id || 0
        },
        thisMonth: {
          amount: monthlyStats._sum.amount || 0,
          count: monthlyStats._count.id || 0
        },
        recurring: recurringCount
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
