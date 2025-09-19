import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dogsAPI, statsAPI } from '../lib/api';

const Home = () => {
  const [featuredDogs, setFeaturedDogs] = useState([]);
  const [stats, setStats] = useState({
    dogsRescued: 0,
    dogsAdopted: 0,
    activeVolunteers: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dogsResponse, statsResponse] = await Promise.all([
        dogsAPI.getAll({ limit: 6 }),
        statsAPI.get()
      ]);
      
      setFeaturedDogs(dogsResponse.data.dogs || []);
      setStats(statsResponse.data);
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
      <section 
        className="relative h-screen flex items-center justify-center 
                  bg-cover bg-center bg-no-repeat 
                  bg-[url('/images/slide1.jpg')] 
                  before:absolute before:inset-0 
                  before:bg-black/40 before:z-0"
      >
        <div className="relative z-10 text-center text-white container-max px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Adote, doe, transforme vidas...
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-slide-up">
            Resgatamos e cuidamos de cães e gatos de rua, oferecendo uma segunda chance 
            para encontrarem uma família amorosa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button asChild size="lg" className="btn-primary text-lg px-8 py-4">
              <Link to="/adocao">
                <Heart className="w-5 h-5 mr-2" />
                Quero Adotar
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-gray-900"
            >
              <Link to="/doacoes">
                <DollarSign className="w-5 h-5 mr-2" />
                Fazer Doação
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Missão Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Missão</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Somos uma organização dedicada ao resgate, reabilitação e adoção responsável 
            de cães e gatos em situação de vulnerabilidade. Acreditamos que todo animal 
            merece amor, cuidado e uma família.
          </p>
          <Button asChild variant="outline" size="lg">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stats.dogsRescued}
              </div>
              <p className="text-gray-600">Cães e Gatos Resgatados</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stats.dogsAdopted}
              </div>
              <p className="text-gray-600">Adoções Realizadas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stats.activeVolunteers}
              </div>
              <p className="text-gray-600">Voluntários Ativos</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                R$ {Number(stats.totalDonations).toLocaleString('pt-BR')}
              </div>
              <p className="text-gray-600">Arrecadado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cães em Destaque */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pacotinhos de amor esperando por você</h2>
            <p className="text-lg text-gray-700">
              Conheça alguns dos nossos amigos que estão procurando uma família
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDogs.map((dog) => (
                <Card key={dog.id} className="card-hover">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={dog.images?.[0] || '/api/placeholder/400/300'}
                        alt={dog.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs">
                        {dog.size}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{dog.name}</h3>
                      <p className="text-gray-600 mb-2">{dog.age} • {dog.gender}</p>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {dog.temperament}
                      </p>
                      <Button asChild className="w-full">
                        <Link to={`/adocao/${dog.id}`}>
                          Quero Adotar
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button asChild size="lg" variant="outline">
              <Link to="/adocao">
                Ver Todos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impacto das Doações */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Seu Impacto</h2>
            <p className="text-lg text-gray-700">
              Veja como sua doação pode transformar vidas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactItems.map((item, index) => (
              <Card key={index} className="text-center card-hover">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-accent mb-2">
                    {item.amount}
                  </div>
                  <p className="text-gray-700">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="btn-accent">
              <Link to="/doacoes">
                Fazer Doação Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Histórias de Sucesso */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Histórias de Sucesso</h2>
            <p className="text-lg text-gray-700">
              Transformações que nos motivam a continuar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <Card key={story.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Antes</p>
                      <img
                        src={story.before}
                        alt={`${story.name} antes`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Depois</p>
                      <img
                        src={story.after}
                        alt={`${story.name} depois`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{story.name}</h3>
                  <p className="text-gray-700 text-sm">{story.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="section-padding bg-primary text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Faça parte desta transformação
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Seja através da adoção, doação ou voluntariado, você pode fazer a diferença 
            na vida de um animal que precisa de amor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/adocao">
                <Heart className="w-5 h-5 mr-2" />
                Adotar
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/doacoes">
                <DollarSign className="w-5 h-5 mr-2" />
                Doar
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
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
