import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { dogsAPI } from '../lib/api';
import PetCard from '../components/PetCard';

const Adoption = () => {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    size: 'all',
    gender: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const loadDogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove filtros vazios e sentinela 'all'
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') delete params[key];
      });

      const response = await dogsAPI.getAll(params);
      setDogs(response.data.dogs || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Erro ao carregar cães:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadDogs();
  }, [loadDogs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ size: '', gender: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      {/* ── Hero Section ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container-max text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
            📖 Encontre sua história
          </span>
          <h1 className="heading-hero text-white mb-6">
            Amigos esperando por você.
          </h1>
          <p className="body-large text-white/80 max-w-2xl mx-auto">
            Cada um desses pacotinhos de amor tem uma história única. Qual delas você quer continuar escrevendo?
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="pb-12">
        <div className="container-max px-4">
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-soft p-8 md:p-10 border border-white/60">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Encontre seu par ideal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative w-full group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5 transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Nome do amiguinho..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-14 w-full rounded-full border-2 border-transparent bg-muted/50 focus:bg-white focus:border-primary/20 transition-all font-bold text-base"
                />
              </div>
              
              <div className="w-full">
                <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                  <SelectTrigger className="w-full h-16 rounded-full border-2 border-transparent bg-muted/50 hover:bg-white hover:border-primary/20 transition-all font-bold text-base px-6">
                    <SelectValue placeholder="Porte" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-2 border-primary/5 shadow-2xl">
                    <SelectItem value="all" className="font-bold py-3">Todos os portes</SelectItem>
                    <SelectItem value="pequeno" className="font-bold py-3 uppercase text-xs">Pequeno 🐾</SelectItem>
                    <SelectItem value="médio" className="font-bold py-3 uppercase text-xs">Médio 🐕</SelectItem>
                    <SelectItem value="grande" className="font-bold py-3 uppercase text-xs">Grande 🐩</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full">
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger className="w-full h-16 rounded-full border-2 border-transparent bg-muted/50 hover:bg-white hover:border-primary/20 transition-all font-bold text-base px-6">
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-2 border-primary/5 shadow-2xl">
                    <SelectItem value="all" className="font-bold py-3">Todos</SelectItem>
                    <SelectItem value="macho" className="font-bold py-3 uppercase text-xs">Macho</SelectItem>
                    <SelectItem value="fêmea" className="font-bold py-3 uppercase text-xs">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full">
                <Button 
                  variant="default" 
                  onClick={clearFilters} 
                  className="w-full rounded-full font-black text-white hover:text-primary hover:bg-primary/5 transition-all text-base"
                >
                  Limpar tudo
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <p className="body-small text-foreground/60">
              <span className="font-black text-foreground/80">{pagination.total}</span> pets encontrados
              {(filters.size !== 'all' || filters.gender !== 'all' || filters.search) && (
                <span className="ml-2 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black">
                  com filtros ativos
                </span>
              )}
            </p>
          </div>

          {/* Grid de Cães */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] shadow-soft p-6 animate-pulse border border-border">
                  <div className="bg-muted h-64 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-muted rounded-full mb-3 w-3/4"></div>
                  <div className="h-4 bg-muted rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-20 px-4 bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-border/50">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Heart className="w-10 h-10 text-foreground/20" />
              </div>
              <h3 className="heading-card mb-4">
                Puxa, ainda não encontramos...
              </h3>
              <p className="body-base text-foreground/50 mb-10 max-w-md mx-auto">
                Tente ajustar os filtros ou volte mais tarde. Novos amiguinhos chegam todos os dias!
              </p>
              <Button onClick={clearFilters} className="btn-premium-md btn-primary border-2">
                Recomeçar busca
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {dogs.map((dog) => (
                <PetCard key={dog.id} dog={dog} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-premium-md border-2 disabled:opacity-40"
              >
                ← Anterior
              </Button>
              
              <div className="flex gap-2">
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === pagination.page;
                  const showPage = 
                    page === 1 || 
                    page === pagination.pages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1);
                  
                  if (!showPage) {
                    if (page === pagination.page - 2 || page === pagination.page + 2) {
                      return <span key={page} className="px-2 self-center text-foreground/40 font-black">···</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={isCurrentPage
                        ? 'btn-premium-md btn-accent'
                        : 'btn-premium-md bg-white border-2 border-border/50 text-foreground/70 hover:border-primary/30 hover:text-primary'
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-premium-md border-2 disabled:opacity-40"
              >
                Próxima →
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

        <div className="container-max text-center relative z-10">
          <h2 className="heading-section text-white mb-6">Não Encontrou o Amigo Ideal?</h2>
          <p className="body-large text-white/90 mb-12 max-w-2xl mx-auto">
            Novos amiguinhos chegam regularmente. Entre em contato e te avisaremos
            quando tivermos um que combine com o que você procura.
          </p>
          <Button asChild className="btn-premium-hero bg-white text-primary hover:bg-white/90">
            <Link to="/contato">
              <MapPin className="w-5 h-5 mr-3" />
              Entrar em Contato
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Adoption;
