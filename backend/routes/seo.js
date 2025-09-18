const express = require('express');
const router = express.Router();
const sitemapGenerator = require('../utils/sitemap');
const path = require('path');
const fs = require('fs').promises;

// Gerar sitemap
router.post('/generate-sitemap', async (req, res) => {
  try {
    const result = await sitemapGenerator.generateSitemap();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        urlCount: result.urlCount
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Gerar robots.txt
router.post('/generate-robots', async (req, res) => {
  try {
    const result = await sitemapGenerator.generateRobotsTxt();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao gerar robots.txt:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Gerar sitemap de imagens
router.post('/generate-image-sitemap', async (req, res) => {
  try {
    const result = await sitemapGenerator.generateImageSitemap();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        imageCount: result.imageCount
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao gerar sitemap de imagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Gerar todos os arquivos SEO
router.post('/generate-all', async (req, res) => {
  try {
    const result = await sitemapGenerator.generateAllSeoFiles();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        results: result.results
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        results: result.results
      });
    }
  } catch (error) {
    console.error('Erro ao gerar arquivos SEO:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Servir sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    const sitemap = await fs.readFile(sitemapPath, 'utf8');
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Erro ao servir sitemap:', error);
    res.status(404).json({ error: 'Sitemap não encontrado' });
  }
});

// Servir robots.txt
router.get('/robots.txt', async (req, res) => {
  try {
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    const robots = await fs.readFile(robotsPath, 'utf8');
    
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    console.error('Erro ao servir robots.txt:', error);
    res.status(404).json({ error: 'Robots.txt não encontrado' });
  }
});

// Servir sitemap de imagens
router.get('/sitemap-images.xml', async (req, res) => {
  try {
    const sitemapPath = path.join(__dirname, '../public/sitemap-images.xml');
    const sitemap = await fs.readFile(sitemapPath, 'utf8');
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Erro ao servir sitemap de imagens:', error);
    res.status(404).json({ error: 'Sitemap de imagens não encontrado' });
  }
});

// Servir sitemap index
router.get('/sitemap-index.xml', async (req, res) => {
  try {
    const sitemapPath = path.join(__dirname, '../public/sitemap-index.xml');
    const sitemap = await fs.readFile(sitemapPath, 'utf8');
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Erro ao servir sitemap index:', error);
    res.status(404).json({ error: 'Sitemap index não encontrado' });
  }
});

// Obter meta tags para uma URL específica
router.get('/meta-tags', async (req, res) => {
  try {
    const { url, type } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    const { prisma } = require('../config/database');
    let metaTags = {};

    // Meta tags baseadas no tipo de página
    switch (type) {
      case 'dog':
        const dogId = url.split('/').pop();
        const dog = await prisma.dog.findUnique({
          where: { id: parseInt(dogId) }
        });
        
        if (dog) {
          metaTags = {
            title: `${dog.name} - Cão para Adoção | ONG Amigo dos Amigos`,
            description: `Conheça ${dog.name}, ${dog.age}, ${dog.size}, ${dog.temperament}. ${dog.description || 'Um cão especial procurando um lar amoroso.'} Adote já!`,
            keywords: `${dog.name}, adoção, cão, ${dog.size}, ${dog.breed || 'SRD'}, ${dog.temperament}, pet, animal`,
            image: dog.images?.[0] || '/images/default-dog.jpg',
            type: 'article'
          };
        }
        break;
        
      case 'blog':
        const slug = url.split('/').pop();
        const post = await prisma.blogPost.findUnique({
          where: { slug }
        });
        
        if (post) {
          metaTags = {
            title: `${post.title} | Blog ONG Amigo dos Amigos`,
            description: post.excerpt,
            keywords: `${post.category}, blog, ONG, animais, ${post.title}`,
            image: post.image || '/images/blog-default.jpg',
            type: 'article',
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt
          };
        }
        break;
        
      default:
        // Meta tags padrão para páginas estáticas
        const defaultMetaTags = {
          '/': {
            title: 'ONG Amigo dos Amigos - Resgatando e Cuidando de Cães Abandonados',
            description: 'A ONG Amigo dos Amigos resgata, cuida e encontra lares amorosos para cães abandonados. Adote, doe ou seja voluntário. Juntos salvamos vidas!',
            keywords: 'ONG, cães, adoção, doação, voluntariado, animais abandonados, resgate, São Paulo, pets'
          },
          '/sobre': {
            title: 'Sobre Nós | ONG Amigo dos Amigos',
            description: 'Conheça nossa história, nossa equipe e nosso compromisso com o bem-estar animal. Saiba mais sobre a ONG Amigo dos Amigos.',
            keywords: 'sobre, história, equipe, missão, valores, ONG, animais'
          },
          '/adocao': {
            title: 'Adoção de Cães | ONG Amigo dos Amigos',
            description: 'Encontre seu novo melhor amigo! Veja todos os cães disponíveis para adoção responsável na ONG Amigo dos Amigos.',
            keywords: 'adoção, cães, pets, animais, adoção responsável, cachorro'
          },
          '/doacoes': {
            title: 'Faça uma Doação | ONG Amigo dos Amigos',
            description: 'Sua doação salva vidas! Contribua com a ONG Amigo dos Amigos e ajude no resgate e cuidado de cães abandonados.',
            keywords: 'doação, contribuição, ajuda, PIX, cartão, ONG, animais'
          },
          '/voluntariado': {
            title: 'Seja Voluntário | ONG Amigo dos Amigos',
            description: 'Faça a diferença na vida dos animais! Seja voluntário na ONG Amigo dos Amigos e ajude a salvar vidas.',
            keywords: 'voluntário, voluntariado, ajuda, trabalho voluntário, ONG, animais'
          },
          '/contato': {
            title: 'Contato | ONG Amigo dos Amigos',
            description: 'Entre em contato conosco! Tire suas dúvidas, faça denúncias ou saiba como contribuir com nosso trabalho.',
            keywords: 'contato, telefone, email, endereço, WhatsApp, ONG'
          }
        };
        
        metaTags = defaultMetaTags[url] || defaultMetaTags['/'];
    }

    res.json({
      success: true,
      metaTags
    });
  } catch (error) {
    console.error('Erro ao obter meta tags:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar status dos arquivos SEO
router.get('/status', async (req, res) => {
  try {
    const files = [
      'sitemap.xml',
      'robots.txt',
      'sitemap-images.xml',
      'sitemap-index.xml'
    ];

    const status = {};

    for (const file of files) {
      try {
        const filePath = path.join(__dirname, '../public', file);
        const stats = await fs.stat(filePath);
        status[file] = {
          exists: true,
          size: stats.size,
          lastModified: stats.mtime
        };
      } catch (error) {
        status[file] = {
          exists: false,
          error: 'Arquivo não encontrado'
        };
      }
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Erro ao verificar status SEO:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
