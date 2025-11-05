const express = require('express');
const { prisma } = require('../config/database');
const { adoptionSchema } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Criar solicitação de adoção (público)
router.post('/', async (req, res) => {
  try {
    console.log('Received adoption data:', req.body);
    
    const { error, value } = adoptionSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Clean phone number - remove all non-numeric characters
    if (value.phone) {
      value.phone = value.phone.replace(/\D/g, '');
      console.log('Cleaned phone:', value.phone);
    }

    // Verificar se o cão existe e está disponível
    const dog = await prisma.dog.findUnique({
      where: { id: value.dogId }
    });

    if (!dog) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    if (!dog.available) {
      return res.status(400).json({ error: 'Este cão não está mais disponível para adoção' });
    }

    // Cria a adoção sem include
    const createdAdoption = await prisma.adoption.create({
      data: value
    });

    // Busca o dog e suas imagens separadamente
    const dogData = await prisma.dog.findUnique({
      where: { id: createdAdoption.dogId }
    });
    const images = await prisma.dogImage.findMany({
      where: { dogId: createdAdoption.dogId }
    });

    res.status(201).json({
      message: 'Solicitação de adoção enviada com sucesso',
      adoption: {
        ...createdAdoption,
        dog: dogData ? {
          ...dogData,
          images: images.map(img => img.url)
        } : null
      }
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de adoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar solicitações de adoção (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [adoptions, total] = await Promise.all([
      prisma.adoption.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.adoption.count({ where })
    ]);

    // Para cada adoção, buscar dog e imagens
    const adoptionsWithDog = await Promise.all(adoptions.map(async (adoption) => {
      const dogData = await prisma.dog.findUnique({
        where: { id: adoption.dogId }
      });
      const images = await prisma.dogImage.findMany({
        where: { dogId: adoption.dogId }
      });
      return {
        ...adoption,
        dog: dogData ? {
          ...dogData,
          images: images.map(img => img.url)
        } : null
      };
    }));

    res.json({
      adoptions: adoptionsWithDog,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações de adoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status da adoção (admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Fetch existing adoption to detect previous status
    const existing = await prisma.adoption.findUnique({ where: { id: parseInt(id) } });

    const updateData = { status };
    if (reason && status === 'rejected') {
      updateData.rejectionReason = reason;
    }

    const adoption = await prisma.adoption.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // If status changed to approved, mark dog as adopted and not available.
    // If status was approved and now changed away, mark dog as available again.
    try {
      if (status === 'approved') {
        await prisma.dog.update({ 
          where: { id: adoption.dogId }, 
          data: { 
            available: false,
            status: 'adopted'
          }
        });
      } else if (existing && existing.status === 'approved' && status !== 'approved') {
        // revert availability and status if previously approved
        await prisma.dog.update({ 
          where: { id: adoption.dogId }, 
          data: { 
            available: true,
            status: 'available'
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao atualizar status do cão após mudança de status da adoção:', e.message);
    }

    // Buscar adoção, dog e imagens separadamente
    const adoptionFull = await prisma.adoption.findUnique({
      where: { id: adoption.id }
    });
    const dogData = adoptionFull ? await prisma.dog.findUnique({
      where: { id: adoptionFull.dogId }
    }) : null;
    const images = dogData ? await prisma.dogImage.findMany({
      where: { dogId: dogData.id }
    }) : [];

    const adoptionWithImages = {
      ...adoptionFull,
      dog: dogData ? {
        ...dogData,
        images: images.map(img => img.url)
      } : null
    };

    res.json({
      message: 'Status da adoção atualizado com sucesso',
      adoption: adoptionWithImages
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Solicitação de adoção não encontrada' });
    }
    console.error('Erro ao atualizar status da adoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
