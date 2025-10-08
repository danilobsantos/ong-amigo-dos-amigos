const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando setup do banco de dados...');

    // Criar usuário administrador padrão
    const adminEmail = 'admin@amigodosamigos.org';
    const adminPassword = 'admin123'; // Alterar em produção
    
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
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      console.log('ℹ️  Usuário administrador já existe');
    }

    // Criar configurações iniciais
    const existingSettings = await prisma.setting.findFirst();
    if (!existingSettings) {
      await prisma.setting.create({
        data: {
          siteName: 'ONG Amigo dos Amigos',
          logo: '',
          address: '',
          phone: '',
          whatsapp: '',
          email: ''
        }
      });
      console.log('⚙️  Configurações iniciais criadas');
    } else {
      console.log('ℹ️  Configurações já existem');
    }

    // Criar dados de exemplo para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      await createSampleData();
    }

    console.log('✅ Setup do banco de dados concluído!');
  } catch (error) {
    console.error('❌ Erro no setup do banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSampleData() {
  console.log('📝 Criando dados de exemplo...');

  // Criar cães de exemplo
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
      images: {
        create: [
          { url: "/images/dogs/rex1.jpg" },
          { url: "/images/dogs/rex2.jpg" }
        ]
    }
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
      images: {
        create: [
          { url: "/images/dogs/luna1.jpg" }
        ]
    }
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
      images: {
        create: [
          { url: "/images/dogs/thor1.jpg" },
          { url: "/images/dogs/thor2.jpg" },
          { url: "/images/dogs/thor3.jpg" },
        ]
    }
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

  // Criar posts de exemplo para o blog
  const samplePosts = [
    {
      title: 'Como Adotar um Cão de Forma Responsável',
      slug: 'como-adotar-cao-responsavel',
      excerpt: 'Dicas importantes para quem está pensando em adotar um cão e quer fazer isso de forma consciente e responsável.',
      content: `
# Como Adotar um Cão de Forma Responsável

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

Lembre-se: adoção é um compromisso para toda a vida do animal!
      `,
      category: 'Adoção',
      published: true,
      publishedAt: new Date(),
      image: '/images/blog/adocao-responsavel.jpg'
    },
    {
      title: 'A Importância da Castração',
      slug: 'importancia-castracao',
      excerpt: 'Entenda por que a castração é fundamental para o controle populacional e saúde dos animais.',
      content: `
# A Importância da Castração

A castração é um dos procedimentos mais importantes para o bem-estar animal e controle populacional.

## Benefícios para a Saúde

- Previne câncer de mama e útero em fêmeas
- Reduz risco de câncer de próstata em machos
- Diminui comportamentos agressivos

## Controle Populacional

- Evita ninhadas indesejadas
- Reduz o número de animais abandonados
- Contribui para o bem-estar animal

Procure um veterinário de confiança e mantenha seu pet saudável!
      `,
      category: 'Saúde',
      published: true,
      publishedAt: new Date(),
      image: '/images/blog/castracao.jpg'
    }
  ];

  for (const post of samplePosts) {
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug: post.slug }
    });

    if (!existingPost) {
      await prisma.blogPost.create({ data: post });
      console.log(`📝 Post "${post.title}" criado`);
    }
  }

  // Criar estatísticas iniciais
  const stats = await prisma.stats.findFirst();
  if (!stats) {
    await prisma.stats.create({
      data: {
        dogsRescued: 150,
        dogsAdopted: 120,
        volunteers: 25,
        donations: 50000
      }
    });
    console.log('📊 Estatísticas iniciais criadas');
  }

  console.log('✅ Dados de exemplo criados com sucesso!');
}

// Executar setup se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, createSampleData };