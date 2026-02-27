import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Home, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { contactsAPI, settingsAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

// Shared input style — same as other harmonized pages
const inputClass = 'h-12 rounded-2xl border-2 border-transparent bg-muted/30 focus:bg-white focus:border-primary/20 transition-all';
const labelClass = 'block text-sm font-black text-foreground mb-2';

const subjects = [
  { value: 'adocao', label: 'Adoção de Animais' },
  { value: 'doacao', label: 'Doações' },
  { value: 'voluntariado', label: 'Voluntariado' },
  { value: 'parcerias', label: 'Parcerias' },
  { value: 'denuncia', label: 'Denúncia de Maus-tratos' },
  { value: 'outros', label: 'Outros Assuntos' },
];

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Contact info cards — all using design tokens
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      content: settings?.address || 'Rua ABC, 123\nCentro, São Paulo - SP\nCEP: 01234-567',
      iconBg: 'bg-secondary/15',
      iconColor: 'text-secondary',
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: settings?.phone || '(11) 99999-9999\n(11) 3333-4444',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: settings?.email || 'seuemail@email.com.br',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
    },
    {
      icon: Clock,
      title: 'Horário de Funcionamento',
      content: 'Segunda a Sexta: 8h às 17h\nSábados: 8h às 12h\nDomingos: Fechado',
      iconBg: 'bg-muted',
      iconColor: 'text-foreground/50',
    },
  ];

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await contactsAPI.create({ ...data, subject: subject || null });
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

  const handleNewMessage = () => { setSubmitted(false); reset(); setSubject(''); };

  return (
    <>
      <div className="min-h-screen bg-background">

        {/* ── Hero ── */}
        <section className="relative section-padding bg-primary text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="container-max text-center relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
              💬 Contato
            </span>
            <h1 className="heading-hero text-white mb-6">Entre em Contato</h1>
            <p className="body-large text-white/80 max-w-2xl mx-auto">
              Estamos aqui para ajudar! Entre em contato para tirar dúvidas, fazer denúncias ou saber como pode contribuir com nosso trabalho.
            </p>
          </div>
        </section>

        <div className="container-max section-padding">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* ── Contact Form (2 cols) ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Form card */}
              <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
                <CardContent className="p-8">
                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="heading-card">Envie sua Mensagem</h2>
                      <p className="body-small text-foreground/50">Respondemos em até 24 horas</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className={labelClass}>Nome Completo *</label>
                        <Input
                          id="name"
                          {...register('name', { required: 'Nome é obrigatório' })}
                          className={`${inputClass} ${errors.name ? '!border-red-400' : ''}`}
                          placeholder="Seu nome completo"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className={labelClass}>E-mail *</label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email', {
                            required: 'E-mail é obrigatório',
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'E-mail inválido' }
                          })}
                          className={`${inputClass} ${errors.email ? '!border-red-400' : ''}`}
                          placeholder="seu.email@exemplo.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className={labelClass}>Assunto</label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="h-12 rounded-2xl border-2 border-transparent bg-muted/30 hover:bg-white hover:border-primary/20 transition-all font-medium">
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                          {subjects.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className={labelClass}>Mensagem *</label>
                      <Textarea
                        id="message"
                        {...register('message', { required: 'Mensagem é obrigatória' })}
                        className={`min-h-[180px] rounded-2xl border-2 border-transparent bg-muted/30 focus:bg-white focus:border-primary/20 transition-all resize-none ${errors.message ? '!border-red-400' : ''}`}
                        placeholder="Digite sua mensagem aqui... Seja o mais detalhado possível para que possamos ajudá-lo da melhor forma."
                        rows={6}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message.message}</p>}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="btn-premium-hero btn-primary w-full"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Enviar Mensagem
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* WhatsApp card */}
              <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="heading-card mb-2">Prefere WhatsApp?</h3>
                  <p className="body-base text-foreground/50 mb-6">
                    Para um atendimento mais rápido, entre em contato pelo WhatsApp
                  </p>
                  <Button asChild className="btn-premium-hero btn-secondary">
                    <a
                      href={
                        settings?.whatsapp
                          ? `https://wa.me/55${settings.whatsapp.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre a ONG Amigo dos Amigos`
                          : 'https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre a ONG Amigo dos Amigos'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Conversar no WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar: Info Cards + Tips ── */}
            <div className="space-y-5">

              {/* Contact info cards */}
              {contactInfo.map((info, i) => (
                <Card key={i} className="border-0 bg-white shadow-soft rounded-[2rem] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-2xl ${info.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <info.icon className={`w-5 h-5 ${info.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-foreground mb-1">{info.title}</h3>
                        <p className="body-small text-foreground/60 whitespace-pre-line">{info.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Tips card */}
              <Card className="border-0 bg-primary/5 shadow-soft rounded-[2rem]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Info className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-black text-sm text-foreground">Dicas para o Contato</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Para adoções, visite nossa página de cães disponíveis primeiro',
                      'Em emergências com animais, ligue diretamente para nosso telefone',
                      'Para doações, acesse nossa página específica com todas as opções',
                      'Respondemos sua mensagem por email em até 24 horas',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span className="body-small text-foreground/60">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Modal ── */}
      <Dialog open={submitted} onOpenChange={setSubmitted}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl p-8">
          <DialogHeader>
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center heading-card">
              Mensagem Enviada!
            </DialogTitle>
            <DialogDescription className="text-center body-base text-foreground/60 mt-3">
              Sua mensagem foi enviada para nossa equipe. Você receberá uma confirmação automática no seu e-mail. Respondemos em até 24 horas — obrigado pelo contato!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={handleNewMessage} className="btn-premium-md btn-primary w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Nova Mensagem
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="btn-premium-md w-full border-2 border-border hover:border-primary hover:text-primary transition-all">
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