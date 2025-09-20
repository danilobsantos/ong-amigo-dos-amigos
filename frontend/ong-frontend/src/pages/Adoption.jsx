import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { dogsAPI } from '../lib/api';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary text-white section-padding">
        <div className="container-max text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Adoção Responsável</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Encontre seu novo melhor amigo. Todos os nossos cães são vacinados, 
            castrados e prontos para uma nova vida cheia de amor.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="section-padding">
        <div className="container-max">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Filtrar Cães</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="w-full">
                <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Porte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os portes</SelectItem>
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="médio">Médio</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full">
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="fêmea">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full">
                <Button variant="outline" onClick={clearFilters} className="w-full h-10">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <p className="text-gray-600">
              {pagination.total} cães encontrados
              {(filters.size || filters.gender || filters.search) && (
                <span className="ml-2">
                  com os filtros aplicados
                </span>
              )}
            </p>
          </div>

          {/* Grid de Cães */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum cão encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros ou volte mais tarde para ver novos cães disponíveis.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dogs.map((dog) => (
                <Card key={dog.id} className="card-hover overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={dog.images?.[0] || '/api/placeholder/400/300'}
                        alt={dog.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90">
                          {dog.size}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        {dog.vaccinated && (
                          <Badge className="bg-green-500 text-xs">Vacinado</Badge>
                        )}
                        {dog.neutered && (
                          <Badge className="bg-blue-500 text-xs">Castrado</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{dog.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{dog.age}</span>
                        <span>•</span>
                        <span>{dog.gender}</span>
                        {dog.breed && (
                          <>
                            <span>•</span>
                            <span>{dog.breed}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {dog.temperament}
                      </p>
                      
                      <Button asChild className="w-full">
                        <Link to={`/adocao/${dog.id}`}>
                          <Heart className="w-4 h-4 mr-2" />
                          Quero Conhecer
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              
              <div className="flex gap-1">
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === pagination.page;
                  const showPage = 
                    page === 1 || 
                    page === pagination.pages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1);
                  
                  if (!showPage) {
                    if (page === pagination.page - 2 || page === pagination.page + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
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
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-primary text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold mb-4">Não Encontrou o Cão Ideal?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Novos cães chegam regularmente. Deixe seu contato e te avisaremos 
            quando tivermos um cão que combine com o que você procura.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/contato">
              <MapPin className="w-5 h-5 mr-2" />
              Entrar em Contato
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Adoption;
