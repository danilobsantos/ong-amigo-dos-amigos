import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { contactsAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      content: 'Rua das Flores, 123\nCentro, São Paulo - SP\nCEP: 01234-567',
      color: 'text-red-500'
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: '(11) 99999-9999\n(11) 3333-4444',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: 'contato@amigodosamigos.org\nadocao@amigodosamigos.org',
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      title: 'Horário de Funcionamento',
      content: 'Segunda a Sexta: 8h às 17h\nSábados: 8h às 12h\nDomingos: Fechado',
      color: 'text-purple-500'
    }
  ];

  const subjects = [
    { value: 'adocao', label: 'Adoção de Animais' },
    { value: 'doacao', label: 'Doações' },
    { value: 'voluntariado', label: 'Voluntariado' },
    { value: 'parcerias', label: 'Parcerias' },
    { value: 'denuncia', label: 'Denúncia de Maus-tratos' },
    { value: 'outros', label: 'Outros Assuntos' }
  ];

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const contactData = {
        ...data,
        subject: subject || null
      };

      await contactsAPI.create(contactData);
      setSubmitted(true);
      reset();
      setSubject('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewMessage = () => {
    setSubmitted(false);
    reset();
    setSubject('');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-primary text-white section-padding">
          <div className="container-max text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Estamos aqui para ajudar! Entre em contato conosco para tirar dúvidas, 
              fazer denúncias ou saber como pode contribuir com nosso trabalho.
            </p>
          </div>
        </section>

        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário de Contato */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    Envie sua Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="mb-2">Nome Completo *</Label>
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
                        <Label htmlFor="email" className="mb-2">E-mail *</Label>
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
                    </div>

                    <div>
                      <Label htmlFor="subject" className="mb-2">Assunto</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subj) => (
                            <SelectItem key={subj.value} value={subj.value}>
                              {subj.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message" className="mb-2">Mensagem *</Label>
                      <Textarea
                        id="message"
                        {...register('message', { required: 'Mensagem é obrigatória' })}
                        className={errors.message ? 'border-red-500' : ''}
                        placeholder="Digite sua mensagem aqui..."
                        rows={6}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      size="lg"
                      className="w-full"
                    >
                      {submitting ? 'Enviando...' : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Prefere WhatsApp?</h3>
                    <p className="text-gray-600 mb-4">
                      Para um atendimento mais rápido, entre em contato pelo WhatsApp
                    </p>
                    <Button asChild size="lg" className="bg-green-500 hover:bg-green-600">
                      <a 
                        href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre a ONG Amigo dos Amigos"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Conversar no WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-6">
              {/* Informações */}
              <div className="grid grid-cols-1 gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gray-100 ${info.color}`}>
                          <info.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                          <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mapa */}
              <Card>
                <CardHeader>
                  <CardTitle>Nossa Localização</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full h-64 bg-gray-200 rounded-b-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Mapa do Google Maps</p>
                      <p className="text-sm">Rua das Flores, 123 - Centro, São Paulo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dicas */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Dicas para o Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      Para adoções, visite nossa página de cães disponíveis primeiro
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      Em emergências com animais, ligue diretamente para nosso telefone
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      Para doações, acesse nossa página específica com todas as opções
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      Suas mensagens são enviadas diretamente por email e respondemos em até 24 horas
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={submitted} onOpenChange={setSubmitted}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <Send className="w-16 h-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              Mensagem Enviada por Email!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-4">
              Sua mensagem foi enviada diretamente por email para nossa equipe e você receberá
              uma confirmação automática no seu email. Responderemos o mais breve possível.
              Obrigado pelo contato!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={handleNewMessage} className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Nova Mensagem
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Contact;