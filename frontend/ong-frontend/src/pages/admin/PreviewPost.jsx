import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { blogAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const PreviewPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getPostById(id);
      setPost(response.data.post || response.data);
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      alert('Erro ao carregar post. Voltando para a lista.');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const renderContent = (content) => {
    // Converter markdown básico para HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1">$1</ul>')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Post não encontrado.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/blog')}
            className="mt-4"
          >
            Voltar para lista
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/blog')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Preview do Post</h1>
              <p className="text-gray-600">Visualização como aparecerá no site</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Post
          </Button>
        </div>

        {/* Alert para rascunhos */}
        {!post.published && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este post é um <strong>rascunho</strong> e não está visível publicamente. 
              Para torná-lo visível, edite o post e marque como "Publicar".
            </AlertDescription>
          </Alert>
        )}

        {/* Post Content */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              {/* Metadados */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant={post.published ? 'default' : 'secondary'}>
                  {post.published ? 'Publicado' : 'Rascunho'}
                </Badge>
                <Badge variant="outline">
                  {getCategoryLabel(post.category)}
                </Badge>
                <span>•</span>
                <span>
                  {post.publishedAt 
                    ? `Publicado em ${formatDate(post.publishedAt)}` 
                    : `Criado em ${formatDate(post.createdAt)}`
                  }
                </span>
              </div>

              {/* Título */}
              <CardTitle className="text-3xl font-bold leading-tight">
                {post.title}
              </CardTitle>

              {/* Resumo */}
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Imagem destacada */}
              {post.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Conteúdo formatado */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: renderContent(post.content || '') 
              }}
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center gap-4 pt-6 border-t">
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/blog')}
          >
            Voltar para Lista
          </Button>
          <Button 
            onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Post
          </Button>
          {post.published && post.slug && (
            <Button 
              variant="outline"
              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
            >
              <ArrowLeft className="w-4 h-4 mr-2 transform rotate-45" />
              Ver no Site Público
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PreviewPost;