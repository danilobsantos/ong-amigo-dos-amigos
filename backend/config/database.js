const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Conectar ao banco de dados
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados MySQL');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

// Desconectar do banco de dados
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};
