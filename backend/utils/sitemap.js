const fs = require('fs').promises;
const path = require('path');

class SitemapGenerator {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'https://amigodosamigos.org';
    this.sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  }

  // Gerar sitemap completo
  async generateSitemap() {
    try {
      const { prisma } = require('../config/database');
      
      // URLs estáticas
      const staticUrls = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/sobre', priority: '0.8', changefreq: 'monthly' },
        { url: '/adocao', priority: '0.9', changefreq: 'daily' },
        { url: '/doacoes', priority: '0.9', changefreq: 'monthly' },
        { url: '/voluntariado', priority: '0.8', changefreq: 'monthly' },
        { url: '/blog', priority: '0.8', changefreq: 'daily' },
        { url: '/contato', priority: '0.7', changefreq: 'monthly' }
      ];

      // URLs dinâmicas - Cães
      const dogs = await prisma.dog.findMany({
        where: { available: true },
        select: { id: true, updatedAt: true }
      });

      const dogUrls = dogs.map(dog => ({
        url: `/adocao/${dog.id}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: dog.updatedAt.toISOString()
      }));

      // URLs dinâmicas - Posts do Blog
      const posts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, publishedAt: true }
      });

      const postUrls = posts.map(post => ({
        url: `/blog/${post.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: (post.updatedAt || post.publishedAt).toISOString()
      }));

      // Combinar todas as URLs
      const allUrls = [...staticUrls, ...dogUrls, ...postUrls];

      // Gerar XML do sitemap
      const sitemapXml = this.generateSitemapXml(allUrls);

      // Salvar arquivo
      await this.saveSitemap(sitemapXml);

      return {
        success: true,
        urlCount: allUrls.length,
        message: 'Sitemap gerado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao gerar sitemap:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar XML do sitemap
  generateSitemapXml(urls) {
    const urlElements = urls.map(urlData => {
      const { url, priority, changefreq, lastmod } = urlData;
      const fullUrl = `${this.baseUrl}${url}`;
      
      return `  <url>
    <loc>${fullUrl}</loc>
    ${priority ? `<priority>${priority}</priority>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  // Salvar sitemap
  async saveSitemap(xml) {
    try {
      // Criar diretório public se não existir
      const publicDir = path.dirname(this.sitemapPath);
      await fs.mkdir(publicDir, { recursive: true });
      
      // Salvar arquivo
      await fs.writeFile(this.sitemapPath, xml, 'utf8');
      
      console.log('Sitemap salvo em:', this.sitemapPath);
    } catch (error) {
      console.error('Erro ao salvar sitemap:', error);
      throw error;
    }
  }

  // Gerar robots.txt
  async generateRobotsTxt() {
    try {
      const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin area
Disallow: /admin/
Disallow: /api/

# Disallow temporary files
Disallow: /tmp/
Disallow: /*.tmp$

# Allow important pages
Allow: /
Allow: /sobre
Allow: /adocao
Allow: /doacoes
Allow: /voluntariado
Allow: /blog
Allow: /contato

# Crawl delay
Crawl-delay: 1`;

      const robotsPath = path.join(__dirname, '../public/robots.txt');
      await fs.writeFile(robotsPath, robotsContent, 'utf8');

      return {
        success: true,
        message: 'Robots.txt gerado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao gerar robots.txt:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar sitemap de imagens
  async generateImageSitemap() {
    try {
      const { prisma } = require('../config/database');
      
      // Buscar cães com imagens
      const dogs = await prisma.dog.findMany({
        where: { 
          available: true,
          images: { not: null }
        },
        select: { 
          id: true, 
          name: true, 
          images: true, 
          updatedAt: true 
        }
      });

      // Buscar posts com imagens
      const posts = await prisma.blogPost.findMany({
        where: { 
          published: true,
          image: { not: null }
        },
        select: { 
          slug: true, 
          title: true, 
          image: true, 
          updatedAt: true 
        }
      });

      const imageUrls = [];

      // Adicionar imagens dos cães
      dogs.forEach(dog => {
        if (dog.images && dog.images.length > 0) {
          dog.images.forEach(image => {
            imageUrls.push({
              loc: `${this.baseUrl}/adocao/${dog.id}`,
              image: {
                loc: image,
                title: `${dog.name} - Cão para adoção`,
                caption: `Conheça ${dog.name}, um cão especial procurando um lar amoroso.`
              }
            });
          });
        }
      });

      // Adicionar imagens dos posts
      posts.forEach(post => {
        if (post.image) {
          imageUrls.push({
            loc: `${this.baseUrl}/blog/${post.slug}`,
            image: {
              loc: post.image,
              title: post.title,
              caption: post.title
            }
          });
        }
      });

      const imageSitemapXml = this.generateImageSitemapXml(imageUrls);
      
      const imageSitemapPath = path.join(__dirname, '../public/sitemap-images.xml');
      await fs.writeFile(imageSitemapPath, imageSitemapXml, 'utf8');

      return {
        success: true,
        imageCount: imageUrls.length,
        message: 'Sitemap de imagens gerado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao gerar sitemap de imagens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar XML do sitemap de imagens
  generateImageSitemapXml(imageUrls) {
    const urlElements = imageUrls.map(urlData => {
      const { loc, image } = urlData;
      
      return `  <url>
    <loc>${loc}</loc>
    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:title>${this.escapeXml(image.title)}</image:title>
      <image:caption>${this.escapeXml(image.caption)}</image:caption>
    </image:image>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`;
  }

  // Escapar caracteres especiais XML
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Gerar sitemap index (para múltiplos sitemaps)
  async generateSitemapIndex() {
    try {
      const sitemaps = [
        {
          loc: `${this.baseUrl}/sitemap.xml`,
          lastmod: new Date().toISOString()
        },
        {
          loc: `${this.baseUrl}/sitemap-images.xml`,
          lastmod: new Date().toISOString()
        }
      ];

      const sitemapElements = sitemaps.map(sitemap => {
        return `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`;
      }).join('\n');

      const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;

      const sitemapIndexPath = path.join(__dirname, '../public/sitemap-index.xml');
      await fs.writeFile(sitemapIndexPath, sitemapIndexXml, 'utf8');

      return {
        success: true,
        message: 'Sitemap index gerado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao gerar sitemap index:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar todos os arquivos SEO
  async generateAllSeoFiles() {
    try {
      const results = await Promise.all([
        this.generateSitemap(),
        this.generateImageSitemap(),
        this.generateRobotsTxt(),
        this.generateSitemapIndex()
      ]);

      const success = results.every(result => result.success);

      return {
        success,
        results,
        message: success ? 'Todos os arquivos SEO gerados com sucesso' : 'Alguns arquivos falharam'
      };
    } catch (error) {
      console.error('Erro ao gerar arquivos SEO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SitemapGenerator();
