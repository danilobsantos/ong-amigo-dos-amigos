import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  article = false
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://amigodosamigos.org';
  const siteName = 'ONG Amigo dos Amigos';
  const defaultTitle = 'ONG Amigo dos Amigos - Resgatando e Cuidando de Cães Abandonados';
  const defaultDescription = 'A ONG Amigo dos Amigos resgata, cuida e encontra lares amorosos para cães abandonados. Adote, doe ou seja voluntário. Juntos salvamos vidas!';
  const defaultImage = `${siteUrl}/images/og-image.jpg`;
  const defaultKeywords = 'ONG, cães, adoção, doação, voluntariado, animais abandonados, resgate, São Paulo, pets';

  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoUrl = url || siteUrl;
  const seoKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Título e descrição básicos */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* Meta tags do autor */}
      {author && <meta name="author" content={author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:site" content="@amigodosamigos" />
      
      {/* Meta tags específicas para artigos */}
      {article && (
        <>
          <meta property="article:author" content={author || siteName} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:section" content="Blog" />
          <meta property="article:tag" content={seoKeywords} />
        </>
      )}
      
      {/* Meta tags para dispositivos móveis */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#27ae60" />
      
      {/* Meta tags para PWA */}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          "name": siteName,
          "description": seoDescription,
          "url": siteUrl,
          "logo": `${siteUrl}/images/logo.png`,
          "image": seoImage,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua das Flores, 123",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "postalCode": "01234-567",
            "addressCountry": "BR"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-99999-9999",
            "contactType": "customer service",
            "email": "contato@amigodosamigos.org"
          },
          "sameAs": [
            "https://facebook.com/amigodosamigos",
            "https://instagram.com/amigodosamigos",
            "https://twitter.com/amigodosamigos"
          ],
          "foundingDate": "2019",
          "areaServed": {
            "@type": "Place",
            "name": "São Paulo, Brasil"
          },
          "knowsAbout": [
            "Resgate de animais",
            "Adoção responsável",
            "Cuidados veterinários",
            "Bem-estar animal"
          ]
        })}
      </script>
    </Helmet>
  );
};

// Componente específico para páginas de cães
export const DogSEO = ({ dog }) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://amigodosamigos.org';
  
  return (
    <SEO
      title={`${dog.name} - Cão para Adoção`}
      description={`Conheça ${dog.name}, ${dog.age}, ${dog.size}, ${dog.temperament}. ${dog.description || 'Um cão especial procurando um lar amoroso.'} Adote já!`}
      keywords={`${dog.name}, adoção, cão, ${dog.size}, ${dog.breed || 'SRD'}, ${dog.temperament}, pet, animal`}
      image={dog.images?.[0] || `${siteUrl}/images/default-dog.jpg`}
      url={`${siteUrl}/adocao/${dog.id}`}
      type="article"
    >
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": `Adoção do ${dog.name}`,
          "description": `${dog.name} é um cão ${dog.size.toLowerCase()} de ${dog.age}, com temperamento ${dog.temperament.toLowerCase()}. ${dog.description || 'Procura um lar amoroso.'}`,
          "image": dog.images?.[0] || `${siteUrl}/images/default-dog.jpg`,
          "brand": {
            "@type": "Organization",
            "name": "ONG Amigo dos Amigos"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL",
            "availability": dog.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "ONG Amigo dos Amigos"
            }
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Idade",
              "value": dog.age
            },
            {
              "@type": "PropertyValue",
              "name": "Porte",
              "value": dog.size
            },
            {
              "@type": "PropertyValue",
              "name": "Sexo",
              "value": dog.gender
            },
            {
              "@type": "PropertyValue",
              "name": "Temperamento",
              "value": dog.temperament
            }
          ]
        })}
      </script>
    </SEO>
  );
};

// Componente específico para posts do blog
export const BlogSEO = ({ post }) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://amigodosamigos.org';
  
  return (
    <SEO
      title={post.title}
      description={post.excerpt}
      keywords={`${post.category}, blog, ONG, animais, ${post.title}`}
      image={post.image || `${siteUrl}/images/blog-default.jpg`}
      url={`${siteUrl}/blog/${post.slug}`}
      type="article"
      article={true}
      author="ONG Amigo dos Amigos"
      publishedTime={post.publishedAt}
      modifiedTime={post.updatedAt}
    >
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.image || `${siteUrl}/images/blog-default.jpg`,
          "author": {
            "@type": "Organization",
            "name": "ONG Amigo dos Amigos"
          },
          "publisher": {
            "@type": "Organization",
            "name": "ONG Amigo dos Amigos",
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/images/logo.png`
            }
          },
          "datePublished": post.publishedAt,
          "dateModified": post.updatedAt || post.publishedAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${siteUrl}/blog/${post.slug}`
          }
        })}
      </script>
    </SEO>
  );
};

export default SEO;
