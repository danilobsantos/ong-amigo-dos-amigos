// Utilitário para testar geração de PIX
const QRCode = require('qrcode');

// Função para gerar payload PIX válido seguindo padrão EMV
function generatePixPayload(pixKey, amount, recipientName, city) {
  // Normalizar valores
  const amountStr = amount.toFixed(2);
  const normalizedName = recipientName.substring(0, 25); // Máximo 25 caracteres
  const normalizedCity = city.substring(0, 15); // Máximo 15 caracteres
  
  // Função auxiliar para criar campo EMV
  function createEMVField(id, value) {
    const length = value.length.toString().padStart(2, '0');
    return id + length + value;
  }
  
  // Construir payload PIX seguindo especificação EMV
  let payload = '';
  
  // 00: Payload Format Indicator
  payload += createEMVField('00', '01');
  
  // 01: Point of Initiation Method
  payload += createEMVField('01', '12');
  
  // 26: Merchant Account Information (PIX)
  const pixData = createEMVField('00', 'br.gov.bcb.pix') + createEMVField('01', pixKey);
  payload += createEMVField('26', pixData);
  
  // 52: Merchant Category Code
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
  
  // 63: CRC16 (será calculado)
  payload += '6304';
  
  // Calcular CRC16
  const crc16 = calculateCRC16(payload);
  
  // Substituir os últimos 4 dígitos pelo CRC calculado
  payload = payload.slice(0, -4) + crc16;
  
  return payload;
}

// Função para calcular CRC16 conforme especificação PIX (polinomial 0x1021)
function calculateCRC16(payload) {
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  // Converter string para bytes
  const data = Buffer.from(payload, 'utf8');
  
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF; // Manter em 16 bits
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Teste
async function testPix() {
  const pixKey = '20.240.965.0001-69';
  const amount = 50.00;
  const recipientName = 'ONG Amigo dos Amigos';
  const city = 'Guaranesia';
  
  console.log('=== TESTE DE GERAÇÃO PIX ===');
  console.log('Chave PIX:', pixKey);
  console.log('Valor:', amount);
  console.log('Beneficiário:', recipientName);
  console.log('Cidade:', city);
  console.log('');
  
  const payload = generatePixPayload(pixKey, amount, recipientName, city);
  console.log('Payload PIX gerado:');
  console.log(payload);
  console.log('');
  
  // Gerar QR Code
  try {
    const qrCodeDataURL = await QRCode.toDataURL(payload);
    console.log('QR Code gerado com sucesso!');
    console.log('Tamanho do payload:', payload.length, 'caracteres');
    
    // Verificar estrutura
    console.log('');
    console.log('=== ESTRUTURA DO PAYLOAD ===');
    console.log('00 (Format):', payload.substring(0, 6));
    console.log('01 (Initiation):', payload.substring(6, 12));
    console.log('26 (PIX Data):', payload.substring(12, payload.indexOf('52')));
    console.log('CRC16 (últimos 4):', payload.slice(-4));
    
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testPix();
}

module.exports = { generatePixPayload, calculateCRC16 };