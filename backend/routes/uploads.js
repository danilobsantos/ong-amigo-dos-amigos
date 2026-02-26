const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const router = express.Router();

// Default backend upload folder
const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Also ensure frontend public images/dogs exists so images are served as static assets
const FRONTEND_DOGS_PATH = path.join(__dirname, '..', '..', 'frontend', 'ong-frontend', 'public', 'images', 'dogs');
if (!fs.existsSync(FRONTEND_DOGS_PATH)) {
  fs.mkdirSync(FRONTEND_DOGS_PATH, { recursive: true });
}

// Ensure frontend public images/ exists for logos
const FRONTEND_IMAGES_PATH = path.join(__dirname, '..', '..', 'frontend', 'ong-frontend', 'public', 'images');
if (!fs.existsSync(FRONTEND_IMAGES_PATH)) {
  fs.mkdirSync(FRONTEND_IMAGES_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type; // 'pets', 'blog', or undefined
    let targetPath = UPLOAD_PATH;
    
    if (type === 'pets' || type === 'blog') {
      targetPath = path.join(UPLOAD_PATH, type);
    }
    
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage });

/**
 * @api {post} /api/uploads/ Multi-upload
 * @apiParam {String} [type] Subfolder type ('pets' or 'blog')
 */
router.post('/', upload.array('images', 12), (req, res) => {
  try {
    const files = req.files || [];
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
    const type = req.query.type;

    // Return URLs containing the subfolder path if type is provided
    const urls = files.map(f => {
      const folderPath = (type === 'pets' || type === 'blog') ? `${type}/` : '';
      return `${base}/uploads/${folderPath}${f.filename}`;
    });

    res.json({ urls });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// Upload logo (admin) - single image with specific size requirements
router.post('/logo', (req, res) => {
  const uploadMiddleware = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos'), false);
      }
    }
  }).single('logo');

  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Erro no upload da logo:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      const type = req.query.type;
      
      const folderPath = (type === 'pets' || type === 'blog') ? `${type}/` : '';
      const url = `${base}/uploads/${folderPath}${req.file.filename}`;
      
      res.json({ url, filename: req.file.filename });
    } catch (err) {
      console.error('Erro ao processar upload da logo:', err);
      res.status(500).json({ error: 'Erro ao processar upload' });
    }
  });
});

module.exports = router;
