const express = require('express');
const { prisma } = require('../config/database');
const { contactSchema } = require('../utils/validation');

const router = express.Router();

// Enviar mensagem de contato (público)
router.post('/', async (req, res) => {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const contact = await prisma.contact.create({
      data: value
    });

    res.status(201).json({
      message: 'Mensagem enviada com sucesso',
      contact
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
