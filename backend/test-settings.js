const { prisma } = require('./config/database');

async function testSettings() {
  try {
    console.log('Testing settings table...');
    
    // Try to find settings
    const settings = await prisma.setting.findFirst();
    console.log('Settings found:', settings);
    
    if (!settings) {
      console.log('No settings found, creating default settings...');
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
      console.log('Created settings:', newSettings);
    }
  } catch (error) {
    console.error('Error testing settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSettings();