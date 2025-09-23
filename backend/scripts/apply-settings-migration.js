const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applySettingsMigration() {
  try {
    console.log('🚀 Aplicando migração para tabela de configurações...');

    // Verificar se a tabela settings já existe
    let existingSettings = null;
    try {
      existingSettings = await prisma.setting.findFirst();
    } catch (error) {
      // Se a tabela não existir, vamos criar as configurações iniciais
      console.log('⚠️  Tabela de configurações não encontrada. Criando configurações iniciais...');
    }
    
    if (!existingSettings) {
      // Criar configurações iniciais
      const newSettings = await prisma.setting.create({
        data: {
          siteName: 'ONG Amigo dos Amigos',
          logo: '',
          address: '',
          phone: '',
          whatsapp: '',
          email: ''
        }
      });
      console.log('✅ Tabela de configurações criada com sucesso!');
      console.log('✅ Configurações iniciais criadas:', newSettings);
    } else {
      console.log('ℹ️  Tabela de configurações já existe');
    }

    console.log('✅ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  applySettingsMigration();
}

module.exports = { applySettingsMigration };