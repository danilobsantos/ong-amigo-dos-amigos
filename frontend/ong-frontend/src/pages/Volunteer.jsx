import React, { useState, useEffect } from 'react';
import { Users, Heart, Clock, MapPin, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { volunteersAPI, settingsAPI } from '../lib/api';

const Volunteer = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [settings, setSettings] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const volunteerAreas = [
    { id: 'resgate', label: 'Resgate de Animais', emoji: '🚑', description: 'Participar de resgates de emergência' },
    { id: 'cuidados', label: 'Cuidados Diários', emoji: '🐾', description: 'Alimentação, limpeza e cuidados básicos' },
    { id: 'transporte', label: 'Transporte', emoji: '🚗', description: 'Levar animais ao veterinário ou eventos' },
    { id: 'eventos', label: 'Eventos e Campanhas', emoji: '🎉', description: 'Organizar e participar de eventos' },
    { id: 'adocao', label: 'Processo de Adoção', emoji: '🏡', description: 'Auxiliar no processo de adoção' },
    { id: 'administrativo', label: 'Apoio Administrativo', emoji: '📋', description: 'Tarefas administrativas e documentação' },
    { id: 'veterinario', label: 'Cuidados Veterinários', emoji: '🩺', description: 'Apoio médico veterinário' },
    { id: 'marketing', label: 'Marketing e Comunicação', emoji: '📱', description: 'Redes sociais e divulgação' }
  ];

  const benefits = [
    { text: 'Certificado de horas de voluntariado', emoji: '🎓' },
    { text: 'Treinamento especializado', emoji: '📚' },
    { text: 'Networking com outros voluntários', emoji: '🤝' },
    { text: 'Experiência em proteção animal', emoji: '🐕' },
    { text: 'Satisfação pessoal de ajudar', emoji: '💚' },
    { text: 'Flexibilidade de horários', emoji: '⏰' }
  ];

  const requirements = [
    'Ser maior de 16 anos (menores com autorização)',
    'Disponibilidade mínima de 4 horas por semana',
    'Amor e respeito pelos animais',
    'Comprometimento e responsabilidade',
    'Disponibilidade para treinamento inicial'
  ];

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhone(e.target.value);
    setPhoneValue(formattedValue);
    const numbers = formattedValue.replace(/\D/g, '');
    if (numbers.length > 0 && numbers.length < 10) {
      setPhoneError('Telefone deve ter pelo menos 10 dígitos');
    } else {
      setPhoneError('');
    }
  };

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
      const cleanPhone = phoneValue.replace(/\D/g, '');
      if (!phoneValue.trim()) { setPhoneError('Telefone é obrigatório'); return; }
      if (cleanPhone.length < 10) { setPhoneError('Telefone deve ter pelo menos 10 dígitos'); return; }

      await volunteersAPI.create({ ...data, phone: cleanPhone, areas: selectedAreas });
      setSubmitted(true);
      reset();
      setSelectedAreas([]);
      setPhoneValue('');
      setPhoneError('');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Success Modal ── */}
      <Dialog open={submitted} onOpenChange={setSubmitted}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-0 shadow-2xl">
          <DialogHeader className="text-center pt-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="heading-card text-2xl text-center">
              Cadastro Realizado! 🎉
            </DialogTitle>
            <DialogDescription className="body-base text-foreground/60 text-center mt-4">
              Obrigado pelo seu interesse em ser voluntário! Entraremos em contato
              em breve para dar continuidade ao processo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6 pb-2">
            <Button onClick={() => setSubmitted(false)} className="btn-premium-md btn-primary flex-1">
              Novo Cadastro
            </Button>
            <Button variant="outline" onClick={() => setSubmitted(false)} className="btn-premium-md flex-1 border-2">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Hero Section ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container-max text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
            🤝 Voluntariado
          </span>
          <h1 className="heading-hero text-white mb-6">Seja um Voluntário</h1>
          <p className="body-large text-white/80 max-w-2xl mx-auto">
            Junte-se à nossa equipe e faça a diferença na vida de cães e gatos que precisam de amor e cuidado.
            Sua ajuda é fundamental para continuarmos salvando vidas.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Registration Form ── */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-10">
                {/* Form header */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="heading-card">Cadastro de Voluntário</h2>
                    <p className="body-small text-foreground/60">Preencha o formulário e entraremos em contato</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                  {/* Personal Info */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50 mb-5">
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="body-small font-black text-foreground/80">Nome Completo *</Label>
                        <Input
                          id="name"
                          {...register('name', { required: 'Nome é obrigatório' })}
                          className={`h-12 rounded-2xl border-2 bg-muted/30 focus:bg-white transition-all ${errors.name ? 'border-destructive' : 'border-transparent focus:border-primary/20'}`}
                        />
                        {errors.name && <p className="text-xs text-destructive font-bold">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="body-small font-black text-foreground/80">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email', {
                            required: 'E-mail é obrigatório',
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'E-mail inválido' }
                          })}
                          className={`h-12 rounded-2xl border-2 bg-muted/30 focus:bg-white transition-all ${errors.email ? 'border-destructive' : 'border-transparent focus:border-primary/20'}`}
                        />
                        {errors.email && <p className="text-xs text-destructive font-bold">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="body-small font-black text-foreground/80">Telefone *</Label>
                        <Input
                          id="phone"
                          value={phoneValue}
                          onChange={handlePhoneChange}
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                          className={`h-12 rounded-2xl border-2 bg-muted/30 focus:bg-white transition-all ${phoneError ? 'border-destructive' : 'border-transparent focus:border-primary/20'}`}
                        />
                        {phoneError && <p className="text-xs text-destructive font-bold">{phoneError}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <Label htmlFor="availability" className="body-small font-black text-foreground/80">Disponibilidade *</Label>
                    <Textarea
                      id="availability"
                      {...register('availability', { required: 'Disponibilidade é obrigatória' })}
                      className={`rounded-2xl border-2 bg-muted/30 focus:bg-white transition-all resize-none ${errors.availability ? 'border-destructive' : 'border-transparent focus:border-primary/20'}`}
                      placeholder="Descreva sua disponibilidade (dias da semana, horários, frequência...)"
                      rows={3}
                    />
                    {errors.availability && <p className="text-xs text-destructive font-bold">{errors.availability.message}</p>}
                  </div>

                  {/* Areas of Interest */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50 mb-5">
                      Áreas de Interesse * <span className="normal-case tracking-normal font-medium">(selecione pelo menos uma)</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {volunteerAreas.map((area) => (
                        <label
                          key={area.id}
                          htmlFor={area.id}
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedAreas.includes(area.id)
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-border/50 bg-muted/20 hover:border-primary/20 hover:bg-muted/40'
                          }`}
                        >
                          <Checkbox
                            id={area.id}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span>{area.emoji}</span>
                              <span className="font-black text-sm text-foreground">{area.label}</span>
                            </div>
                            <p className="body-small text-foreground/50">{area.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="body-small font-black text-foreground/80">
                      Experiência com Animais <span className="font-medium text-foreground/40">(Opcional)</span>
                    </Label>
                    <Textarea
                      id="experience"
                      {...register('experience')}
                      placeholder="Conte sobre sua experiência com animais, se houver..."
                      rows={4}
                      className="rounded-2xl border-2 border-transparent bg-muted/30 focus:bg-white focus:border-primary/20 transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="btn-premium-hero btn-primary w-full"
                  >
                    {submitting ? 'Enviando...' : (
                      <>Enviar Cadastro <ArrowRight className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">

            {/* Benefits */}
            <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-secondary fill-current" />
                  </div>
                  <h3 className="heading-card text-lg">Por que ser Voluntário?</h3>
                </div>
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-lg">{benefit.emoji}</span>
                      <span className="body-small text-foreground/70">{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="heading-card text-lg">Requisitos</h3>
                </div>
                <ul className="space-y-3">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="body-small text-foreground/70">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            {/* <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-8">
                <h3 className="heading-card text-lg mb-6">Dúvidas?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="body-small text-foreground/70">{settings?.phone || '(11) 99999-9999'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <span className="body-small text-foreground/70 break-all">{settings?.email || 'voluntarios@amigodosamigos.org'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <span className="body-small text-foreground/70 whitespace-pre-line">
                      {settings?.address || 'Rua das Flores, 123\nCentro, São Paulo - SP'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Schedule */}
            <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="heading-card text-lg">Horários de Atividades</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { day: 'Segunda a Sexta', hours: '8h às 17h' },
                    { day: 'Sábados', hours: '8h às 12h' },
                    { day: 'Domingos', hours: 'Eventos especiais' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                      <span className="body-small font-black text-foreground/70">{item.day}</span>
                      <span className="body-small text-foreground/50">{item.hours}</span>
                    </div>
                  ))}
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
