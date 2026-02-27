import React, { useState } from 'react';
import { ArrowLeft, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { blogAPI, uploadsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    published: false,
    featuredImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Título deve ter pelo menos 5 caracteres';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Título deve ter no máximo 200 caracteres';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Resumo é obrigatório';
    } else if (formData.excerpt.trim().length < 20) {
      newErrors.excerpt = 'Resumo deve ter pelo menos 20 caracteres';
    } else if (formData.excerpt.trim().length > 300) {
      newErrors.excerpt = 'Resumo deve ter no máximo 300 caracteres';
    }
    
    const plainText = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (plainText.length < 50) {
      newErrors.content = 'Conteúdo deve ter pelo menos 50 caracteres';
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        featuredImage: file
      }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // insertTextFormat removed — Quill WYSIWYG handles formatting

  const handleSubmit = async (publish = false) => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      let imageUrl = null;
      
      // Upload da imagem se existir
      if (formData.featuredImage) {
        const imageFormData = new FormData();
        imageFormData.append('images', formData.featuredImage);
        
        const uploadResponse = await uploadsAPI.uploadImages(imageFormData, 'blog');
        imageUrl = uploadResponse.data.urls[0];
      }
      
      const postData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        published: publish,
        image: imageUrl
      };
      
      console.log('Dados sendo enviados:', postData);
      
      await blogAPI.create(postData);
      navigate('/admin/blog');
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar post. Tente novamente.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/blog')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Criar Novo Post</h1>
            <p className="text-gray-600">Crie um novo post para o blog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título * (5-200 caracteres)</Label>
                  <Input
                    id="title"
                    placeholder="Digite o título do post"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">{formData.title.length}/200 caracteres</p>
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumo * (20-300 caracteres)</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Breve descrição do post (aparece na listagem)"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    className={errors.excerpt ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">{formData.excerpt.length}/300 caracteres</p>
                  {errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resgates">Resgates</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="campanhas">Campanhas</SelectItem>
                      <SelectItem value="transparencia">Transparência</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Editor de Conteúdo */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => handleInputChange('content', html)}
                    error={errors.content}
                    placeholder="Escreva o conteúdo do post aqui... (Mínimo 50 caracteres)"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload de Imagem */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem Destacada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, featuredImage: null }));
                          }}
                        >
                          Remover Imagem
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Clique para fazer upload ou arraste uma imagem
                        </p>
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Selecionar Imagem
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Publicação */}
            <Card>
              <CardHeader>
                <CardTitle>Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                  <Label htmlFor="published">Publicar imediatamente</Label>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Publicar Post'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                  >
                    Salvar como Rascunho
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreatePost;