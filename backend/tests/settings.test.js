const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/database');

describe('Settings API', () => {
  let adminToken;
  let settingsId;

  beforeAll(async () => {
    // Create a test admin user
    const admin = await prisma.user.create({
      data: {
        email: 'settings-test@amigodosamigos.org',
        password: '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWsE71IZ5aNTv1t1bE6FpDK75yOa', // admin123
        name: 'Settings Test Admin',
        role: 'admin'
      }
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'settings-test@amigodosamigos.org',
        password: 'admin123'
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.setting.deleteMany({
      where: {
        siteName: {
          contains: 'Test'
        }
      }
    });
    
    await prisma.user.deleteMany({
      where: {
        email: 'settings-test@amigodosamigos.org'
      }
    });
    
    await prisma.$disconnect();
  });

  describe('GET /api/admin/settings', () => {
    it('should get settings', async () => {
      const response = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('settings');
      expect(response.body.settings).toHaveProperty('siteName');
      expect(response.body.settings).toHaveProperty('logo');
      expect(response.body.settings).toHaveProperty('address');
      expect(response.body.settings).toHaveProperty('phone');
      expect(response.body.settings).toHaveProperty('whatsapp');
      expect(response.body.settings).toHaveProperty('email');
    });
  });

  describe('PUT /api/admin/settings', () => {
    it('should update settings', async () => {
      const updateData = {
        siteName: 'Test ONG Amigo dos Amigos',
        logo: 'http://example.com/logo.png',
        address: 'Rua Teste, 123 - São Paulo/SP',
        phone: '(11) 1234-5678',
        whatsapp: '(11) 91234-5678',
        email: 'contato@teste.org'
      };

      const response = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Configurações atualizadas com sucesso');
      expect(response.body).toHaveProperty('settings');
      expect(response.body.settings.siteName).toBe(updateData.siteName);
      expect(response.body.settings.logo).toBe(updateData.logo);
      expect(response.body.settings.address).toBe(updateData.address);
      expect(response.body.settings.phone).toBe(updateData.phone);
      expect(response.body.settings.whatsapp).toBe(updateData.whatsapp);
      expect(response.body.settings.email).toBe(updateData.email);

      settingsId = response.body.settings.id;
    });
  });
});