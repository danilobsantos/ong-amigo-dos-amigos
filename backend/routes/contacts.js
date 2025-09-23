const express = require('express');
const { prisma } = require('../config/database');
const { contactSchema } = require('../utils/validation');
const emailService = require('../utils/email');

const router = express.Router();

// Enviar mensagem de contato (público)
router.post('/', async (req, res) => {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Enviar email de confirmação para o usuário
    const autoReplyResult = await emailService.sendContactAutoReply(value);
    
    // Enviar notificação interna para a equipe
    const notificationResult = await emailService.sendInternalNotification('new_contact', value);
    
    // Opcionalmente, ainda salvar no banco para registro
    const contact = await prisma.contact.create({
      data: {
        ...value,
        emailSent: autoReplyResult.success,
        notificationSent: notificationResult.success
      }
    });

    if (!autoReplyResult.success) {
      console.error('Erro ao enviar email de confirmação:', autoReplyResult.error);
    }
    
    if (!notificationResult.success) {
      console.error('Erro ao enviar notificação interna:', notificationResult.error);
    }

    res.status(201).json({
      message: 'Mensagem enviada com sucesso',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
