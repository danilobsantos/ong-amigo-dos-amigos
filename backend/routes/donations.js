const express = require('express');
const { prisma } = require('../config/database');
const { donationSchema } = require('../utils/validation');

const router = express.Router();

// Criar doação (público)
router.post('/', async (req, res) => {
  try {
    const { error, value } = donationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const donation = await prisma.donation.create({
      data: value
    });

    res.status(201).json({
      message: 'Doação registrada com sucesso',
      donation
    });
  } catch (error) {
    console.error('Erro ao registrar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para confirmação de pagamento
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Aqui seria implementada a lógica do webhook do Stripe
    // Por enquanto, apenas confirmamos o recebimento
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router;
