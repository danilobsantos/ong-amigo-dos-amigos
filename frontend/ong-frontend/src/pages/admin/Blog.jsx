import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { blogAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await blogAPI.getAllPosts();
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = (post) => {
    if (post.published && post.slug) {
      // Abre o post publicado em nova aba
      window.open(`/blog/${post.slug}`, '_blank');
    } else {
      // Para rascunhos, navega para página de preview
      navigate(`/admin/blog/preview/${post.id}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await blogAPI.delete(id);
        loadPosts();
      } catch (error) {
        console.error('Erro ao excluir post:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryLabel = (category) => {
    const categories = {
      resgates: 'Resgates',
      eventos: 'Eventos',
      campanhas: 'Campanhas',
      transparencia: 'Transparência'
    };
    return categories[category] || category;
  };

  const getFilteredPosts = () => {
    if (filter === 'published') {
      return posts.filter(post => post.published);
    }
    if (filter === 'draft') {
      return posts.filter(post => !post.published);
    }
    return posts; // 'all'
  };

  const filteredPosts = getFilteredPosts();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Blog</h1>
            <p className="text-gray-600">Crie e gerencie posts do blog</p>
          </div>
          <Button 
            className="btn-primary"
            onClick={() => navigate('/admin/blog/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Posts do Blog ({filteredPosts.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {filter === 'published' && 'Nenhum post publicado encontrado.'}
                  {filter === 'draft' && 'Nenhum rascunho encontrado.'}
                  {filter === 'all' && 'Nenhum post encontrado.'}
                </p>
                {filter !== 'all' && (
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setFilter('all')}
                  >
                    Ver todos os posts
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge variant={post.published ? 'default' : 'secondary'}>
                            {post.published ? 'Publicado' : 'Rascunho'}
                          </Badge>
                          <Badge variant="outline">
                            {getCategoryLabel(post.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                        <p className="text-xs text-gray-500">
                          {post.publishedAt ? `Publicado em ${formatDate(post.publishedAt)}` : `Criado em ${formatDate(post.createdAt)}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewPost(post)}
                              >
                                {post.published ? <ExternalLink className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {post.published 
                                  ? 'Visualizar post no site público' 
                                  : 'Visualizar/editar rascunho'
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
