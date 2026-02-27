import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Target, Eye, Handshake, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';

const About = () => {
  const team = [
    {
      name: 'Jéssica Rodrigues',
      role: 'Presidente',
      image: '/images/jessica.jpg',
      description: 'Ativa na ONG desde Junho de 2016, agora com o cargo de presidente'
    },
    {
      name: 'Rafael Moreira',
      role: 'Vice-Presidente',
      image: '/images/Rafael.jpeg',
      description: 'Na ONG desde Outubro de 2021, auxilia nas demandas administrativas'
    },
    {
      name: 'Otávio Lopes',
      role: 'Tesoureiro',
      image: '/images/otavio.jpeg',
      description: 'Responsável pela transparência financeira da ONG, voluntário desde Fevereiro de 2021.'
    },
    {
      name: 'Vivian Boturi',
      role: 'Fundadora',
      image: '/images/vivian.jpg',
      description: 'Esse projeto só acontece pela sua dedicação em vida.'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Amor Incondicional',
      description: 'Acreditamos que todo animal merece amor, cuidado e respeito, independentemente de sua condição.',
      emoji: '🐾'
    },
    {
      icon: Handshake,
      title: 'Adoção Responsável',
      description: 'Promovemos adoções conscientes, garantindo que cada animal encontre o lar ideal.',
      emoji: '🏡'
    },
    {
      icon: Target,
      title: 'Transparência',
      description: 'Mantemos total transparência em nossas ações e no uso dos recursos recebidos.',
      emoji: '🔍'
    },
    {
      icon: Users,
      title: 'Trabalho em Equipe',
      description: 'Valorizamos a colaboração entre voluntários, parceiros e a comunidade.',
      emoji: '🤝'
    }
  ];

  const achievements = [
    { number: '500+', label: 'Cães Resgatados' },
    { number: '1000+', label: 'Adoções Realizadas' },
    { number: '40+', label: 'Voluntários Ativos' },
    { number: '2000+', label: 'Anos de Atividade' }
  ];

  const galleryImages = [
    '/images/imagem1.jpg',
    '/images/imagem2.jpg',
    '/images/imagem3.jpg',
    '/images/imagem4.jpg',
    '/images/imagem5.jpg',
    '/images/imagem6.jpg'
  ];

  const mvv = [
    {
      icon: Target,
      title: 'Missão',
      text: 'Respeito à vida animal. Resgatar, reabilitar e encontrar lares amorosos para cães em situação de vulnerabilidade, promovendo a adoção responsável.'
    },
    {
      icon: Eye,
      title: 'Visão',
      text: 'Ser referência em proteção animal, criando uma sociedade onde todos os pets tenham direito a uma vida digna e cheia de amor.'
    },
    {
      icon: Heart,
      title: 'Valores',
      text: 'Amor, respeito, transparência, responsabilidade e dedicação incondicional ao bem-estar de todos os animais sob nossos cuidados.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero Section ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container-max text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
            🐾 Nossa História
          </span>
          <h1 className="heading-hero text-white mb-6">
            Sobre Nós
          </h1>
          <p className="body-large text-white/80 max-w-2xl mx-auto">
            Conheça nossa história, nossa equipe e nosso compromisso com o bem-estar animal.
          </p>
        </div>
      </section>

      {/* ── Nossa História ── */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs mb-4 tracking-[0.15em] uppercase">
                Fundada em 2013
              </span>
              <h2 className="heading-section mb-8">Nossa História</h2>
              <div className="space-y-5">
                <p className="body-base">
                  Fundada em 16 de setembro de 2013 e formalizada em 9 de maio de 2014, a ONG Amigo
                  dos Amigos começou como um grupo de voluntários apaixonados pela causa animal.
                  Desde então, contamos com diretores e colaboradores que doam tempo e esforço sem
                  remuneração.
                </p>
                <p className="body-base">
                  A partir de outubro de 2017, recebemos apoio do Poder Público, fortalecendo nossa
                  missão. Nosso foco é a castração, a melhor solução para saúde e controle
                  populacional. Nosso Centro de Proteção Animal funciona como Lar Temporário,
                  priorizando adoção responsável.
                </p>
              </div>
            </div>

            {/* Gallery mosaic */}
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-[1.5rem] shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
                >
                  <OptimizedImage
                    src={src}
                    alt={`Foto ${idx + 1}`}
                    className={`w-full object-cover ${idx === 0 ? 'h-64' : 'h-28'}`}
                    width={400}
                    height={idx === 0 ? 320 : 160}
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Conquistas / Números ── */}
      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Nossas Conquistas</h2>
            <p className="body-base max-w-2xl mx-auto">
              Números que representam vidas transformadas e o impacto positivo do nosso trabalho.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {achievements.map((item, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3 transition-transform group-hover:scale-110">
                  {item.number}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Missão, Visão e Valores ── */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Missão, Visão e Valores</h2>
            <p className="body-base max-w-xl mx-auto">Os princípios que guiam cada decisão que tomamos.</p>
          </div>

          {/* MVV cards — 3 cols */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {mvv.map((item, i) => (
              <Card key={i} className="border-0 bg-muted/20 rounded-[2.5rem] shadow-none hover:bg-primary/5 hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="heading-card mb-4">{item.title}</h3>
                  <p className="body-small text-foreground/70">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed values — 2×2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="border-0 rounded-[2rem] bg-white shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{value.emoji}</span>
                    </div>
                    <div>
                      <h4 className="heading-card text-xl mb-2">{value.title}</h4>
                      <p className="body-small text-foreground/70">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nossa Equipe ── */}
      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Nossa Equipe</h2>
            <p className="body-base max-w-xl mx-auto">
              Conheça as pessoas dedicadas que tornam nosso trabalho possível.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <Card key={i} className="border-0 bg-white shadow-soft rounded-[2.5rem] text-center hover:shadow-xl hover:-translate-y-3 transition-all duration-500 group overflow-hidden">
                <CardContent className="p-8">
                  {/* Avatar */}
                  <div className="relative w-28 h-28 mx-auto mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-28 h-28 rounded-[2rem] object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.parentElement.innerHTML = `<div class="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">${member.name[0]}</div>`; }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>

                  <h3 className="heading-card text-xl mb-1">{member.name}</h3>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-4">{member.role}</p>
                  <p className="body-small text-foreground/60 italic">"{member.description}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="section-padding bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

        <div className="container-max text-center relative z-10">
          <h2 className="heading-section text-white mb-6">Faça Parte da Nossa História</h2>
          <p className="body-large text-white/90 mb-12 max-w-2xl mx-auto">
            Junte-se a nós nesta missão de transformar vidas. Seja através da adoção,
            doação ou voluntariado, você pode fazer a diferença.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button asChild className="btn-premium-hero bg-white text-primary hover:bg-white/90">
              <Link to="/adocao">
                <Heart className="w-5 h-5 mr-3 fill-current" />
                Adotar
              </Link>
            </Button>
            <Button asChild className="btn-premium-lg bg-secondary text-white hover:bg-secondary/90">
              <Link to="/doacoes">
                <DollarSign className="w-5 h-5 mr-2" />
                Fazer Doação
              </Link>
            </Button>
            <Button asChild className="btn-premium-lg bg-white/15 text-white border-2 border-white/50 hover:bg-white/25">
              <Link to="/voluntariado">
                <Users className="w-5 h-5 mr-2" />
                Ser Voluntário
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
