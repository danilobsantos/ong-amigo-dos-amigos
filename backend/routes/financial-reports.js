const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { prisma } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Configuração do multer para upload de PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'financial-reports');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedPeriod = req.body.period?.replace(/[^a-zA-Z0-9-]/g, '') || 'report';
    const ext = path.extname(file.originalname);
    cb(null, `${sanitizedPeriod}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'), false);
    }
  }
});

// Listar relatórios financeiros públicos (sem autenticação)
router.get('/public', async (req, res) => {
  try {
    const reports = await prisma.financialReport.findMany({
      select: {
        id: true,
        period: true,
        fileName: true,
        fileSize: true,
        uploadedBy: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Erro ao buscar relatórios financeiros públicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Download público de relatório financeiro
router.get('/public/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await prisma.financialReport.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
    
    const fileStream = fs.createReadStream(report.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erro ao fazer download do relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar relatórios financeiros (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      prisma.financialReport.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.financialReport.count()
    ]);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar relatórios financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de relatório financeiro (admin)
router.post('/upload', authenticateToken, requireAdmin, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo PDF é obrigatório' });
    }

    if (!req.body.period) {
      return res.status(400).json({ error: 'Período de competência é obrigatório' });
    }

    // Verificar se já existe relatório para este período
    const existingReport = await prisma.financialReport.findFirst({
      where: { period: req.body.period }
    });

    if (existingReport) {
      // Remover arquivo que acabou de ser uploadado
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Já existe um relatório para este período. Exclua o relatório existente primeiro.' 
      });
    }

    const report = await prisma.financialReport.create({
      data: {
        period: req.body.period,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        uploadedBy: req.user.name
      }
    });

    res.status(201).json({
      message: 'Relatório financeiro enviado com sucesso',
      report
    });
  } catch (error) {
    console.error('Erro ao fazer upload do relatório:', error);
    
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

// Download de relatório financeiro (admin)
router.get('/download/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await prisma.financialReport.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
    
    const fileStream = fs.createReadStream(report.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erro ao fazer download do relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir relatório financeiro (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await prisma.financialReport.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Remover arquivo do sistema
    if (fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }

    // Remover registro do banco
    await prisma.financialReport.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Relatório excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;