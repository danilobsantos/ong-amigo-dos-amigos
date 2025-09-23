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
  destination: (req, file, cb) => cb(null, UPLOAD_PATH),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage });

// Upload multiple images (admin)
router.post('/', upload.array('images', 12), (req, res) => {
  try {
    const files = req.files || [];
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;

    // Copy each file to frontend public images/dogs folder (so frontend can serve it as /images/dogs/...)
    files.forEach(f => {
      try {
        const src = path.join(UPLOAD_PATH, f.filename);
        const dest = path.join(FRONTEND_DOGS_PATH, f.filename);
        fs.copyFileSync(src, dest);
      } catch (copyErr) {
        console.warn('Não foi possível copiar para pasta frontend:', copyErr.message);
      }
    });

    // Prefer returning URLs under /uploads (backend) for compatibility, but also provide /images/dogs paths
    const urls = files.map(f => `${base}/uploads/${f.filename}`);
    res.json({ urls });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// Upload logo (admin) - single image with specific size requirements
router.post('/logo', (req, res) => {
  const upload = multer({
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

  upload(req, res, (err) => {
    if (err) {
      console.error('Erro no upload da logo:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      
      // Copy file to frontend public images folder (so frontend can serve it as /images/...)
      try {
        const src = path.join(UPLOAD_PATH, req.file.filename);
        const dest = path.join(FRONTEND_IMAGES_PATH, req.file.filename);
        fs.copyFileSync(src, dest);
      } catch (copyErr) {
        console.warn('Não foi possível copiar para pasta frontend:', copyErr.message);
      }

      // Return URL under /uploads (backend) for compatibility
      const url = `${base}/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename });
    } catch (err) {
      console.error('Erro ao processar upload da logo:', err);
      res.status(500).json({ error: 'Erro ao processar upload' });
    }
  });
});

module.exports = router;
