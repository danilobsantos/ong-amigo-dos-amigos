const express = require('express');
const { prisma } = require('../config/database');

const router = express.Router();

// Configurações públicas do site (sem autenticação necessária)
router.get('/', async (req, res) => {
  try {
    // Buscar as configurações do site
    let settings = await prisma.setting.findFirst();
    
    // Se não existirem configurações, criar com valores padrão
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          siteName: 'ONG Amigo dos Amigos',
          logo: '',
          address: '',
          phone: '',
          whatsapp: '',
          email: '',
          facebook: '',
          instagram: '',
          youtube: '',
          tiktok: '',
          stripePublicKey: '',
          stripeSecretKey: '',
          stripeWebhookSecret: ''
        }
      });
    }

    // Retornar apenas as configurações públicas (não incluir dados sensíveis se houver)
    const publicSettings = {
      siteName: settings.siteName,
      logo: settings.logo,
      address: settings.address,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      facebook: settings.facebook,
      instagram: settings.instagram,
      youtube: settings.youtube,
      tiktok: settings.tiktok,
      stripePublicKey: settings.stripePublicKey
    };

    res.json({ settings: publicSettings });
  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;