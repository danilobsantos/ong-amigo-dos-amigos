import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, Target, Eye, Handshake, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OptimizedImage, { ImageGallery } from '@/components/OptimizedImage';

const About = () => {
  const team = [
    {
      name: 'Maria Silva',
      role: 'Fundadora e Presidente',
      image: '/api/placeholder/200/200',
      description: 'Veterinária com 15 anos de experiência, dedicada ao bem-estar animal.'
    },
    {
      name: 'João Santos',
      role: 'Coordenador de Resgates',
      image: '/api/placeholder/200/200',
      description: 'Especialista em resgates de emergência e primeiros socorros.'
    },
    {
      name: 'Ana Costa',
      role: 'Responsável por Adoções',
      image: '/api/placeholder/200/200',
      description: 'Psicóloga especializada em comportamento animal e adoção responsável.'
    },
    {
      name: 'Carlos Oliveira',
      role: 'Tesoureiro',
      image: '/api/placeholder/200/200',
      description: 'Contador responsável pela transparência financeira da ONG.'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Amor Incondicional',
      description: 'Acreditamos que todo animal merece amor, cuidado e respeito, independentemente de sua condição.'
    },
    {
      icon: Handshake,
      title: 'Adoção Responsável',
      description: 'Promovemos adoções conscientes, garantindo que cada animal encontre o lar ideal.'
    },
    {
      icon: Target,
      title: 'Transparência',
      description: 'Mantemos total transparência em nossas ações e no uso dos recursos recebidos.'
    },
    {
      icon: Users,
      title: 'Trabalho em Equipe',
      description: 'Valorizamos a colaboração entre voluntários, parceiros e a comunidade.'
    }
  ];

  const achievements = [
    { number: '500+', label: 'Cães Resgatados' },
    { number: '350+', label: 'Adoções Realizadas' },
    { number: '10+', label: 'Voluntários Ativos' },
    { number: '15', label: 'Anos de Atividade' }
  ];

  const galleryImages = [
    '/images/imagem1.jpg',
    '/images/imagem2.jpg',
    '/images/imagem3.jpg',
    '/images/imagem4.jpg',
    '/images/imagem5.jpg',
    '/images/imagem6.jpg'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white section-padding">
        <div className="container-max text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre Nós</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Conheça nossa história, nossa equipe e nosso compromisso com o bem-estar animal.
          </p>
        </div>
      </section>

      {/* Nossa História (texto fornecido pelo cliente) */}
      <section className="section-padding">
        <div className="container-max">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">NOSSA HISTÓRIA</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed mx-auto max-w-2xl">
                <p className="text-center">
                  Fundada em 16 de setembro de 2013 e formalizada em 9 de maio de 2014, a ONG Amigo dos Amigos começou como um grupo de voluntários apaixonados pela causa animal. Desde então, contamos com diretores e colaboradores que doam tempo e esforço sem remuneração. A partir de outubro de 2017, recebemos apoio do Poder Público, fortalecendo nossa missão.
                </p>

                <p className="text-center">
                  Nosso foco é a castração, a melhor solução para saúde e controle populacional. Não resgatamos animais saudáveis, mas oferecemos espaço transitório para os que precisam de cuidados. Nosso Centro de Proteção Animal funciona como Lar Temporário, priorizando adoção responsável.
                </p>

              </div>
            </div>

            {/* Mosaico de fotos (thumbnails em linha) */}
            <div>
              <h3 className="text-2xl text-center font-semibold mb-4">Fotos</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {galleryImages.map((src, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg">
                    <OptimizedImage
                      src={src}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-28 md:h-32 object-cover rounded-lg"
                      width={400}
                      height={240}
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Missão, Visão e Valores</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardContent className="p-8">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Missão</h3>
                <p className="text-gray-600">
                  Respeito à vida animal. Resgatar, reabilitar e encontrar lares amorosos para cães em situação de 
                  vulnerabilidade, promovendo a adoção responsável e o bem-estar animal.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Visão</h3>
                <p className="text-gray-600">
                  Ser referência em proteção animal, criando uma sociedade onde todos os 
                  pets tenham direito a uma vida digna e cheia de amor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Valores</h3>
                <p className="text-gray-600">
                  Amor, respeito, transparência, responsabilidade e dedicação incondicional 
                  ao bem-estar de todos os animais sob nossos cuidados.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Valores Detalhados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Conquistas */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nossas Conquistas</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Números que representam vidas transformadas e o impacto positivo do nosso trabalho.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <p className="text-gray-600 font-medium">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nossa Equipe</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça as pessoas dedicadas que tornam nosso trabalho possível.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center card-hover">
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-primary text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold mb-6">Faça Parte da Nossa História</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a nós nesta missão de transformar vidas. Seja através da adoção, 
            doação ou voluntariado, você pode fazer a diferença.
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

export default About;
