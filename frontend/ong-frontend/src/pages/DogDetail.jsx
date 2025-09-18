import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, Stethoscope, Calendar, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { dogsAPI, adoptionsAPI } from '../lib/api';

const DogDetail = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadDog();
  }, [id]);

  const loadDog = async () => {
    try {
      const response = await dogsAPI.getById(id);
      setDog(response.data);
    } catch (error) {
      console.error('Erro ao carregar cão:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await adoptionsAPI.create({
        ...data,
        dogId: parseInt(id)
      });
      setSubmitted(true);
      setShowForm(false);
      reset();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Cão não encontrado</h2>
          <Button asChild>
            <Link to="/adocao">Voltar para Adoção</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = dog.images || ['/api/placeholder/600/400'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-max py-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/adocao">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Adoção
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={dog.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${dog.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Cão */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{dog.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {dog.size}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {dog.gender}
                </Badge>
                {dog.breed && (
                  <Badge variant="secondary" className="text-sm">
                    {dog.breed}
                  </Badge>
                )}
                {dog.vaccinated && (
                  <Badge className="bg-green-500 text-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    Vacinado
                  </Badge>
                )}
                {dog.neutered && (
                  <Badge className="bg-blue-500 text-sm">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Castrado
                  </Badge>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Idade</Label>
                    <p className="text-lg">{dog.age}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Porte</Label>
                    <p className="text-lg">{dog.size}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Sexo</Label>
                    <p className="text-lg">{dog.gender}</p>
                  </div>
                  {dog.breed && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Raça</Label>
                      <p className="text-lg">{dog.breed}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{dog.temperament}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sobre {dog.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{dog.description}</p>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="space-y-4">
              {!submitted ? (
                <>
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    size="lg"
                    className="w-full btn-primary"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    {showForm ? 'Cancelar Solicitação' : 'Quero Adotar'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild variant="outline" size="lg">
                      <a href="https://wa.me/5511999999999?text=Olá! Tenho interesse no cão {dog.name}">
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/contato">
                        <Mail className="w-4 h-4 mr-2" />
                        Contato
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Solicitação Enviada!
                    </h3>
                    <p className="text-green-700">
                      Recebemos sua solicitação de adoção para {dog.name}. 
                      Entraremos em contato em breve para dar continuidade ao processo.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Formulário de Adoção */}
        {showForm && !submitted && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Formulário de Adoção - {dog.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Nome é obrigatório' })}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'E-mail inválido'
                        }
                      })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      {...register('phone', { required: 'Telefone é obrigatório' })}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Textarea
                    id="address"
                    {...register('address', { required: 'Endereço é obrigatório' })}
                    className={errors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="experience">Experiência com Animais *</Label>
                  <Textarea
                    id="experience"
                    {...register('experience', { required: 'Este campo é obrigatório' })}
                    className={errors.experience ? 'border-red-500' : ''}
                    placeholder="Conte sobre sua experiência com animais de estimação..."
                    rows={4}
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reason">Por que deseja adotar {dog.name}? *</Label>
                  <Textarea
                    id="reason"
                    {...register('reason', { required: 'Este campo é obrigatório' })}
                    className={errors.reason ? 'border-red-500' : ''}
                    placeholder="Conte-nos por que escolheu este cão e como pretende cuidar dele..."
                    rows={4}
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Solicitação'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DogDetail;
