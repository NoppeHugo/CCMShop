require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/supabase');

async function tryCreate(modelName, email, hash) {
  if (!prisma[modelName] || typeof prisma[modelName].upsert !== 'function') return false;
  try {
    const user = await prisma[modelName].upsert({
      where: { email },
      update: { password: hash, role: 'admin' },
      create: { email, password: hash, role: 'admin' }
    });
    console.log(`✅ Admin created/updated in model "${modelName}": ${user.email || user}`);
    return true;
  } catch (e) {
    console.warn(`⚠️ upsert failed on "${modelName}": ${e.message}`);
    return false;
  }
}

(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@local';
  const password = process.env.ADMIN_PASSWORD || 'change_me';
  const hash = await bcrypt.hash(password, 10);

  const candidates = [
    'adminUser','AdminUser','admin','Admin','user','User',
    'admin_user','admin_users','admin_account','adminuser'
  ];

  for (const m of candidates) {
    const ok = await tryCreate(m, email, hash);
    if (ok) process.exit(0);
  }

  // fallback: raw SQL into common table name
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO admin_users (email, password, role) VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password`,
      email, hash
    );
    console.log('✅ Admin created via SQL in admin_users');
    process.exit(0);
  } catch (e) {
    console.error('❌ Could not create admin automatically. Check Prisma schema and tables.', e.message);
    process.exit(1);
  }
})();