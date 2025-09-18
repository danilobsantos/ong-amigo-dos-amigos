class WhatsAppService {
  constructor() {
    this.phoneNumber = process.env.WHATSAPP_NUMBER || '5511999999999';
    this.baseUrl = 'https://wa.me/';
  }

  // Gerar link do WhatsApp com mensagem pré-definida
  generateWhatsAppLink(message, phone = null) {
    const targetPhone = phone || this.phoneNumber;
    const encodedMessage = encodeURIComponent(message);
    return `${this.baseUrl}${targetPhone}?text=${encodedMessage}`;
  }

  // Mensagens pré-definidas para diferentes contextos
  getPresetMessages() {
    return {
      general: 'Olá! Gostaria de saber mais sobre a ONG Amigo dos Amigos.',
      
      adoption: 'Olá! Tenho interesse em adotar um cão. Gostaria de saber mais sobre o processo de adoção.',
      
      volunteer: 'Olá! Gostaria de ser voluntário na ONG Amigo dos Amigos. Como posso ajudar?',
      
      donation: 'Olá! Gostaria de fazer uma doação para a ONG. Qual a melhor forma?',
      
      rescue: 'Olá! Encontrei um cão abandonado e preciso de ajuda para o resgate. É urgente!',
      
      partnership: 'Olá! Represento uma empresa/organização e gostaria de propor uma parceria.',
      
      complaint: 'Olá! Gostaria de denunciar um caso de maus-tratos a animais.',
      
      information: 'Olá! Gostaria de mais informações sobre o trabalho da ONG.',
      
      visit: 'Olá! Gostaria de agendar uma visita para conhecer os cães disponíveis para adoção.',
      
      support: 'Olá! Preciso de ajuda com meu pet. Vocês oferecem algum tipo de suporte?'
    };
  }

  // Gerar link para contexto específico
  generateContextLink(context, customMessage = null, dogName = null) {
    const presetMessages = this.getPresetMessages();
    let message = customMessage || presetMessages[context] || presetMessages.general;
    
    // Personalizar mensagem se for sobre um cão específico
    if (dogName && context === 'adoption') {
      message = `Olá! Tenho interesse em adotar o(a) ${dogName}. Gostaria de saber mais sobre o processo de adoção.`;
    }
    
    return this.generateWhatsAppLink(message);
  }

  // Gerar múltiplos links para diferentes contextos
  generateMultipleLinks() {
    const contexts = Object.keys(this.getPresetMessages());
    const links = {};
    
    contexts.forEach(context => {
      links[context] = this.generateContextLink(context);
    });
    
    return links;
  }

  // Validar número de telefone
  validatePhoneNumber(phone) {
    // Remover caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verificar se é um número brasileiro válido
    const brazilianPhoneRegex = /^55\d{10,11}$/;
    
    return brazilianPhoneRegex.test(cleanPhone);
  }

  // Formatar número de telefone
  formatPhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  // Gerar link para compartilhamento de cão específico
  generateDogShareLink(dog) {
    const message = `🐕 *${dog.name}* está procurando um lar! 

📋 *Informações:*
• Idade: ${dog.age}
• Porte: ${dog.size}
• Sexo: ${dog.gender}
• Temperamento: ${dog.temperament}

${dog.description ? `📝 *Sobre:* ${dog.description}` : ''}

💝 Quer adotar ou saber mais? Entre em contato conosco!

🌐 Veja mais cães: ${process.env.FRONTEND_URL}/adocao`;

    return this.generateWhatsAppLink(message);
  }

  // Gerar link para compartilhamento de campanha
  generateCampaignShareLink(campaign) {
    const message = `🎯 *${campaign.title}*

${campaign.description}

💝 Sua ajuda faz a diferença! Participe da nossa campanha.

🌐 Saiba mais: ${process.env.FRONTEND_URL}/blog/${campaign.slug}`;

    return this.generateWhatsAppLink(message);
  }

  // Gerar link para emergência
  generateEmergencyLink(location = '') {
    const locationText = location ? ` na região de ${location}` : '';
    const message = `🚨 *EMERGÊNCIA ANIMAL* 🚨

Encontrei um animal em situação de risco${locationText} e preciso de ajuda urgente para o resgate!

📍 Localização: ${location || 'A informar'}
⏰ Situação: Urgente

Por favor, me ajudem!`;

    return this.generateWhatsAppLink(message);
  }

  // Gerar botões do WhatsApp para diferentes contextos
  generateWhatsAppButtons() {
    return {
      adoption: {
        text: 'Quero Adotar',
        icon: '🐕',
        link: this.generateContextLink('adoption'),
        color: 'green'
      },
      volunteer: {
        text: 'Ser Voluntário',
        icon: '🤝',
        link: this.generateContextLink('volunteer'),
        color: 'blue'
      },
      donation: {
        text: 'Fazer Doação',
        icon: '💝',
        link: this.generateContextLink('donation'),
        color: 'purple'
      },
      rescue: {
        text: 'Resgate Urgente',
        icon: '🚨',
        link: this.generateContextLink('rescue'),
        color: 'red'
      },
      information: {
        text: 'Mais Informações',
        icon: 'ℹ️',
        link: this.generateContextLink('information'),
        color: 'gray'
      }
    };
  }

  // Gerar widget do WhatsApp para o site
  generateWhatsAppWidget() {
    const mainLink = this.generateContextLink('general');
    
    return {
      mainButton: {
        link: mainLink,
        text: 'Fale Conosco',
        icon: '💬'
      },
      quickActions: this.generateWhatsAppButtons(),
      floatingButton: {
        link: mainLink,
        position: 'bottom-right',
        color: '#25D366', // Cor oficial do WhatsApp
        icon: '💬'
      }
    };
  }
}

module.exports = new WhatsAppService();
