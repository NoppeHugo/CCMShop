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
  { name: 'SUPABASE_URL', value: process.env.SUPABASE_URL, required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY, required: true }
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
  'server-supabase.js',
  'config/supabase.js',
  'services/productsService.js',
  'sql/schema.sql',
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
    { name: 'Start Command', pattern: /startCommand:\s*node server-supabase\.js/, required: true },
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

const missingSupabaseUrl = !process.env.SUPABASE_URL;
const missingSupabaseKey = !process.env.SUPABASE_SERVICE_ROLE_KEY;

if (missingSupabaseUrl || missingSupabaseKey) {
  console.log(`${checkColors.RED}❌ Configuration Supabase incomplète${checkColors.RESET}`);
  console.log('');
  console.log('1. Créer un projet sur https://supabase.com');
  console.log('2. Exécuter le fichier sql/schema.sql dans Supabase');
  console.log('3. Configurer les variables d\'environnement :');
  if (missingSupabaseUrl) console.log('   - SUPABASE_URL=https://[projet].supabase.co');
  if (missingSupabaseKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY=eyJ[service-role-key]');
  console.log('4. Redémarrer le serveur');
} else {
  console.log(`${checkColors.GREEN}✅ Configuration complète !${checkColors.RESET}`);
  console.log('');
  console.log('Pour déployer sur Railway :');
  console.log('1. Configurer les variables dans Railway Dashboard');
  console.log('2. git add . && git commit -m "feat: Migration Supabase"');
  console.log('3. git push origin main');
  console.log('');
  console.log('Pour tester localement :');
  console.log('node test-supabase.js');
  console.log('node server-supabase.js');
}

console.log('');
console.log(`${checkColors.BLUE}📚 Documentation${checkColors.RESET}`);
console.log('- Guide complet: docs/deployment-supabase.md');
console.log('- Setup Supabase: docs/supabase-setup.md');
console.log('- Comparaison serveurs: backend/README-servers.md');
