import React, { useState } from 'react';
import { ArrowLeft, Upload, Image, Bold, Italic, Link, List, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { blogAPI, uploadsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
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
    
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (formData.content.trim().length < 50) {
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

  const insertTextFormat = (format) => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'texto em negrito'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'texto em itálico'}*`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'texto do link'}](URL)`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'item da lista'}\n`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText || 'citação'}\n`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    handleInputChange('content', newContent);
    
    // Focar de volta no textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length, 
        start + formattedText.length
      );
    }, 0);
  };

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
                {/* Barra de Ferramentas */}
                <div className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertTextFormat('bold')}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertTextFormat('italic')}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertTextFormat('link')}
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertTextFormat('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertTextFormat('quote')}
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Textarea
                    id="content-textarea"
                    placeholder="Escreva o conteúdo do post aqui... Use as ferramentas acima para formatação. (Mínimo 50 caracteres)"
                    rows={15}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className={`font-mono ${errors.content ? 'border-red-500' : ''}`}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">{formData.content.length} caracteres (mínimo 50)</p>
                    <p className="text-sm text-gray-500">
                      Dica: Selecione texto e use as ferramentas de formatação acima
                    </p>
                  </div>
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