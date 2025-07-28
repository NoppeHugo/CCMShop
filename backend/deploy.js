#!/usr/bin/env node

// Script de déploiement automatisé pour CCM avec Supabase
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

function log(message, color = colors.RESET) {
  console.log(`${color}${message}${colors.RESET}`);
}

function execCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(`\n🔄 ${description}...`, colors.YELLOW);
    log(`Commande: ${command}`, colors.BLUE);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Erreur: ${error.message}`, colors.RED);
        reject(error);
        return;
      }
      
      if (stderr && !stderr.includes('warning')) {
        log(`⚠️ Warning: ${stderr}`, colors.YELLOW);
      }
      
      if (stdout) {
        log(`✅ ${stdout.trim()}`, colors.GREEN);
      }
      
      resolve(stdout);
    });
  });
}

async function deployToRailway() {
  try {
    log('🚀 Déploiement CCM avec Supabase sur Railway', colors.BLUE);
    log('=' .repeat(50), colors.BLUE);
    
    // Vérification des fichiers requis
    log('\n📋 Vérification des fichiers...', colors.YELLOW);
    
    const requiredFiles = [
      'server-supabase.js',
      'config/supabase.js',
      'services/productsService.js',
      'sql/schema.sql',
      'railway.toml'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        throw new Error(`Fichier manquant: ${file}`);
      }
    }
    log('✅ Tous les fichiers requis sont présents', colors.GREEN);
    
    // Vérification Git
    await execCommand('git status --porcelain', 'Vérification du statut Git');
    
    // Installation des dépendances
    log('\n📦 Installation des dépendances...', colors.YELLOW);
    await execCommand('npm install @supabase/supabase-js', 'Installation Supabase client');
    
    // Ajout des fichiers au commit
    await execCommand('git add .', 'Ajout des fichiers à Git');
    
    // Commit
    const commitMessage = `feat: Migration vers Supabase PostgreSQL

- Ajout configuration Supabase
- Nouveau serveur avec base de données
- Services CRUD complets
- Schema SQL avec données d'exemple
- Documentation de déploiement

Déployé le: ${new Date().toLocaleString('fr-FR')}`;
    
    await execCommand(`git commit -m "${commitMessage}"`, 'Création du commit');
    
    // Push vers Railway
    await execCommand('git push origin main', 'Push vers Railway');
    
    log('\n🎉 Déploiement terminé !', colors.GREEN);
    log('=' .repeat(30), colors.GREEN);
    
    log('\n📋 Prochaines étapes :', colors.BLUE);
    log('1. Configurer les variables Supabase dans Railway Dashboard :', colors.YELLOW);
    log('   - SUPABASE_URL=https://[projet].supabase.co');
    log('   - SUPABASE_SERVICE_ROLE_KEY=eyJ[service-role-key]');
    log('\n2. Vérifier le déploiement :', colors.YELLOW);
    log('   - https://ccmshop-production.up.railway.app/api/products');
    log('\n3. Tester le frontend :', colors.YELLOW);
    log('   - https://ccm-shop.vercel.app');
    
    log('\n📚 Documentation :', colors.BLUE);
    log('   - docs/deployment-supabase.md (Guide complet)');
    log('   - docs/supabase-setup.md (Configuration Supabase)');
    
  } catch (error) {
    log(`\n❌ Erreur de déploiement: ${error.message}`, colors.RED);
    
    log('\n🔧 Solutions possibles :', colors.YELLOW);
    log('1. Vérifier que tous les fichiers sont présents');
    log('2. Vérifier la connexion Git');
    log('3. Vérifier les permissions Railway');
    log('4. Consulter docs/deployment-supabase.md');
    
    process.exit(1);
  }
}

// Vérification des arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('🚀 Script de Déploiement CCM avec Supabase', colors.BLUE);
  log('');
  log('Usage: node deploy.js [options]', colors.YELLOW);
  log('');
  log('Options:');
  log('  --help, -h     Afficher cette aide');
  log('  --check, -c    Vérifier seulement la configuration');
  log('');
  log('Ce script va :');
  log('1. Vérifier les fichiers requis');
  log('2. Installer les dépendances');
  log('3. Commiter les changements');
  log('4. Déployer sur Railway');
  log('');
  log('Prérequis :');
  log('- Projet Railway configuré');
  log('- Git configuré');
  log('- Fichiers Supabase présents');
  
  process.exit(0);
}

if (args.includes('--check') || args.includes('-c')) {
  log('🔍 Vérification de la configuration seulement...', colors.BLUE);
  exec('node check-deployment.js', (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    process.exit(error ? 1 : 0);
  });
} else {
  // Déploiement complet
  deployToRailway();
}
