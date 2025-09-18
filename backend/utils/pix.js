const crypto = require('crypto');
const QRCode = require('qrcode');

class PixService {
  constructor() {
    this.pixKey = process.env.PIX_KEY || 'contato@amigodosamigos.org';
    this.merchantName = 'ONG AMIGO DOS AMIGOS';
    this.merchantCity = 'SAO PAULO';
    this.txId = this.generateTxId();
  }

  // Gerar ID da transação
  generateTxId() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  // Gerar payload PIX
  generatePixPayload(amount, description = 'Doacao ONG Amigo dos Amigos') {
    const pixKey = this.pixKey;
    const merchantName = this.merchantName;
    const merchantCity = this.merchantCity;
    const txId = this.generateTxId();

    // Função para calcular CRC16
    const crc16 = (str) => {
      let crc = 0xFFFF;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if (crc & 0x8000) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc = crc << 1;
          }
        }
      }
      return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    };

    // Função para formatar campo
    const formatField = (id, value) => {
      const length = value.length.toString().padStart(2, '0');
      return `${id}${length}${value}`;
    };

    // Construir payload
    let payload = '';
    
    // Payload Format Indicator
    payload += formatField('00', '01');
    
    // Point of Initiation Method
    payload += formatField('01', '12');
    
    // Merchant Account Information
    const merchantAccountInfo = formatField('00', 'BR.GOV.BCB.PIX') + formatField('01', pixKey);
    payload += formatField('26', merchantAccountInfo);
    
    // Merchant Category Code
    payload += formatField('52', '0000');
    
    // Transaction Currency
    payload += formatField('53', '986');
    
    // Transaction Amount
    if (amount && amount > 0) {
      payload += formatField('54', amount.toFixed(2));
    }
    
    // Country Code
    payload += formatField('58', 'BR');
    
    // Merchant Name
    payload += formatField('59', merchantName);
    
    // Merchant City
    payload += formatField('60', merchantCity);
    
    // Additional Data Field Template
    const additionalData = formatField('05', txId);
    payload += formatField('62', additionalData);
    
    // CRC16
    payload += '6304';
    const crcValue = crc16(payload);
    payload += crcValue;

    return {
      payload,
      txId,
      pixKey,
      amount,
      description
    };
  }

  // Gerar QR Code
  async generateQRCode(amount, description) {
    try {
      const pixData = this.generatePixPayload(amount, description);
      const qrCodeDataURL = await QRCode.toDataURL(pixData.payload);
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        pixPayload: pixData.payload,
        txId: pixData.txId,
        amount: amount,
        description: description
      };
    } catch (error) {
      console.error('Erro ao gerar QR Code PIX:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar PIX Copia e Cola
  async generatePixCopyPaste(amount, description) {
    try {
      const pixData = this.generatePixPayload(amount, description);
      
      return {
        success: true,
        pixPayload: pixData.payload,
        txId: pixData.txId,
        amount: amount,
        description: description,
        instructions: [
          '1. Abra o app do seu banco',
          '2. Escolha a opção PIX',
          '3. Selecione "Pagar com código PIX" ou "Copia e Cola"',
          '4. Cole o código abaixo',
          '5. Confirme os dados e finalize o pagamento'
        ]
      };
    } catch (error) {
      console.error('Erro ao gerar PIX Copia e Cola:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar doação PIX no banco
  async registerPixDonation(donationData) {
    try {
      const { prisma } = require('../config/database');
      
      const donation = await prisma.donation.create({
        data: {
          amount: donationData.amount,
          paymentMethod: 'pix',
          paymentId: donationData.txId,
          donorName: donationData.donorName || null,
          donorEmail: donationData.donorEmail || null,
          recurring: false, // PIX não suporta recorrência automática
          status: 'pending', // Será atualizado quando o pagamento for confirmado
          pixPayload: donationData.pixPayload,
        }
      });

      return {
        success: true,
        donation
      };
    } catch (error) {
      console.error('Erro ao registrar doação PIX:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar status do pagamento PIX (simulado)
  async checkPixPaymentStatus(txId) {
    try {
      const { prisma } = require('../config/database');
      
      const donation = await prisma.donation.findFirst({
        where: {
          paymentId: txId,
          paymentMethod: 'pix'
        }
      });

      if (!donation) {
        return {
          success: false,
          error: 'Doação não encontrada'
        };
      }

      // Em um cenário real, aqui você consultaria a API do banco
      // Para demonstração, vamos simular uma verificação
      const isPaymentConfirmed = Math.random() > 0.5; // 50% de chance de estar pago

      if (isPaymentConfirmed && donation.status === 'pending') {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: 'completed' }
        });

        return {
          success: true,
          status: 'completed',
          donation
        };
      }

      return {
        success: true,
        status: donation.status,
        donation
      };
    } catch (error) {
      console.error('Erro ao verificar status PIX:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar chave PIX aleatória (para testes)
  generateRandomPixKey() {
    const types = ['email', 'phone', 'cpf', 'random'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch (type) {
      case 'email':
        return 'contato@amigodosamigos.org';
      case 'phone':
        return '+5511999999999';
      case 'cpf':
        return '12345678901';
      case 'random':
        return crypto.randomUUID();
      default:
        return 'contato@amigodosamigos.org';
    }
  }

  // Validar chave PIX
  validatePixKey(pixKey) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+55\d{10,11}$/;
    const cpfRegex = /^\d{11}$/;
    const cnpjRegex = /^\d{14}$/;
    const randomKeyRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return (
      emailRegex.test(pixKey) ||
      phoneRegex.test(pixKey) ||
      cpfRegex.test(pixKey) ||
      cnpjRegex.test(pixKey) ||
      randomKeyRegex.test(pixKey)
    );
  }
}

module.exports = new PixService();
