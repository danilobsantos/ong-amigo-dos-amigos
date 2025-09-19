import React, { useState } from 'react';
import { Users, Heart, Clock, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { volunteersAPI } from '../lib/api';

const Volunteer = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const volunteerAreas = [
    { id: 'resgate', label: 'Resgate de Animais', description: 'Participar de resgates de emergência' },
    { id: 'cuidados', label: 'Cuidados Diários', description: 'Alimentação, limpeza e cuidados básicos' },
    { id: 'transporte', label: 'Transporte', description: 'Levar animais ao veterinário ou eventos' },
    { id: 'eventos', label: 'Eventos e Campanhas', description: 'Organizar e participar de eventos' },
    { id: 'adocao', label: 'Processo de Adoção', description: 'Auxiliar no processo de adoção' },
    { id: 'administrativo', label: 'Apoio Administrativo', description: 'Tarefas administrativas e documentação' },
    { id: 'veterinario', label: 'Cuidados Veterinários', description: 'Apoio médico veterinário' },
    { id: 'marketing', label: 'Marketing e Comunicação', description: 'Redes sociais e divulgação' }
  ];

  const benefits = [
    'Certificado de horas de voluntariado',
    'Treinamento especializado',
    'Networking com outros voluntários',
    'Experiência em proteção animal',
    'Satisfação pessoal de ajudar',
    'Flexibilidade de horários'
  ];

  const requirements = [
    'Ser maior de 16 anos (menores com autorização)',
    'Disponibilidade mínima de 4 horas por semana',
    'Amor e respeito pelos animais',
    'Comprometimento e responsabilidade',
    'Disponibilidade para treinamento inicial'
  ];

  const handleAreaChange = (areaId, checked) => {
    if (checked) {
      setSelectedAreas([...selectedAreas, areaId]);
    } else {
      setSelectedAreas(selectedAreas.filter(id => id !== areaId));
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      if (selectedAreas.length === 0) {
        alert('Por favor, selecione pelo menos uma área de interesse');
        return;
      }

      const volunteerData = {
        ...data,
        areas: selectedAreas
      };

      await volunteersAPI.create(volunteerData);
      setSubmitted(true);
      reset();
      setSelectedAreas([]);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro Realizado!
            </h2>
            <p className="text-gray-600 mb-6">
              Obrigado pelo seu interesse em ser voluntário! Entraremos em contato 
              em breve para dar continuidade ao processo.
            </p>
            <Button 
              onClick={() => setSubmitted(false)} 
              className="w-full"
            >
              Fazer Novo Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary text-white section-padding">
        <div className="container-max text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Seja um Voluntário</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Junte-se à nossa equipe e faça a diferença na vida de cães e gatos que precisam de amor e cuidado. 
            Sua ajuda é fundamental para continuarmos salvando vidas.
          </p>
        </div>
      </section>

      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Cadastro de Voluntário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Informações Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Disponibilidade */}
                  <div>
                    <Label htmlFor="availability">Disponibilidade *</Label>
                    <Textarea
                      id="availability"
                      {...register('availability', { required: 'Disponibilidade é obrigatória' })}
                      className={errors.availability ? 'border-red-500' : ''}
                      placeholder="Descreva sua disponibilidade (dias da semana, horários, frequência...)"
                      rows={3}
                    />
                    {errors.availability && (
                      <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>
                    )}
                  </div>

                  {/* Áreas de Interesse */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Áreas de Interesse * (selecione pelo menos uma)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {volunteerAreas.map((area) => (
                        <div key={area.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={area.id}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={area.id} className="font-medium cursor-pointer">
                              {area.label}
                            </Label>
                            <p className="text-sm text-gray-600">{area.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experiência */}
                  <div>
                    <Label htmlFor="experience">Experiência com Animais (Opcional)</Label>
                    <Textarea
                      id="experience"
                      {...register('experience')}
                      placeholder="Conte sobre sua experiência com animais, se houver..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="w-full"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Cadastro'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Por que ser voluntário */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Por que ser Voluntário?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Requisitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dúvidas?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm">(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">voluntarios@amigodosamigos.org</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1" />
                  <span className="text-sm">
                    Rua das Flores, 123<br />
                    Centro, São Paulo - SP
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Horários de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span>8h às 17h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados:</span>
                    <span>8h às 12h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos:</span>
                    <span>Eventos especiais</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
