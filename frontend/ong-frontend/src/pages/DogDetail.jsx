import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Phone, Mail, Loader2,
  Calendar, Ruler, VenusAndMars, Dna,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { dogsAPI, adoptionsAPI } from '../lib/api';
import { normalizeImageUrl } from '@/lib/images';

// ── helpers ──────────────────────────────────────────────
const formatPhone = (value) => {
  const n = value.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};

// stat card definition — icon, label, accessor
const statDefs = [
  { icon: Calendar, label: 'Idade',  key: 'age' },
  { icon: Ruler,    label: 'Porte',  key: 'size' },
  { icon: VenusAndMars, label: 'Sexo', key: 'gender' },
  { icon: Dna,      label: 'Raça',   key: (d) => d.breed || 'SRD' },
];

// ── component ────────────────────────────────────────────
const DogDetail = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const handlePhoneChange = (e) => setValue('phone', formatPhone(e.target.value));

  useEffect(() => { loadDog(); }, [id]);

  const loadDog = async () => {
    try {
      const response = await dogsAPI.getById(id);
      setDog(response.data);
    } catch (error) {
      console.error('Erro ao carregar pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await adoptionsAPI.create({
        ...data,
        phone: data.phone.replace(/\D/g, ''),
        dogId: parseInt(id),
      });
      setSubmitted(true);
      setShowModal(false);
      reset();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert(`Erro ao enviar: ${error.response?.data?.error || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-black text-foreground/60 mb-4">Pet não encontrado</h2>
          <Button asChild><Link to="/adocao">Voltar para Adoção</Link></Button>
        </div>
      </div>
    );
  }

  const images = (Array.isArray(dog.images) && dog.images.length > 0)
    ? dog.images.map((u) => normalizeImageUrl(u)).filter(Boolean)
    : ['/api/placeholder/600/400'];

  // ── render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle blobs */}
      <div className="fixed top-0 right-0 w-[35vw] h-[35vw] bg-primary/4 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[25vw] h-[25vw] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb */}
      <div className="relative z-10 border-b border-foreground/5">
        <div className="container-max py-4">
          <Button asChild variant="ghost" className="hover:bg-primary/5 text-foreground/50 font-bold px-0 h-auto">
            <Link to="/adocao" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Galeria de Amigos
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-max relative z-10 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* ── Left column: Image + Personality ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Photo frame */}
            <div className="relative group">
              {/* Corner accents */}
              <div className="absolute -top-2 -left-2 w-10 h-10 bg-accent/20 rounded-tl-[1.5rem] z-20 pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary/20 rounded-br-[1.5rem] z-20 pointer-events-none" />

              {/* Main image */}
              <div className="relative h-[380px] lg:h-[440px] overflow-hidden rounded-[2rem] shadow-premium bg-muted/30 p-3">
                <img
                  src={images[currentImageIndex]}
                  alt={dog.name}
                  className="w-full h-full object-cover rounded-[1.5rem] transition-transform duration-700 group-hover:scale-[1.02]"
                />

                {/* Status badges */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  {dog.vaccinated && (
                    <span className="bg-primary text-white font-black text-[9px] px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest rotate-2 border border-white/20">
                      Vacinado 💉
                    </span>
                  )}
                  {dog.neutered && (
                    <span className="bg-secondary text-white font-black text-[9px] px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest -rotate-1 border border-white/20">
                      Castrado ✨
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex justify-center gap-3 mt-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'ring-3 ring-primary ring-offset-3 scale-110'
                          : 'opacity-50 hover:opacity-80 grayscale hover:grayscale-0'
                      }`}
                    >
                      <img src={image} alt={`${dog.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Personality / Temperament */}
            <div className="relative bg-white p-6 rounded-[2rem] shadow-soft border-l-4 border-primary overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-xs font-black text-primary mb-3 uppercase tracking-[0.2em]">Personalidade</h3>
              <p className="text-base font-serif text-foreground/70 italic leading-relaxed">
                "{dog.temperament || 'Este amiguinho tem um brilho especial nos olhos e muito amor para dar.'}"
              </p>
            </div>
          </div>

          {/* ── Right column: Info & Action ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Name + badge */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs mb-3 uppercase tracking-widest">
                🐶 Resgate #{dog.id}
              </span>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground leading-none italic mb-5">
                {dog.name}
              </h1>

              {/* Stat cards — compact 2×2 grid */}
              <div className="grid grid-cols-2 gap-3">
                {statDefs.map(({ icon: Icon, label, key }) => {
                  const value = typeof key === 'function' ? key(dog) : dog[key];
                  return (
                    <div key={label} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-foreground/5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-foreground/40 uppercase tracking-widest">{label}</span>
                        <span className="text-sm font-black text-foreground capitalize">{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Story */}
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-3">Minha História</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {dog.description}
              </p>
            </div>

            {/* Action card */}
            <div className="bg-primary p-0.5 rounded-[2.5rem] shadow-xl">
              <div className="bg-white p-6 rounded-[2.5rem] space-y-4">
                {!submitted ? (
                  <>
                    <div className="text-center space-y-1">
                      <Heart className="w-8 h-8 text-secondary fill-current mx-auto" />
                      <h4 className="text-lg font-black text-foreground">Pronto para dar um lar?</h4>
                      <p className="text-sm text-foreground/50">A primeira lambida está a um botão de distância.</p>
                    </div>

                    <Button
                      onClick={() => setShowModal(true)}
                      className="w-full btn-premium-hero btn-primary rounded-full"
                    >
                      Iniciar Adoção
                    </Button>

                    <div className="flex items-center gap-3">
                      <Button asChild variant="outline" className="flex-1 rounded-full font-bold border-2 hover:bg-primary/5 h-10 text-sm">
                        <a href={`https://wa.me/5535998215366?text=Olá! Tenho interesse em adotar o pet ${dog.name}`}>
                          <Phone className="w-4 h-4 mr-1.5" />
                          WhatsApp
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="flex-1 rounded-full font-bold border-2 hover:bg-primary/5 h-10 text-sm">
                        <Link to="/contato">
                          <Mail className="w-4 h-4 mr-1.5" />
                          Dúvidas
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-7 h-7 text-primary fill-current" />
                    </div>
                    <h3 className="text-lg font-black text-foreground">Pedido Enviado!</h3>
                    <p className="text-sm text-foreground/60">
                      Obrigado por querer mudar a vida de <strong>{dog.name}</strong>! Nossa equipe entrará em contato em breve. 🐾❤️
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Adoption modal ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="!max-w-2xl rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-background">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[90vh]">

            {/* Left decorative panel */}
            <div className="hidden md:flex md:col-span-4 bg-primary p-7 flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h2 className="text-3xl font-black italic mb-2">{dog.name}</h2>
                <p className="text-white/70 text-sm">O começo de uma nova história de amizade.</p>
              </div>
              <div className="relative z-10 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2">Processo de Adoção</p>
                <ul className="text-xs space-y-1.5 opacity-90">
                  <li>✨ Entrevista telefônica</li>
                  <li>🏡 Visita virtual/presencial</li>
                  <li>❤️ Finalização do contrato</li>
                </ul>
              </div>
            </div>

            {/* Form panel */}
            <div className="md:col-span-8 p-7 overflow-y-auto">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-foreground italic">Seu formulário de carinho</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest text-foreground/40 ml-1">Nome Completo</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Nome é obrigatório' })}
                      className={`rounded-xl border-2 h-11 ${errors.name ? 'border-red-400' : 'border-foreground/8 focus:border-primary/30'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-foreground/40 ml-1">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'E-mail é obrigatório',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'E-mail inválido' },
                      })}
                      className={`rounded-xl border-2 h-11 ${errors.email ? 'border-red-400' : 'border-foreground/8 focus:border-primary/30'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-widest text-foreground/40 ml-1">Telefone</Label>
                  <Input
                    id="phone"
                    {...register('phone', { required: 'Telefone é obrigatório' })}
                    onChange={handlePhoneChange}
                    placeholder="(XX) XXXXX-XXXX"
                    maxLength={15}
                    className={`rounded-xl border-2 h-11 ${errors.phone ? 'border-red-400' : 'border-foreground/8 focus:border-primary/30'}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="font-bold text-xs uppercase tracking-widest text-foreground/40 ml-1">Onde você mora?</Label>
                  <Textarea
                    id="address"
                    {...register('address', { required: 'Endereço é obrigatório' })}
                    className={`rounded-xl border-2 min-h-[80px] ${errors.address ? 'border-red-400' : 'border-foreground/8 focus:border-primary/30'}`}
                    placeholder="Endereço completo..."
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="experience" className="font-bold text-xs uppercase tracking-widest text-foreground/40 ml-1">Experiência com Animais</Label>
                  <Textarea
                    id="experience"
                    {...register('experience', { required: 'Este campo é obrigatório' })}
                    className={`rounded-xl border-2 min-h-[80px] ${errors.experience ? 'border-red-400' : 'border-foreground/8 focus:border-primary/30'}`}
                    placeholder="Já teve pets antes?"
                  />
                  {errors.experience && <p className="text-xs text-red-500">{errors.experience.message}</p>}
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-premium-hero btn-secondary rounded-full"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </span>
                    ) : 'Enviar Pedido ❤️'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                    className="w-full text-foreground/40 font-bold hover:bg-transparent hover:text-foreground/60 h-9"
                  >
                    Depois eu volto
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DogDetail;
