import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { contactsAPI, adminAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      content: settings?.address || 'Rua ABC, 123\nCentro, São Paulo - SP\nCEP: 01234-567',
      color: 'text-red-500'
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: settings?.phone || '(11) 99999-9999\n(11) 3333-4444',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: settings?.email || 'seuemail@email.com.br',
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Formulário de Contato - Ocupa 2 colunas em telas grandes */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    Envie sua Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="mb-2 text-base">Nome Completo *</Label>
                        <Input
                          id="name"
                          {...register('name', { required: 'Nome é obrigatório' })}
                          className={errors.name ? 'border-red-500' : ''}
                          placeholder="Seu nome completo"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="mb-2 text-base">E-mail *</Label>
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
                          placeholder="seu.email@exemplo.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="mb-2 text-base">Assunto</Label>
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
                      <Label htmlFor="message" className="mb-2 text-base">Mensagem *</Label>
                      <Textarea
                        id="message"
                        {...register('message', { required: 'Mensagem é obrigatória' })}
                        className={`min-h-[190px] ${errors.message ? 'border-red-500' : ''}`}
                        placeholder="Digite sua mensagem aqui... Seja o mais detalhado possível para que possamos ajudá-lo da melhor forma."
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
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Mensagem
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card className="mt-4">
                <CardContent className="p-2">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">Prefere WhatsApp?</h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      Para um atendimento mais rápido, entre em contato pelo WhatsApp
                    </p>
                    <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 h-12 px-8 text-lg">
                      <a 
                        href={settings?.whatsapp ? `https://wa.me/55${settings.whatsapp.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre a ONG Amigo dos Amigos` : "https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre a ONG Amigo dos Amigos"}
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
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent>
                      <div className="flex items-start gap-2">
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

              {/* 
              --MAPA--
              <Card className="shadow-sm">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Nossa Localização</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full h-48 bg-gray-200 rounded-b-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Mapa do Google Maps</p>
                      <p className="text-sm mt-1">{settings?.address ? settings.address.split('\n')[0] : 'Rua das Flores, 123 - Centro, São Paulo'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Dicas */}
              <Card className="bg-blue-50 border-blue-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-lg">Dicas para o Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Para adoções, visite nossa página de cães disponíveis primeiro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Em emergências com animais, ligue diretamente para nosso telefone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Para doações, acesse nossa página específica com todas as opções</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Suas mensagens são enviadas diretamente por email e respondemos em até 24 horas</span>
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