import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dogsAPI, statsAPI } from '../lib/api';
import PetCard from '../components/PetCard';

const Home = () => {
  const [featuredDogs, setFeaturedDogs] = useState([]);
  /*const [stats, setStats] = useState({
    dogsRescued: 0,
    dogsAdopted: 0,
    activeVolunteers: 0,
    totalDonations: 0
  }); */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dogsResponse, ] = await Promise.all([
        dogsAPI.getAll({ limit: 6 }),
        statsAPI.get()
      ]);
      
      setFeaturedDogs(dogsResponse.data.dogs || []);
      //setStats(statsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const impactItems = [
    { amount: 'R$ 50', description: 'Vacina completa para um cão' },
    { amount: 'R$ 100', description: 'Castração de um animal' },
    { amount: 'R$ 200', description: 'Tratamento veterinário básico' },
    { amount: 'R$ 500', description: 'Resgate e cuidados de emergência' },
  ];

  const successStories = [
    {
      id: 1,
      name: 'Buddy',
      before: '/api/placeholder/300/200',
      after: '/api/placeholder/300/200',
      story: 'Resgatado das ruas em estado crítico, hoje Buddy vive feliz com sua nova família.'
    },
    {
      id: 2,
      name: 'Luna',
      before: '/api/placeholder/300/200',
      after: '/api/placeholder/300/200',
      story: 'Luna estava abandonada e ferida. Após tratamento, encontrou um lar cheio de amor.'
    },
    {
      id: 3,
      name: 'Max',
      before: '/api/placeholder/300/200',
      after: '/api/placeholder/300/200',
      story: 'Max era muito tímido, mas com carinho e paciência se tornou um cão brincalhão.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/15 rounded-full blur-3xl animate-pulse" />
        
        <div className="container-max px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-slide-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-black text-xs mb-6 tracking-[0.2em] uppercase">
                🐶 Amigo dos Amigos
              </span>
              <h1 className="heading-hero-home mb-8">
                Sua vida ganha <br />
                <span className="text-gradient">mais cor</span> com <br />
                um novo amigo.
              </h1>
              <p className="body-large mb-10 max-w-xl">
                Resgatamos e cuidamos de cães e gatos em situação de risco, transformando cicatrizes em sorrisos e solidão em companhia.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <Button asChild className="btn-premium-hero w-full sm:w-auto">
                  <Link to="/adocao">
                    <Heart className="w-6 h-6 mr-3 fill-current" />
                    Quero Adotar
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="btn-premium-lg text-primary hover:bg-primary/5 hover:text-primary w-full sm:w-auto border-2 border-primary/20">
                  <Link to="/doacoes">
                    Fazer Doação
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative animate-fade-in delay-300">
              {/* Organic Image Mask Container */}
              <div className="relative z-10 overflow-hidden" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}>
                <img 
                  src="/images/slide1.jpg" 
                  alt="Dog and Human" 
                  className="w-full aspect-square object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                />
              </div>
              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-4 border-dashed border-primary/20 rounded-full animate-spin-slow -z-10" />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl animate-bounce-slow flex items-center gap-4 border border-border/50 z-20">
                <div className="bg-secondary p-3 rounded-2xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-2xl text-foreground">1.5k+</p>
                  <p className="text-sm font-medium text-foreground/60">Vidas Salvas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Missão Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-max text-center">
          <h2 className="heading-section mb-8">Nossa Missão</h2>
          <p className="body-base max-w-3xl mx-auto mb-10">
            Somos uma organização dedicada ao resgate, reabilitação e adoção responsável 
            de cães e gatos em situação de vulnerabilidade. Acreditamos que todo animal 
            merece amor, cuidado e uma família.
          </p>
          <Button asChild variant="outline" className="btn-premium-lg bg-white mx-auto">
            <Link to="/sobre">
              Saiba Mais
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-black text-primary mb-3 transition-transform group-hover:scale-110">
                510
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/70">Resgatados</p>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-black text-primary mb-3 transition-transform group-hover:scale-110">
                1003
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/70">Adoções</p>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-black text-primary mb-3 transition-transform group-hover:scale-110">
                42
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/70">Voluntários</p>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-black text-primary mb-3 transition-transform group-hover:scale-110">
                2002
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/70">Castrados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cães em Destaque */}
      <section className="section-padding bg-muted/30">
        <div className="container-max text-center">
          <div className="mb-16">
            <h2 className="heading-section mb-6">Pacotinhos de amor esperando por você</h2>
            <p className="body-base">
              Conheça alguns dos nossos amigos que estão procurando uma família
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] shadow-soft p-6 animate-pulse border border-border">
                  <div className="bg-muted h-72 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-muted rounded-full mb-3 w-3/4"></div>
                  <div className="h-4 bg-muted rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredDogs.map((dog) => (
                <PetCard key={dog.id} dog={dog} variant="large" />
              ))}
            </div>
          )}
          
          <div className="mt-12">
            <Button asChild variant="outline" className="btn-premium-lg bg-white text-primary hover:bg-primary/5 border-2 border-primary/20 mx-auto">
              <Link to="/adocao">
                Ver Todos os Amigos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impacto das Doações */}
      <section className="section-padding">
        <div className="container-max text-center">
          <div className="mb-16">
            <h2 className="heading-section mb-6">Seu Impacto</h2>
            <p className="body-base">Veja como sua doação pode transformar vidas</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactItems.map((item, index) => (
              <Card key={index} className="rounded-[2.5rem] border-0 bg-muted/20 shadow-none hover:bg-primary/5 hover:translate-y-[-8px] transition-all duration-300">
                <CardContent className="p-10">
                  <div className="text-3xl font-black text-secondary mb-3">
                    {item.amount}
                  </div>
                  <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12">
            <Button asChild className="btn-premium-lg btn-accent mx-auto">
              <Link to="/doacoes">
                Fazer Doação Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Histórias de Sucesso */}
      <section className="section-padding bg-muted/30">
        <div className="container-max text-center">
          <div className="mb-16">
            <h2 className="heading-section mb-6">Histórias de Sucesso</h2>
            <p className="body-base">Transformações que nos motivam a continuar</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {successStories.map((story) => (
              <Card key={story.id} className="rounded-[3rem] overflow-hidden border-0 shadow-soft hover:shadow-xl transition-all">
                <CardContent className="p-10">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="relative">
                      <p className="absolute -top-3 -left-2 bg-secondary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded rotate-[-10deg] shadow-lg">Antes</p>
                      <img
                        src={story.before}
                        alt={`${story.name} antes`}
                        className="w-full aspect-square object-cover rounded-2xl grayscale"
                      />
                    </div>
                    <div className="relative">
                    <p className="absolute -top-3 -right-2 bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded rotate-[10deg] shadow-lg">Depois</p>
                      <img
                        src={story.after}
                        alt={`${story.name} depois`}
                        className="w-full aspect-square object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                  <h3 className="heading-card mb-4">{story.name}</h3>
                  <p className="body-small italic text-foreground/70">"{story.story}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="section-padding bg-primary text-white relative overflow-hidden">
        {/* Decorative background blobs for CTA */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

        <div className="container-max text-center relative z-10">
          <h2 className="heading-section text-white mb-8">
            Faça parte desta transformação
          </h2>
          <p className="body-large text-white/90 mb-12 max-w-2xl mx-auto">
            Seja através da adoção, doação ou voluntariado, você pode fazer a diferença 
            na vida de um animal que precisa de amor.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button asChild className="btn-premium-hero bg-white text-primary hover:bg-white/90">
              <Link to="/adocao">
                <Heart className="w-5 h-5 mr-3 fill-current" />
                Adotar Amigo
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

export default Home;
