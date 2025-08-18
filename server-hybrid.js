require('dotenv').config({ path: __dirname + '/backend/.env' });
const http = require('http');
const url = require('url');

// Test de la configuration PostgreSQL/Prisma
let useDatabase = false;
let productsService = null;

try {
  if (process.env.DATABASE_URL) {
    const { testConnection } = require('./backend/config/supabase');
    productsService = require('./backend/services/productsService');

    // Test connexion au démarrage
    testConnection().then(ok => {
      if (ok) {
        console.log('✅ PostgreSQL/Prisma activé');
        useDatabase = true;
      } else {
        console.log('❌ Connexion DB échouée, utilisation données hardcodées');
        useDatabase = false;
      }
    }).catch(error => {
      console.log('❌ Erreur test DB, utilisation données hardcodées');
      useDatabase = false;
    });
  } else {
    console.log('⚠️ DATABASE_URL manquante, utilisation données hardcodées');
  }
} catch (error) {
  console.log('⚠️ Test DB échoué, utilisation données hardcodées');
}

// Données de fallback (si la base de données n'est pas disponible)
const fallbackProducts = [
  {
    id: 1,
    name: "Collier Élégance Dorée",
    description: "Magnifique collier en plaqué or avec pendentif en forme de coeur",
    price: 89.99,
    category: "colliers",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Collier+Doré"],
    stock: 15,
    featured: true
  },
  {
    id: 2,
    name: "Boucles d'Oreilles Perles Nacrées",
    description: "Boucles d'oreilles délicates avec perles nacrées authentiques",
    price: 45.50,
    category: "boucles-oreilles",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Boucles+Perles"],
    stock: 8,
    featured: false
  },
  {
    id: 3,
    name: "Bracelet Argent Infinity",
    description: "Bracelet en argent sterling avec charm infini, symbole d'amour éternel",
    price: 65.00,
    category: "bracelets",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Bracelet+Infinity"],
    stock: 12,
    featured: true
  },
  {
    id: 4,
    name: "Bague Solitaire Rose",
    description: "Bague délicate en or rose avec cristal étincelant",
    price: 120.00,
    category: "bagues",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Bague+Rose"],
    stock: 5,
    featured: true
  }
];

const server = http.createServer(async (req, res) => {
  // Headers CORS
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://ccm-shop.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Gérer les requêtes OPTIONS (préflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`${req.method} ${path} (${useDatabase ? 'Database' : 'Fallback'})`);

  // Route de base
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'API E-commerce Bijoux - Configuration Hybride ✨',
      version: '2.1.0',
      status: 'active',
      database: useDatabase ? 'PostgreSQL (Prisma)' : 'Fallback (hardcoded)',
      dbStatus: useDatabase ? 'Connecté' : 'Non configuré ou erreur',
      variables: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Configuré' : 'Manquant'
      },
      endpoints: [
        'GET / - Cette page avec diagnostic',
        'GET /api/products - Liste des produits',
        'GET /api/products/:id - Détail d\'un produit'
      ]
    }));
    return;
  }

  // Route produits - GET /api/products
  if (path === '/api/products' && req.method === 'GET') {
    try {
      let products = [];
      
          if (useDatabase && productsService) {
            // Utiliser la base PostgreSQL via Prisma
            const result = await productsService.getAllProducts(query);
            if (result.success) {
              products = result.data;
            } else {
              console.log('Erreur DB, fallback vers données hardcodées');
              products = fallbackProducts;
            }
          } else {
            // Utiliser données hardcodées
            products = fallbackProducts;
          }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: products.length,
    source: useDatabase ? 'database' : 'fallback',
        data: products
      }));
    } catch (error) {
      console.error('Erreur API products:', error);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: fallbackProducts.length,
        source: 'fallback-error',
        data: fallbackProducts
      }));
    }
    return;
  }

  // Route 404
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Route non trouvée',
    message: 'Cette route n\'existe pas sur notre API'
  }));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur hybride démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Base de données: ${useDatabase ? 'PostgreSQL (Prisma)' : 'Fallback hardcoded'}`);
  console.log(`📊 Test: http://0.0.0.0:${PORT}/api/products`);
  console.log(`🔧 Variables: DATABASE_URL=${process.env.DATABASE_URL ? 'OK' : 'MISSING'}`);
});
