const express = require('express');
const { prisma } = require('../config/database');
const { dogSchema } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Listar cães disponíveis para adoção (público)
router.get('/', async (req, res) => {
  try {
    const { size, gender, page = 1, limit = 12 } = req.query;
    
    const where = { available: true };
    
    if (size) where.size = size;
    if (gender) where.gender = gender;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [dogs, total] = await Promise.all([
      prisma.dog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          age: true,
          size: true,
          gender: true,
          breed: true,
          temperament: true,
          images: true,
          vaccinated: true,
          neutered: true
        }
      }),
      prisma.dog.count({ where })
    ]);

    // Parse das imagens JSON
    const dogsWithImages = dogs.map(dog => ({
      ...dog,
      images: JSON.parse(dog.images || '[]')
    }));

    res.json({
      dogs: dogsWithImages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cães:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar cão específico (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dog = await prisma.dog.findUnique({
      where: { id: parseInt(id) }
    });

    if (!dog) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    // Parse das imagens JSON
    const dogWithImages = {
      ...dog,
      images: JSON.parse(dog.images || '[]')
    };

    res.json(dogWithImages);
  } catch (error) {
    console.error('Erro ao buscar cão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo cão (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = dogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const dogData = {
      ...value,
      images: JSON.stringify(value.images || [])
    };

    const dog = await prisma.dog.create({
      data: dogData
    });

    res.status(201).json({
      message: 'Cão cadastrado com sucesso',
      dog: {
        ...dog,
        images: JSON.parse(dog.images)
      }
    });
  } catch (error) {
    console.error('Erro ao criar cão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar cão (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = dogSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const dogData = {
      ...value,
      images: JSON.stringify(value.images || [])
    };

    const dog = await prisma.dog.update({
      where: { id: parseInt(id) },
      data: dogData
    });

    res.json({
      message: 'Cão atualizado com sucesso',
      dog: {
        ...dog,
        images: JSON.parse(dog.images)
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }
    console.error('Erro ao atualizar cão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar cão (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.dog.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Cão removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }
    console.error('Erro ao deletar cão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
