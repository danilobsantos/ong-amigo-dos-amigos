import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blogAPI } from '../lib/api';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const response = await blogAPI.getPost(slug);
      setPost(response.data);
      
      // Carregar posts relacionados da mesma categoria
      if (response.data.category) {
        const relatedResponse = await blogAPI.getPosts({
          category: response.data.category,
          limit: 3
        });
        setRelatedPosts(relatedResponse.data.posts?.filter(p => p.slug !== slug) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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

  const getCategoryColor = (category) => {
    const colors = {
      resgates: 'bg-red-100 text-red-800',
      eventos: 'bg-blue-100 text-blue-800',
      campanhas: 'bg-green-100 text-green-800',
      transparencia: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Post não encontrado</h2>
          <Button asChild>
            <Link to="/blog">Voltar para o Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-max py-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Blog
            </Link>
          </Button>
        </div>
      </div>

      <article className="container-max section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header do Post */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge className={getCategoryColor(post.category)}>
                {getCategoryLabel(post.category)}
              </Badge>
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(post.publishedAt)}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Imagem Principal */}
          {post.image && (
            <div className="mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Conteúdo */}
          <div className="prose prose-lg max-w-none mb-8">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
            />
          </div>

          {/* Compartilhamento */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Compartilhe este post:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="text-blue-400 hover:bg-blue-50"
                  >
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="text-blue-700 hover:bg-blue-50"
                  >
                    <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Relacionados */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Posts Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="card-hover">
                    <CardContent className="p-0">
                      {relatedPost.image && (
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <Badge className={getCategoryColor(relatedPost.category)} size="sm">
                          {getCategoryLabel(relatedPost.category)}
                        </Badge>
                        <h3 className="font-semibold mt-2 mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/blog/${relatedPost.slug}`}>
                            Ler Mais
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {/* Call to Action */}
      <section className="section-padding bg-primary text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold mb-4">Gostou do que leu?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Faça parte da nossa missão de transformar vidas. 
            Adote, doe ou seja voluntário na ONG Amigo dos Amigos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/adocao">Adotar um Cão</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/doacoes">Fazer Doação</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/voluntariado">Ser Voluntário</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
