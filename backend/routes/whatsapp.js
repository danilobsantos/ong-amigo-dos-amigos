const express = require('express');
const router = express.Router();
const whatsappService = require('../utils/whatsapp');

// Gerar link do WhatsApp para contexto específico
router.get('/link/:context', (req, res) => {
  try {
    const { context } = req.params;
    const { message, dogName } = req.query;
    
    const link = whatsappService.generateContextLink(context, message, dogName);
    
    res.json({
      success: true,
      link,
      context
    });
  } catch (error) {
    console.error('Erro ao gerar link WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar múltiplos links para diferentes contextos
router.get('/links', (req, res) => {
  try {
    const links = whatsappService.generateMultipleLinks();
    
    res.json({
      success: true,
      links
    });
  } catch (error) {
    console.error('Erro ao gerar links WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar link para compartilhamento de cão específico
router.post('/share/dog', async (req, res) => {
  try {
    const { dogId } = req.body;
    const { prisma } = require('../config/database');
    
    const dog = await prisma.dog.findUnique({
      where: { id: parseInt(dogId) }
    });
    
    if (!dog) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }
    
    const link = whatsappService.generateDogShareLink(dog);
    
    res.json({
      success: true,
      link,
      dog: {
        id: dog.id,
        name: dog.name
      }
    });
  } catch (error) {
    console.error('Erro ao gerar link de compartilhamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar link para emergência
router.post('/emergency', (req, res) => {
  try {
    const { location } = req.body;
    
    const link = whatsappService.generateEmergencyLink(location);
    
    res.json({
      success: true,
      link,
      location: location || 'Não informado'
    });
  } catch (error) {
    console.error('Erro ao gerar link de emergência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter widget do WhatsApp para o site
router.get('/widget', (req, res) => {
  try {
    const widget = whatsappService.generateWhatsAppWidget();
    
    res.json({
      success: true,
      widget
    });
  } catch (error) {
    console.error('Erro ao gerar widget WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter botões do WhatsApp
router.get('/buttons', (req, res) => {
  try {
    const buttons = whatsappService.generateWhatsAppButtons();
    
    res.json({
      success: true,
      buttons
    });
  } catch (error) {
    console.error('Erro ao gerar botões WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter mensagens pré-definidas
router.get('/messages', (req, res) => {
  try {
    const messages = whatsappService.getPresetMessages();
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validar número de telefone
router.post('/validate-phone', (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Número de telefone é obrigatório' });
    }
    
    const isValid = whatsappService.validatePhoneNumber(phone);
    const formattedPhone = whatsappService.formatPhoneNumber(phone);
    
    res.json({
      success: true,
      isValid,
      originalPhone: phone,
      formattedPhone: isValid ? formattedPhone : null
    });
  } catch (error) {
    console.error('Erro ao validar telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar link personalizado
router.post('/custom-link', (req, res) => {
  try {
    const { message, phone } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    
    const link = whatsappService.generateWhatsAppLink(message, phone);
    
    res.json({
      success: true,
      link,
      message,
      phone: phone || whatsappService.phoneNumber
    });
  } catch (error) {
    console.error('Erro ao gerar link personalizado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
