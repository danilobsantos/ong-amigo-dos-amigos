import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { blogAPI } from '../lib/api';

// On-brand category tokens — no hardcoded colors
const categoryTokens = {
  resgates:      { bg: 'bg-secondary/15 text-secondary',   label: 'Resgates' },
  eventos:       { bg: 'bg-primary/10 text-primary',       label: 'Eventos' },
  campanhas:     { bg: 'bg-primary/20 text-primary',       label: 'Campanhas' },
  transparencia: { bg: 'bg-muted text-foreground/60',      label: 'Transparência' },
};
const getCategoryToken = (cat) => categoryTokens[cat] || { bg: 'bg-muted text-foreground/60', label: cat };

const categories = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'resgates', label: 'Resgates' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'campanhas', label: 'Campanhas' },
  { value: 'transparencia', label: 'Transparência' },
];

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 0 });

  const loadPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach(key => { if (params[key] === '' || params[key] === 'all') delete params[key]; });
      const response = await blogAPI.getPosts(params);
      setPosts(response.data.posts || []);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: 'all', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-max text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
            📝 Blog
          </span>
          <h1 className="heading-hero text-white mb-6">Histórias que Transformam</h1>
          <p className="body-large text-white/80 max-w-2xl mx-auto">
            Acompanhe nossas histórias, novidades e campanhas. Fique por dentro de tudo que acontece na ONG Amigo dos Amigos.
          </p>
        </div>
      </section>

      <div className="container-max section-padding">

        {/* ── Filter bar ── */}
        <Card className="border-0 bg-white shadow-soft rounded-[2rem] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <span className="font-black text-foreground">Filtrar Posts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 w-4 h-4" />
                <Input
                  placeholder="Buscar posts..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 font-bold rounded-2xl border-2 border-transparent bg-muted/30 focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                <SelectTrigger className="h-12 rounded-2xl border-2 border-transparent bg-muted/30 hover:bg-white hover:border-primary/20 transition-all font-bold">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={clearFilters} variant="outline" className="rounded-full border-2 border-border font-black hover:border-primary hover:text-primary transition-all">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Result count ── */}
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 body-small text-primary font-black">
            {pagination.total} posts
          </span>
          {(filters.category !== 'all' || filters.search) && (
            <span className="body-small text-foreground/50">com filtros aplicados</span>
          )}
        </div>

        {/* ── Post Grid ── */}
        {loading ? (
          // Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] shadow-soft overflow-hidden animate-pulse">
                <div className="bg-muted h-48" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded-full w-1/3" />
                  <div className="h-5 bg-muted rounded-full" />
                  <div className="h-5 bg-muted rounded-full w-4/5" />
                  <div className="h-4 bg-muted rounded-full" />
                  <div className="h-4 bg-muted rounded-full w-2/3" />
                  <div className="h-10 bg-muted rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="heading-card mb-3">Nenhum post encontrado</h3>
            <p className="body-base text-foreground/50 mb-8 max-w-sm mx-auto">
              Tente ajustar os filtros ou volte mais tarde para ver novos posts.
            </p>
            <Button onClick={clearFilters} className="btn-premium-md btn-primary">
              Limpar Filtros
            </Button>
          </div>
        ) : (
          // Posts
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const cat = getCategoryToken(post.category);
              return (
                <Card key={post.id} className="border-0 bg-white shadow-soft rounded-[2rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <CardContent className="p-0 flex flex-col flex-1">
                    {post.image && (
                      <div className="overflow-hidden h-48">
                        <img src={post.image} alt={post.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${cat.bg} font-black text-xs rounded-full px-3 border-0`}>
                          {cat.label}
                        </Badge>
                        <div className="flex items-center body-small text-foreground/40 gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.publishedAt)}
                        </div>
                      </div>
                      <h3 className="font-black text-lg text-foreground mb-3 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="body-small text-foreground/60 mb-5 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <Button asChild className="btn-premium-md btn-primary w-full">
                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-2">
                          Ler Mais <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-premium-md rounded-full border-2 disabled:opacity-40"
            >
              Anterior
            </Button>
            <div className="flex gap-1">
              {[...Array(pagination.pages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === pagination.page;
                const show = page === 1 || page === pagination.pages || (page >= pagination.page - 1 && page <= pagination.page + 1);
                if (!show) {
                  if (page === pagination.page - 2 || page === pagination.page + 2) return <span key={page} className="px-2 body-small text-foreground/40">...</span>;
                  return null;
                }
                return (
                  <Button
                    key={page}
                    onClick={() => setPagination(p => ({ ...p, page }))}
                    className={`w-10 h-10 rounded-full text-sm font-black ${isCurrent ? 'btn-primary' : 'border-2 border-border bg-white text-foreground hover:border-primary hover:text-primary'}`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="btn-premium-md rounded-full border-2 disabled:opacity-40"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* ── CTA Section ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-max text-center relative z-10">
          <h2 className="heading-section text-white mb-4">Não Perca Nenhuma Novidade</h2>
          <p className="body-large text-white/80 mb-10 max-w-2xl mx-auto">
            Siga-nos nas redes sociais e acompanhe todas as nossas histórias e campanhas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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

export default Blog;
