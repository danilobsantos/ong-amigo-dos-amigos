const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { prisma } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Configuração do multer para upload de fotos dos animais
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'social-castration');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `animal-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPEG, JPG e PNG são permitidos'), false);
    }
  }
});

// Criar solicitação de castração social
router.post('/', upload.single('animalPhoto'), async (req, res) => {
  try {
    const {
      // Dados do Animal
      animalName,
      animalSize,
      animalAge,
      animalGender,
      animalSpecies,
      animalBreed,
      animalColor,
      animalTemperament,
      dogRabiesVaccinated,
      dogV10Vaccinated,
      catV3V4V5Vaccinated,
      catRabiesVaccinated,
      
      // Dados do Tutor
      tutorName,
      tutorBirthDate,
      tutorRG,
      tutorCPF,
      tutorAddress,
      tutorNumber,
      tutorNeighborhood,
      tutorPhone,
      householdSize,
      totalAnimals,
      hasChildren,
      childrenCount,
      monthlyIncome,
      agreesLowIncome
    } = req.body;

    // Validações básicas
    if (!animalName || !animalSize || !animalAge || !animalGender || !animalSpecies) {
      return res.status(400).json({ error: 'Dados do animal são obrigatórios' });
    }

    if (!tutorName || !tutorBirthDate || !tutorRG || !tutorCPF || !tutorPhone) {
      return res.status(400).json({ error: 'Dados do tutor são obrigatórios' });
    }

    if (!agreesLowIncome || agreesLowIncome !== 'true') {
      return res.status(400).json({ 
        error: 'É necessário concordar que sua situação se enquadra em famílias de baixa renda' 
      });
    }

    // Converter strings para tipos apropriados
    const data = {
      animalName,
      animalSize,
      animalAge,
      animalGender,
      animalSpecies,
      animalBreed: animalBreed || null,
      animalColor,
      animalTemperament,
      dogRabiesVaccinated: animalSpecies === 'cão' ? dogRabiesVaccinated === 'true' : null,
      dogV10Vaccinated: animalSpecies === 'cão' ? dogV10Vaccinated === 'true' : null,
      catV3V4V5Vaccinated: animalSpecies === 'gato' ? catV3V4V5Vaccinated === 'true' : null,
      catRabiesVaccinated: animalSpecies === 'gato' ? catRabiesVaccinated === 'true' : null,
      animalPhoto: req.file ? `/uploads/social-castration/${req.file.filename}` : null,
      
      tutorName,
      tutorBirthDate: new Date(tutorBirthDate),
      tutorRG,
      tutorCPF,
      tutorAddress,
      tutorNumber,
      tutorNeighborhood,
      tutorPhone,
      householdSize: parseInt(householdSize),
      totalAnimals: parseInt(totalAnimals),
      hasChildren: hasChildren === 'true',
      childrenCount: hasChildren === 'true' ? parseInt(childrenCount) || 0 : null,
      monthlyIncome,
      agreesLowIncome: true
    };

    const castration = await prisma.socialCastration.create({
      data
    });

    res.status(201).json({
      message: 'Solicitação de castração social enviada com sucesso',
      castration: {
        id: castration.id,
        animalName: castration.animalName,
        tutorName: castration.tutorName,
        status: castration.status,
        createdAt: castration.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de castração:', error);
    
    // Remover arquivo se houve erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar solicitações de castração (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const [castrations, total] = await Promise.all([
      prisma.socialCastration.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.socialCastration.count({ where })
    ]);

    res.json({
      castrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações de castração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar solicitação específica (admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const castration = await prisma.socialCastration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!castration) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    res.json(castration);
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status da solicitação (admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ error: 'Motivo da rejeição é obrigatório' });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    } else {
      updateData.rejectionReason = null;
    }

    const castration = await prisma.socialCastration.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      message: `Solicitação ${status === 'approved' ? 'aprovada' : status === 'rejected' ? 'rejeitada' : 'atualizada'} com sucesso`,
      castration
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir solicitação (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const castration = await prisma.socialCastration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!castration) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Remover foto se existir
    if (castration.animalPhoto) {
      const photoPath = path.join(__dirname, '..', castration.animalPhoto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await prisma.socialCastration.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Solicitação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;