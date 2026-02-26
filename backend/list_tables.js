const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SHOW TABLES`;
    console.log('--- Tables ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error listing tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
