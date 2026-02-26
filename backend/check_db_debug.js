const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const dogs = await prisma.dog.findMany({
      include: { images: true },
      take: 5
    });
    
    console.log('--- Dogs and Images ---');
    dogs.forEach(dog => {
      console.log(`Dog: ${dog.name} (ID: ${dog.id})`);
      dog.images.forEach(img => {
        console.log(`  Image URL: ${img.url}`);
      });
    });
  } catch (err) {
    console.error('Error fetching dogs:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
