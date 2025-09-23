const express = require('express');
const { prisma } = require('../config/database');
const { blogPostSchema } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação para todas as rotas admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard - estatísticas gerais
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalDogs,
      availableDogs,
      pendingAdoptions,
      pendingVolunteers,
      unreadContacts,
      totalDonations,
      socialCastrations,
      recentDonations
    ] = await Promise.all([
      prisma.dog.count(),
      prisma.dog.count({ where: { available: true } }),
      prisma.adoption.count({ where: { status: 'pending' } }),
      prisma.volunteer.count({ where: { status: 'pending' } }),
      prisma.contact.count({ where: { status: 'unread' } }),
      prisma.donation.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      prisma.socialCastration.count({ where: { status: 'pending' } }),
      prisma.donation.findMany({
        where: { status: 'completed' },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      stats: {
        totalDogs,
        availableDogs,
        pendingAdoptions,
        totalVolunteers: pendingVolunteers,
        unreadContacts,
        totalDonations: totalDonations._sum.amount || 0,
        socialCastrations
      },
      recentDonations
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Configurações do site
router.get('/settings', async (req, res) => {
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
          email: ''
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { siteName, logo, address, phone, whatsapp, email } = req.body;
    
    // Verificar se já existem configurações
    let settings = await prisma.setting.findFirst();
    
    if (settings) {
      // Atualizar configurações existentes
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: {
          siteName,
          logo,
          address,
          phone,
          whatsapp,
          email
        }
      });
    } else {
      // Criar novas configurações
      settings = await prisma.setting.create({
        data: {
          siteName,
          logo,
          address,
          phone,
          whatsapp,
          email
        }
      });
    }

    res.json({
      message: 'Configurações atualizadas com sucesso',
      settings
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerenciar posts do blog
router.get('/blog', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.blogPost.count()
    ]);

    console.log('Posts encontrados:', posts.map(p => ({ id: p.id, title: p.title })));

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar post específico por ID (admin)
router.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Buscando post com ID:', id);

    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) }
    });

    console.log('Post encontrado:', post);

    if (!post) {
      console.log('Post não encontrado para ID:', id);
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar post do blog
router.post('/blog', async (req, res) => {
  try {
    const { error, value } = blogPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Gerar slug a partir do título
    const slug = value.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const postData = {
      ...value,
      slug,
      publishedAt: value.published ? new Date() : null
    };

    const post = await prisma.blogPost.create({
      data: postData
    });

    res.status(201).json({
      message: 'Post criado com sucesso',
      post
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe um post com este título' });
    }
    console.error('Erro ao criar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar post do blog
router.put('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = blogPostSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const postData = {
      ...value,
      publishedAt: value.published ? new Date() : null
    };

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: postData
    });

    res.json({
      message: 'Post atualizado com sucesso',
      post
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    console.error('Erro ao atualizar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar post do blog
router.delete('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.blogPost.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar voluntários
router.get('/volunteers', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [volunteers, total] = await Promise.all([
      prisma.volunteer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.volunteer.count({ where })
    ]);

    const volunteersWithAreas = volunteers.map(volunteer => ({
      ...volunteer,
      areas: JSON.parse(volunteer.areas || '[]')
    }));

    res.json({
      volunteers: volunteersWithAreas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar voluntários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status do voluntário
router.patch('/volunteers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validar status permitidos
    const allowedStatuses = ['pending', 'approved', 'rejected', 'active', 'inactive'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const volunteer = await prisma.volunteer.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(reason && { rejectionReason: reason })
      }
    });

    const volunteerWithAreas = {
      ...volunteer,
      areas: JSON.parse(volunteer.areas || '[]')
    };

    res.json({
      message: 'Status do voluntário atualizado com sucesso',
      volunteer: volunteerWithAreas
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Voluntário não encontrado' });
    }
    console.error('Erro ao atualizar status do voluntário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar doações
router.get('/donations', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.donation.count()
    ]);

    res.json({
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar contatos
router.get('/contacts', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contact.count({ where })
    ]);

    res.json({
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;