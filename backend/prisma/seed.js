const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: __dirname + '/../.env' });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@local';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', email);
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      password: hashed,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created:', email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
