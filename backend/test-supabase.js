require('dotenv').config();
const { testConnection } = require('./config/supabase');
const productsService = require('./services/productsService');

const testColors = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

async function runTests() {
  console.log(`${testColors.BLUE}🚀 Test de l'intégration Supabase${testColors.RESET}\n`);
  
  // Test 1: Connexion Supabase
  console.log(`${testColors.YELLOW}Test 1: Connexion Supabase${testColors.RESET}`);
  try {
    await testConnection();
    console.log(`${testColors.GREEN}✅ Connexion Supabase réussie${testColors.RESET}\n`);
  } catch (error) {
    console.log(`${testColors.RED}❌ Erreur de connexion: ${error.message}${testColors.RESET}\n`);
    return;
  }

  // Test 2: Récupération des produits
  console.log(`${testColors.YELLOW}Test 2: Récupération des produits${testColors.RESET}`);
  try {
    const result = await productsService.getAllProducts();
    if (result.success) {
      console.log(`${testColors.GREEN}✅ ${result.count} produits récupérés${testColors.RESET}`);
      console.log(`Premiers produits:`, result.data.slice(0, 2));
    } else {
      console.log(`${testColors.RED}❌ Erreur: ${result.error}${testColors.RESET}`);
    }
  } catch (error) {
    console.log(`${testColors.RED}❌ Erreur: ${error.message}${testColors.RESET}`);
  }
  console.log('');

  // Test 3: Création d'un produit de test
  console.log(`${testColors.YELLOW}Test 3: Création d'un produit de test${testColors.RESET}`);
  try {
    const testProduct = {
      name: 'Collier Test ' + Date.now(),
      description: 'Produit de test créé automatiquement',
      price: 29.99,
      category: 'colliers',
      stock: 5,
      images: ['https://example.com/test.jpg'],
      featured: false
    };

    const result = await productsService.createProduct(testProduct);
    if (result.success) {
      console.log(`${testColors.GREEN}✅ Produit créé avec l'ID: ${result.data.id}${testColors.RESET}`);
      
      // Test 4: Récupération du produit créé
      console.log(`${testColors.YELLOW}Test 4: Récupération du produit créé${testColors.RESET}`);
      const getResult = await productsService.getProductById(result.data.id);
      if (getResult.success) {
        console.log(`${testColors.GREEN}✅ Produit récupéré: ${getResult.data.name}${testColors.RESET}`);
      } else {
        console.log(`${testColors.RED}❌ Erreur de récupération: ${getResult.error}${testColors.RESET}`);
      }
    } else {
      console.log(`${testColors.RED}❌ Erreur de création: ${result.error}${testColors.RESET}`);
    }
  } catch (error) {
    console.log(`${testColors.RED}❌ Erreur: ${error.message}${testColors.RESET}`);
  }

  console.log(`\n${testColors.BLUE}🏁 Tests terminés${testColors.RESET}`);
}

// Vérification des variables d'environnement
console.log(`${testColors.BLUE}🔧 Vérification de la configuration${testColors.RESET}`);
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configuré' : '❌ Manquant'}`);
console.log('');

runTests().catch(console.error);
