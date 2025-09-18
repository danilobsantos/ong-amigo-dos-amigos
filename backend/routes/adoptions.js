const express = require('express');
const { prisma } = require('../config/database');
const { adoptionSchema } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Criar solicitação de adoção (público)
router.post('/', async (req, res) => {
  try {
    const { error, value } = adoptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
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

    const adoption = await prisma.adoption.create({
      data: value,
      include: {
        dog: {
          select: {
            name: true,
            images: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Solicitação de adoção enviada com sucesso',
      adoption: {
        ...adoption,
        dog: {
          ...adoption.dog,
          images: JSON.parse(adoption.dog.images || '[]')
        }
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
        orderBy: { createdAt: 'desc' },
        include: {
          dog: {
            select: {
              name: true,
              images: true
            }
          }
        }
      }),
      prisma.adoption.count({ where })
    ]);

    const adoptionsWithImages = adoptions.map(adoption => ({
      ...adoption,
      dog: {
        ...adoption.dog,
        images: JSON.parse(adoption.dog.images || '[]')
      }
    }));

    res.json({
      adoptions: adoptionsWithImages,
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
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const adoption = await prisma.adoption.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        dog: true
      }
    });

    // Se aprovado, marcar cão como não disponível
    if (status === 'approved') {
      await prisma.dog.update({
        where: { id: adoption.dogId },
        data: { available: false }
      });
    }

    res.json({
      message: 'Status da adoção atualizado com sucesso',
      adoption
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
