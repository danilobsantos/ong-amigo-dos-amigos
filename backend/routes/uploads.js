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

module.exports = router;
