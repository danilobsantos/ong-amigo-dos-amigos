const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.fromEmail = process.env.FROM_EMAIL || 'contato@amigodosamigos.org';
    this.fromName = 'ONG Amigo dos Amigos';
  }

  // Enviar email genérico
  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Remover HTML para versão texto
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Email de confirmação de doação
  async sendDonationConfirmation(donationData) {
    const { donorEmail, donorName, amount, paymentMethod, recurring } = donationData;
    
    if (!donorEmail) return { success: false, error: 'Email não fornecido' };

    const subject = 'Obrigado pela sua doação! 💝';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #27ae60; color: white; padding: 20px; text-align: center;">
          <h1>🐕 ONG Amigo dos Amigos</h1>
          <h2>Obrigado pela sua doação!</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Olá ${donorName || 'Doador'},</p>
          
          <p>Recebemos sua doação com muito carinho! Sua contribuição fará uma diferença real na vida dos nossos cães.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalhes da Doação:</h3>
            <p><strong>Valor:</strong> R$ ${amount.toFixed(2).replace('.', ',')}</p>
            <p><strong>Método:</strong> ${paymentMethod.toUpperCase()}</p>
            <p><strong>Tipo:</strong> ${recurring ? 'Doação Mensal Recorrente' : 'Doação Única'}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <h3>Como sua doação ajuda:</h3>
          <ul>
            <li>🍖 R$ 25 = Ração para 1 semana</li>
            <li>💉 R$ 50 = Vacina completa</li>
            <li>🏥 R$ 100 = Castração</li>
            <li>🚑 R$ 200 = Tratamento veterinário</li>
          </ul>
          
          <p>Acompanhe nosso trabalho nas redes sociais e veja o impacto da sua contribuição!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Visitar Site</a>
          </div>
          
          <p>Com gratidão,<br>Equipe ONG Amigo dos Amigos</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>ONG Amigo dos Amigos | Rua das Flores, 123 - São Paulo, SP</p>
          <p>contato@amigodosamigos.org | (11) 99999-9999</p>
        </div>
      </div>
    `;

    return await this.sendEmail(donorEmail, subject, html);
  }

  // Email de confirmação de adoção
  async sendAdoptionConfirmation(adoptionData) {
    const { email, name, dog } = adoptionData;
    
    const subject = `Solicitação de adoção recebida - ${dog.name} 🐕`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #27ae60; color: white; padding: 20px; text-align: center;">
          <h1>🐕 ONG Amigo dos Amigos</h1>
          <h2>Solicitação de Adoção Recebida!</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Olá ${name},</p>
          
          <p>Recebemos sua solicitação de adoção do(a) <strong>${dog.name}</strong>! Ficamos muito felizes com seu interesse.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Próximos Passos:</h3>
            <ol>
              <li>Nossa equipe analisará sua solicitação</li>
              <li>Entraremos em contato em até 48 horas</li>
              <li>Agendaremos uma conversa para conhecê-lo melhor</li>
              <li>Se aprovado, marcaremos a visita para conhecer o ${dog.name}</li>
            </ol>
          </div>
          
          <p>Enquanto isso, que tal conhecer mais sobre nosso trabalho e outros cães disponíveis?</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/adocao" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Outros Cães</a>
          </div>
          
          <p>Obrigado por escolher a adoção responsável!</p>
          
          <p>Com carinho,<br>Equipe ONG Amigo dos Amigos</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>ONG Amigo dos Amigos | Rua das Flores, 123 - São Paulo, SP</p>
          <p>contato@amigodosamigos.org | (11) 99999-9999</p>
        </div>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Email de confirmação de voluntariado
  async sendVolunteerConfirmation(volunteerData) {
    const { email, name } = volunteerData;
    
    const subject = 'Bem-vindo à equipe de voluntários! 🤝';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #27ae60; color: white; padding: 20px; text-align: center;">
          <h1>🐕 ONG Amigo dos Amigos</h1>
          <h2>Bem-vindo à nossa equipe!</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Olá ${name},</p>
          
          <p>Que alegria ter você conosco! Recebemos seu cadastro de voluntário e estamos ansiosos para contar com sua ajuda.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Próximos Passos:</h3>
            <ol>
              <li>Nossa equipe entrará em contato em breve</li>
              <li>Agendaremos uma conversa para conhecê-lo melhor</li>
              <li>Faremos um treinamento inicial</li>
              <li>Você começará a ajudar a salvar vidas!</li>
            </ol>
          </div>
          
          <p>Enquanto isso, siga-nos nas redes sociais para acompanhar nosso trabalho:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/sobre" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Conheça Nossa História</a>
          </div>
          
          <p>Juntos, faremos a diferença na vida de muitos cães!</p>
          
          <p>Com gratidão,<br>Equipe ONG Amigo dos Amigos</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>ONG Amigo dos Amigos | Rua das Flores, 123 - São Paulo, SP</p>
          <p>contato@amigodosamigos.org | (11) 99999-9999</p>
        </div>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Email de resposta automática para contato
  async sendContactAutoReply(contactData) {
    const { email, name } = contactData;
    
    const subject = 'Recebemos sua mensagem! 📧';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #27ae60; color: white; padding: 20px; text-align: center;">
          <h1>🐕 ONG Amigo dos Amigos</h1>
          <h2>Mensagem Recebida!</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Olá ${name},</p>
          
          <p>Recebemos sua mensagem e agradecemos pelo contato! Nossa equipe responderá o mais breve possível.</p>
          
          <p><strong>Tempo de resposta:</strong> Até 24 horas em dias úteis</p>
          
          <p>Para urgências, entre em contato pelo WhatsApp: (11) 99999-9999</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="background-color: #e67e22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Visitar Site</a>
          </div>
          
          <p>Obrigado por apoiar nosso trabalho!</p>
          
          <p>Atenciosamente,<br>Equipe ONG Amigo dos Amigos</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>ONG Amigo dos Amigos | Rua das Flores, 123 - São Paulo, SP</p>
          <p>contato@amigodosamigos.org | (11) 99999-9999</p>
        </div>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Notificação interna para a equipe
  async sendInternalNotification(type, data) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@amigodosamigos.org';
    
    let subject, html;
    
    switch (type) {
      case 'new_adoption':
        subject = `Nova solicitação de adoção - ${data.dog.name}`;
        html = `
          <h2>Nova Solicitação de Adoção</h2>
          <p><strong>Cão:</strong> ${data.dog.name}</p>
          <p><strong>Interessado:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefone:</strong> ${data.phone}</p>
          <p><strong>Motivo:</strong> ${data.reason}</p>
        `;
        break;
        
      case 'new_volunteer':
        subject = `Novo voluntário cadastrado - ${data.name}`;
        html = `
          <h2>Novo Voluntário</h2>
          <p><strong>Nome:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefone:</strong> ${data.phone}</p>
          <p><strong>Disponibilidade:</strong> ${data.availability}</p>
        `;
        break;
        
      case 'new_contact':
        subject = `Nova mensagem de contato - ${data.name}`;
        html = `
          <h2>Nova Mensagem de Contato</h2>
          <p><strong>Nome:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Assunto:</strong> ${data.subject || 'Não informado'}</p>
          <p><strong>Mensagem:</strong> ${data.message}</p>
        `;
        break;
        
      default:
        return { success: false, error: 'Tipo de notificação inválido' };
    }

    return await this.sendEmail(adminEmail, subject, html);
  }
}

module.exports = new EmailService();
