const { PrismaClient } = require('@prisma/client');

// Initialiser Prisma
const prisma = new PrismaClient();

// Test de connexion simple
const testConnection = async () => {
  try {
    // Petite requete simple pour vérifier la connexion
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion PostgreSQL/Prisma réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion PostgreSQL/Prisma:', error.message);
    return false;
  }
};

module.exports = {
  prisma,
  testConnection
};
