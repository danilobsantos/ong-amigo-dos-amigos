import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blogAPI } from '../lib/api';

const categoryTokens = {
  resgates:      { bg: 'bg-secondary/15 text-secondary',   label: 'Resgates' },
  eventos:       { bg: 'bg-primary/10 text-primary',       label: 'Eventos' },
  campanhas:     { bg: 'bg-primary/20 text-primary',       label: 'Campanhas' },
  transparencia: { bg: 'bg-muted text-foreground/60',      label: 'Transparência' },
};
const getCategoryToken = (cat) => categoryTokens[cat] || { bg: 'bg-muted text-foreground/60', label: cat };

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => { loadPost(); }, [slug]);

  const loadPost = async () => {
    try {
      const response = await blogAPI.getPost(slug);
      setPost(response.data);
      if (response.data.category) {
        const rel = await blogAPI.getPosts({ category: response.data.category, limit: 3 });
        setRelatedPosts(rel.data.posts?.filter(p => p.slug !== slug) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '';
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="heading-card mb-4">Post não encontrado</h2>
          <Button asChild className="btn-premium-md btn-primary">
            <Link to="/blog">Voltar para o Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const cat = getCategoryToken(post.category);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-border/30">
        <div className="container-max py-4">
          <Button asChild variant="ghost" size="sm" className="text-foreground/60 hover:text-primary rounded-full gap-2 font-black">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Article ── */}
      <article className="container-max section-padding">
        <div className="max-w-3xl mx-auto">

          {/* Post header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Badge className={`${cat.bg} font-black text-xs rounded-full px-3 border-0`}>
                {cat.label}
              </Badge>
              <div className="flex items-center body-small text-foreground/40 gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </div>
            </div>
            <h1 className="heading-hero !text-4xl text-foreground mb-5 leading-tight">
              {post.title}
            </h1>
            <p className="body-large text-foreground/60 leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Cover image */}
          {post.image && (
            <div className="mb-10 rounded-[2rem] overflow-hidden shadow-soft">
              <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-10">
            <div
              className="text-foreground/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Share card */}
          <Card className="border-0 bg-white shadow-soft rounded-[2rem] mb-12">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <span className="font-black text-foreground">Compartilhe este post:</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { href: shareLinks.facebook, icon: <Facebook className="w-4 h-4" />, label: 'Facebook' },
                    { href: shareLinks.twitter, icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
                    { href: shareLinks.linkedin, icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
                  ].map(({ href, icon, label }) => (
                    <Button key={label} asChild size="sm" variant="outline" className="rounded-full border-2 border-border hover:border-primary hover:text-primary transition-all w-9 h-9 p-0">
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                        {icon}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="heading-card mb-6">Posts Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((rel) => {
                  const relCat = getCategoryToken(rel.category);
                  return (
                    <Card key={rel.id} className="border-0 bg-white shadow-soft rounded-[2rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="p-0">
                        {rel.image && (
                          <div className="overflow-hidden h-32">
                            <img src={rel.image} alt={rel.title} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-4">
                          <Badge className={`${relCat.bg} font-black text-xs rounded-full px-3 border-0 mb-3`}>
                            {relCat.label}
                          </Badge>
                          <h3 className="font-black text-sm text-foreground mb-2 line-clamp-2 leading-snug">
                            {rel.title}
                          </h3>
                          <p className="body-small text-foreground/50 mb-4 line-clamp-2">{rel.excerpt}</p>
                          <Button asChild className="btn-premium-md btn-primary w-full text-sm">
                            <Link to={`/blog/${rel.slug}`}>Ler Mais</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </article>

      {/* ── CTA Section ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-max text-center relative z-10">
          <h2 className="heading-section text-white mb-4">Gostou do que leu?</h2>
          <p className="body-large text-white/80 mb-10 max-w-2xl mx-auto">
            Faça parte da nossa missão de transformar vidas. Adote, doe ou seja voluntário na ONG Amigo dos Amigos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="btn-premium-hero bg-white text-primary hover:bg-white/90 font-black">
              <Link to="/adocao">Adotar um Pet</Link>
            </Button>
            <Button asChild className="btn-premium-hero bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 font-black backdrop-blur-sm">
              <Link to="/voluntariado">Ser Voluntário</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
