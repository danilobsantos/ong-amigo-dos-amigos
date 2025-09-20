const express = require('express');
const { prisma } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { dogSchema } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Listar cães disponíveis para adoção (público)
router.get('/', async (req, res) => {
  try {
    const { size, gender, search, page = 1, limit = 12, available, animalType } = req.query;
    
  const where = {};

  // Handle availability filter
  if (req.query.all === 'true') {
    // Show all dogs regardless of availability
  } else if (available !== undefined) {
    // Convert string to boolean and filter by availability
    where.available = available === 'true';
  } else {
    // Default behavior: show only available dogs (not adopted)
    where.available = true;
    where.status = { not: 'adopted' };
  }

  if (size) where.size = size;
  if (gender) where.gender = gender;
  if (search) where.name = { contains: search };
  if (animalType) where.animalType = animalType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [dogs, total] = await Promise.all([
      prisma.dog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          images: true
        }
      }),
      prisma.dog.count({ where })
    ]);

    // Normalize images: convert DogImage objects to url strings
    const dogsWithImages = dogs.map(dog => ({
      ...dog,
      images: Array.isArray(dog.images)
        ? dog.images.map(img => img.url)
        : []
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
      where: { id: parseInt(id) },
      include: { images: true }
    });

    if (!dog) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    // Normalize images for a single dog
    const dogWithImages = {
      ...dog,
      images: Array.isArray(dog.images)
        ? dog.images.map(img => img.url)
        : []
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

    // Prepare scalar fields
    const { images, ...scalars } = value;

    // Create dog with nested images
    const dog = await prisma.dog.create({
      data: {
        ...scalars,
        images: {
          create: (images || []).map(url => ({ url }))
        }
      },
      include: { images: true }
    });

    // Return normalized response (images as array of urls)
    res.status(201).json({
      message: 'Cão cadastrado com sucesso',
      dog: {
        ...dog,
        images: Array.isArray(dog.images) ? dog.images.map(i => i.url) : []
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
    const dogId = parseInt(id);
    const { error, value } = dogSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }


    const { images, ...scalars } = value;

    // fetch current images to compute which files were removed
    const existingImages = await prisma.dogImage.findMany({ where: { dogId }, select: { url: true } });
    const existingUrls = existingImages.map(i => i.url);

    // Use a transaction: update scalar fields, replace images
    await prisma.$transaction(async (tx) => {
      await tx.dog.update({
        where: { id: dogId },
        data: scalars
      });

      // remove existing images for the dog records
      await tx.dogImage.deleteMany({ where: { dogId } });

      // create new images if provided
      if (images && images.length > 0) {
        const createData = images.map(url => ({ url, dogId }));
        await tx.dogImage.createMany({ data: createData });
      }
    });

    // fetch updated dog with images
    const dog = await prisma.dog.findUnique({ where: { id: dogId }, include: { images: true } });

    // After DB transaction, remove files that were present before but not referenced anymore
    try {
      const removed = existingUrls.filter(u => !(images || []).includes(u));
      const UPLOAD_PATH = path.join(__dirname, '..', 'uploads');
      const FRONTEND_DOGS_PATH = path.join(__dirname, '..', '..', 'frontend', 'ong-frontend', 'public', 'images', 'dogs');
      removed.forEach((url) => {
        try {
          // extract filename from url
          const filename = url.split('/').pop();
          const backendFile = path.join(UPLOAD_PATH, filename);
          const frontendFile = path.join(FRONTEND_DOGS_PATH, filename);
          if (fs.existsSync(backendFile)) {
            fs.unlinkSync(backendFile);
          }
          if (fs.existsSync(frontendFile)) {
            fs.unlinkSync(frontendFile);
          }
        } catch (e) {
          console.warn('Erro ao remover arquivo de imagem:', e.message);
        }
      });
    } catch (e) {
      console.warn('Erro ao processar remoção de arquivos de imagem:', e.message);
    }

    res.json({
      message: 'Cão atualizado com sucesso',
      dog: {
        ...dog,
        images: Array.isArray(dog.images) ? dog.images.map(i => i.url) : []
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
    const dogId = parseInt(id);

    // fetch images to delete files
    const images = await prisma.dogImage.findMany({ where: { dogId }, select: { url: true } });

    // delete DB dog (this will cascade to dogImage because of onDelete: Cascade)
    await prisma.dog.delete({ where: { id: dogId } });

    // delete files from disk
    const UPLOAD_PATH = path.join(__dirname, '..', 'uploads');
    const FRONTEND_DOGS_PATH = path.join(__dirname, '..', '..', 'frontend', 'ong-frontend', 'public', 'images', 'dogs');
    images.forEach(({ url }) => {
      try {
        const filename = url.split('/').pop();
        const backendFile = path.join(UPLOAD_PATH, filename);
        const frontendFile = path.join(FRONTEND_DOGS_PATH, filename);
        if (fs.existsSync(backendFile)) fs.unlinkSync(backendFile);
        if (fs.existsSync(frontendFile)) fs.unlinkSync(frontendFile);
      } catch (e) {
        console.warn('Erro ao remover arquivo de imagem durante delete dog:', e.message);
      }
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
