const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador padrão se não existir
  const adminEmail = 'admin@amigodosamigos.org';
  const adminPassword = 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Usuário administrador criado');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
  } else {
    console.log('ℹ️  Usuário administrador já existe');
  }

  // Criar configurações iniciais se não existirem
  const existingSettings = await prisma.setting.findFirst();
  if (!existingSettings) {
    await prisma.setting.create({
      data: {
        siteName: 'ONG Amigo dos Amigos',
        logo: '',
        address: 'Rua das Flores, 123 - Centro, Cidade/UF',
        phone: '(11) 99999-9999',
        whatsapp: '(11) 98888-8888',
        email: 'contato@amigodosamigos.org',
        facebook: 'https://facebook.com/amigodosamigos',
        instagram: 'https://instagram.com/amigodosamigos',
        youtube: 'https://youtube.com/c/amigodosamigos',
        tiktok: 'https://tiktok.com/@amigodosamigos'
      }
    });
    console.log('⚙️  Configurações iniciais criadas');
  } else {
    console.log('ℹ️  Configurações já existem');
  }

  // Criar estatísticas iniciais se não existirem
  const stats = await prisma.stats.findFirst();
  if (!stats) {
    await prisma.stats.create({
      data: {
        dogsRescued: 200,
        dogsAdopted: 150,
        volunteers: 30,
        donations: 75000
      }
    });
    console.log('📊 Estatísticas iniciais criadas');
  }

  // Criar cães de exemplo se não existirem
  const sampleDogs = [
    {
      name: 'Rex',
      age: '2 anos',
      size: 'Grande',
      gender: 'Macho',
      breed: 'Labrador',
      temperament: 'Dócil e brincalhão',
      description: 'Rex é um cão muito carinhoso que adora brincar com crianças. Está procurando uma família que possa dar muito amor e atenção.',
      vaccinated: true,
      neutered: true,
      available: true,
      animalType: 'cachorro'
    },
    {
      name: 'Luna',
      age: '1 ano',
      size: 'Médio',
      gender: 'Fêmea',
      breed: 'SRD',
      temperament: 'Calma e afetuosa',
      description: 'Luna é uma cadela muito tranquila e carinhosa. Ideal para famílias que buscam um companheiro fiel.',
      vaccinated: true,
      neutered: true,
      available: true,
      animalType: 'cachorro'
    },
    {
      name: 'Thor',
      age: '3 anos',
      size: 'Grande',
      gender: 'Macho',
      breed: 'Pastor Alemão',
      temperament: 'Protetor e leal',
      description: 'Thor é um cão muito inteligente e protetor. Precisa de uma família experiente com cães de grande porte.',
      vaccinated: true,
      neutered: true,
      available: true,
      animalType: 'cachorro'
    },
    {
      name: 'Bella',
      age: '4 meses',
      size: 'Pequeno',
      gender: 'Fêmea',
      breed: 'Poodle',
      temperament: 'Alegre e esperta',
      description: 'Bella é uma filhote muito vivaz e inteligente. Perfeita para quem quer treinar um cão obediente.',
      vaccinated: false,
      neutered: false,
      available: true,
      animalType: 'cachorro'
    },
    {
      name: 'Max',
      age: '5 anos',
      size: 'Grande',
      gender: 'Macho',
      breed: 'Rotweiller',
      temperament: 'Protetor e calmo',
      description: 'Max é um cão de guarda natural, mas muito carinhoso com a família. Ideal para casas com quintal.',
      vaccinated: true,
      neutered: true,
      available: true,
      animalType: 'cachorro'
    }
  ];

  for (const dog of sampleDogs) {
    const existingDog = await prisma.dog.findFirst({
      where: { name: dog.name }
    });

    if (!existingDog) {
      await prisma.dog.create({ data: dog });
      console.log(`🐕 Cão ${dog.name} criado`);
    }
  }

  // Criar imagens dos cães
  const dogImages = [
    { url: '/images/dogs/rex1.jpg', dogId: 1 },
    { url: '/images/dogs/rex2.jpg', dogId: 1 },
    { url: '/images/dogs/luna1.jpg', dogId: 2 },
    { url: '/images/dogs/thor1.jpg', dogId: 3 },
    { url: '/images/dogs/thor2.jpg', dogId: 3 },
    { url: '/images/dogs/thor3.jpg', dogId: 3 },
    { url: '/images/dogs/bella1.jpg', dogId: 4 },
    { url: '/images/dogs/max1.jpg', dogId: 5 }
  ];

  for (const image of dogImages) {
    const existingImage = await prisma.dogImage.findFirst({
      where: {
        url: image.url,
        dogId: image.dogId
      }
    });

    if (!existingImage) {
      await prisma.dogImage.create({ data: image });
      console.log(`🖼️  Imagem ${image.url} criada para o cão ID ${image.dogId}`);
    }
  }

  // Criar posts de exemplo para o blog
  const samplePosts = [
    {
      title: 'Como Adotar um Cão de Forma Responsável',
      slug: 'como-adotar-cao-responsavel',
      excerpt: 'Dicas importantes para quem está pensando em adotar um cão e quer fazer isso de forma consciente e responsável.',
      content: `# Como Adotar um Cão de Forma Responsável

A adoção de um cão é uma decisão importante que mudará sua vida e a do animal. Aqui estão algumas dicas essenciais:

## Antes da Adoção

- Avalie se você tem tempo e recursos para cuidar de um animal
- Considere o espaço disponível em sua casa
- Pesquise sobre as necessidades da raça ou porte do cão

## Durante o Processo

- Visite o animal várias vezes antes de decidir
- Faça perguntas sobre o histórico de saúde
- Prepare sua casa para receber o novo membro da família

## Após a Adoção

- Mantenha as vacinas em dia
- Proporcione exercícios regulares
- Demonstre muito amor e paciência

Lembre-se: adoção é um compromisso para toda a vida do animal!`,
      category: 'Adoção',
      published: true,
      publishedAt: new Date(),
      image: '/images/blog/adocao-responsavel.jpg'
    },
    {
      title: 'A Importância da Castração',
      slug: 'importancia-castracao',
      excerpt: 'Entenda por que a castração é fundamental para o controle populacional e saúde dos animais.',
      content: `# A Importância da Castração

A castração é um dos procedimentos mais importantes para o bem-estar animal e controle populacional.

## Benefícios para a Saúde

- Previne câncer de mama e útero em fêmeas
- Reduz risco de câncer de próstata em machos
- Diminui comportamentos agressivos

## Controle Populacional

- Evita ninhadas indesejadas
- Reduz o número de animais abandonados
- Contribui para o bem-estar animal

Procure um veterinário de confiança e mantenha seu pet saudável!`,
      category: 'Saúde',
      published: true,
      publishedAt: new Date(),
      image: '/images/blog/castracao.jpg'
    },
    {
      title: 'Alimentação Natural para Cães',
      slug: 'alimentacao-natural-para-cao',
      excerpt: 'Descubra os benefícios da alimentação natural BARF para a saúde do seu cão.',
      content: `# Alimentação Natural para Cães

A dieta BARF (Biologically Appropriate Raw Food) está ganhando popularidade entre tutores conscientes.

## O que é BARF?

BARF significa "Alimentação Biologicamente Apropriada Crua". Esta dieta imita o que cães selvagens comeriam na natureza.

## Benefícios

- Pelagem mais saudável
- Dentes mais limpos
- Fezes menores e menos odor
- Maior energia e vitalidade

Sempre consulte um veterinário especializado antes de mudar a dieta do seu pet.`,
      category: 'Saúde',
      published: true,
      publishedAt: new Date(),
      image: '/images/blog/alimentacao-natural.jpg'
    }
  ];

  for (const post of samplePosts) {
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug: post.slug }
    });

    if (!existingPost) {
      await prisma.blogPost.create({ data: post });
      console.log(`📝 Post \"${post.title}\" criado`);
    }
  }

  // Criar relatórios financeiros de exemplo
  const financialReports = [
    {
      period: 'Janeiro 2025',
      fileName: 'relatorio-janeiro-2025.pdf',
      filePath: '/uploads/financial-reports/relatorio-janeiro-2025.pdf',
      fileSize: 156789,
      uploadedBy: 'Administrador'
    },
    {
      period: 'Fevereiro 2025',
      fileName: 'relatorio-fevereiro-2025.pdf',
      filePath: '/uploads/financial-reports/relatorio-fevereiro-2025.pdf',
      fileSize: 178456,
      uploadedBy: 'Administrador'
    },
    {
      period: 'Março 2025',
      fileName: 'relatorio-marco-2025.pdf',
      filePath: '/uploads/financial-reports/relatorio-marco-2025.pdf',
      fileSize: 201345,
      uploadedBy: 'Administrador'
    }
  ];

  for (const report of financialReports) {
    const existingReport = await prisma.financialReport.findFirst({
      where: { period: report.period }
    });

    if (!existingReport) {
      await prisma.financialReport.create({ data: report });
      console.log(`📑 Relatório financeiro ${report.period} criado`);
    }
  }

  // Criar voluntários de exemplo
  const volunteers = [
    {
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-1111',
      availability: 'Disponível aos sábados e domingos',
      experience: 'Tenho experiência com cachorros desde criança',
      areas: 'Cuidados com animais, Eventos',
      status: 'approved'
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '(11) 99999-2222',
      availability: 'Disponível à noite durante a semana',
      experience: 'Voluntariei em outra ONG por 2 anos',
      areas: 'Marketing, Redes sociais',
      status: 'approved'
    },
    {
      name: 'Mariana Costa',
      email: 'mariana.costa@email.com',
      phone: '(11) 99999-3333',
      availability: 'Disponível aos finais de semana',
      experience: 'Estudante de veterinária',
      areas: 'Saúde animal, Consultas',
      status: 'approved'
    }
  ];

  for (const volunteer of volunteers) {
    const existingVolunteer = await prisma.volunteer.findFirst({
      where: { email: volunteer.email }
    });

    if (!existingVolunteer) {
      await prisma.volunteer.create({ data: volunteer });
      console.log(`🤝 Voluntário ${volunteer.name} criado`);
    }
  }

  // Criar doações de exemplo
  const donations = [
    {
      amount: 100.00,
      currency: 'BRL',
      paymentMethod: 'pix',
      donorName: 'João Pereira',
      donorEmail: 'joao.pereira@email.com',
      recurring: true,
      status: 'paid',
      paidAt: new Date()
    },
    {
      amount: 50.00,
      currency: 'BRL',
      paymentMethod: 'credit_card',
      donorName: 'Maria Santos',
      donorEmail: 'maria.santos@email.com',
      recurring: false,
      status: 'paid',
      paidAt: new Date()
    },
    {
      amount: 200.00,
      currency: 'BRL',
      paymentMethod: 'bank_transfer',
      donorName: 'Empresa ABC Ltda',
      donorEmail: 'contato@empresaabc.com',
      recurring: true,
      status: 'paid',
      paidAt: new Date()
    }
  ];

  for (const donation of donations) {
    await prisma.donation.create({ data: donation });
    console.log(`💰 Doação de R$ ${donation.amount.toFixed(2)} criada`);
  }

  // Criar contatos de exemplo
  const contacts = [
    {
      name: 'Paulo Rodrigues',
      email: 'paulo.rodrigues@email.com',
      subject: 'Interesse em adotar',
      message: 'Gostaria de saber mais sobre o processo de adoção e como posso ajudar.',
      status: 'read'
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      subject: 'Doação de materiais',
      message: 'Tenho alguns cobertores e comedouros que gostaria de doar para a ONG.',
      status: 'unread'
    }
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact });
    console.log(`📨 Contato de ${contact.name} criado`);
  }

  // Criar solicitações de castração social de exemplo
  const socialCastrations = [
    {
      animalName: 'Rex',
      animalSize: 'Grande',
      animalAge: '2 anos',
      animalGender: 'Macho',
      animalSpecies: 'Cachorro',
      animalBreed: 'Labrador',
      animalColor: 'Amarelo',
      animalTemperament: 'Dócil',
      dogRabiesVaccinated: true,
      dogV10Vaccinated: true,
      animalPhoto: '/images/social-castration/rex.jpg',
      tutorName: 'Roberto Almeida',
      tutorBirthDate: new Date('1985-03-15'),
      tutorRG: '12.345.678-9',
      tutorCPF: '123.456.789-00',
      tutorAddress: 'Avenida Central, 456',
      tutorNumber: '100',
      tutorNeighborhood: 'Jardim Primavera',
      tutorPhone: '(11) 99999-4444',
      householdSize: 4,
      totalAnimals: 2,
      hasChildren: true,
      childrenCount: 2,
      monthlyIncome: 'Entre R$ 2.000 e R$ 4.000',
      agreesLowIncome: true,
      status: 'approved'
    },
    {
      animalName: 'Luna',
      animalSize: 'Médio',
      animalAge: '1 ano',
      animalGender: 'Fêmea',
      animalSpecies: 'Cachorro',
      animalBreed: 'SRD',
      animalColor: 'Preto e marrom',
      animalTemperament: 'Calma',
      dogRabiesVaccinated: true,
      dogV10Vaccinated: true,
      animalPhoto: '/images/social-castration/luna.jpg',
      tutorName: 'Cláudia Mendes',
      tutorBirthDate: new Date('1990-07-22'),
      tutorRG: '23.456.789-0',
      tutorCPF: '234.567.890-11',
      tutorAddress: 'Travessa das Palmeiras, 789',
      tutorNumber: '50',
      tutorNeighborhood: 'Vila Verde',
      tutorPhone: '(11) 99999-5555',
      householdSize: 3,
      totalAnimals: 1,
      hasChildren: true,
      childrenCount: 1,
      monthlyIncome: 'Entre R$ 1.000 e R$ 2.000',
      agreesLowIncome: true,
      status: 'approved'
    }
  ];

  for (const request of socialCastrations) {
    await prisma.socialCastration.create({ data: request });
    console.log(`📋 Solicitação de castração para ${request.animalName} criada`);
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });