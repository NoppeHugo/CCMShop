require('dotenv').config();

const checkColors = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

console.log(`${checkColors.BLUE}🔍 Vérification Configuration Déploiement CCM${checkColors.RESET}\n`);

// Vérification des variables d'environnement
console.log(`${checkColors.YELLOW}📋 Variables d'Environnement${checkColors.RESET}`);

const requiredEnvVars = [
  { name: 'NODE_ENV', value: process.env.NODE_ENV, required: false },
  { name: 'PORT', value: process.env.PORT, required: false },
  { name: 'DATABASE_URL', value: process.env.DATABASE_URL, required: true }
];

requiredEnvVars.forEach(envVar => {
  const status = envVar.value ? 
    `${checkColors.GREEN}✅ Configuré${checkColors.RESET}` : 
    envVar.required ? 
      `${checkColors.RED}❌ MANQUANT (Requis)${checkColors.RESET}` : 
      `${checkColors.YELLOW}⚠️ Optionnel${checkColors.RESET}`;
  
  const displayValue = envVar.value ? 
    (envVar.name.includes('KEY') ? '[Masqué pour sécurité]' : envVar.value) : 
    'Non défini';
    
  console.log(`${envVar.name}: ${status}`);
  console.log(`  Valeur: ${displayValue}\n`);
});

// Vérification des fichiers
console.log(`${checkColors.YELLOW}📁 Fichiers Requis${checkColors.RESET}`);

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server-production.js',
  'config/supabase.js', // now holds Prisma client
  'services/productsService.js',
  'prisma/schema.prisma',
  '.env',
  'railway.toml'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? 
    `${checkColors.GREEN}✅ Présent${checkColors.RESET}` : 
    `${checkColors.RED}❌ Manquant${checkColors.RESET}`;
  
  console.log(`${file}: ${status}`);
});

console.log('');

// Vérification configuration Railway
console.log(`${checkColors.YELLOW}🚂 Configuration Railway${checkColors.RESET}`);

try {
  const railwayConfig = fs.readFileSync(path.join(__dirname, 'railway.toml'), 'utf8');
  
  const checks = [
      { name: 'Start Command', pattern: /startCommand:\s*node server-production\.js/, required: true },
      { name: 'Health Check', pattern: /healthcheckPath:\s*\//, required: false },
      { name: 'Restart Policy', pattern: /restartPolicyType:\s*on-failure/, required: false }
    ];
  
  checks.forEach(check => {
    const found = check.pattern.test(railwayConfig);
    const status = found ? 
      `${checkColors.GREEN}✅ Configuré${checkColors.RESET}` : 
      check.required ? 
        `${checkColors.RED}❌ Non configuré${checkColors.RESET}` : 
        `${checkColors.YELLOW}⚠️ Optionnel${checkColors.RESET}`;
    
    console.log(`${check.name}: ${status}`);
  });
} catch (error) {
  console.log(`railway.toml: ${checkColors.RED}❌ Erreur de lecture${checkColors.RESET}`);
}

console.log('');

// Instructions de déploiement
console.log(`${checkColors.BLUE}🚀 Prochaines Étapes${checkColors.RESET}`);

const missingDatabaseUrl = !process.env.DATABASE_URL;

if (missingDatabaseUrl) {
  console.log(`${checkColors.RED}❌ DATABASE_URL manquante${checkColors.RESET}`);
  console.log('');
  console.log('1. Installer PostgreSQL ou utiliser un service géré (Railway PostgreSQL ou autre)');
  console.log('2. Mettre à jour la variable d\'environnement DATABASE_URL dans .env');
  console.log('3. Exécuter les migrations Prisma: npx prisma migrate dev --name init');
  console.log('4. Redémarrer le serveur');
} else {
  console.log(`${checkColors.GREEN}✅ Configuration minimale présente (DATABASE_URL)${checkColors.RESET}`);
  console.log('');
  console.log('Pour déployer sur Railway/Serveur :');
  console.log('1. Configurer DATABASE_URL dans le dashboard');
  console.log('2. git add . && git commit -m "chore: switch to Prisma/Postgres"');
  console.log('3. git push origin main');
  console.log('');
  console.log('Pour tester localement :');
  console.log('node test-db.js  # tester la connexion (Prisma)');
  console.log('node server-production.js  # démarrer le serveur de production');
}

console.log('');
console.log(`${checkColors.BLUE}📚 Documentation${checkColors.RESET}`);
console.log('- Guide complet: docs/deployment-postgres.md');
console.log('- Setup Prisma/Postgres: docs/prisma-setup.md');
console.log('- Comparaison serveurs: backend/README-servers.md');
