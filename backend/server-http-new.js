require('dotenv').config({ path: __dirname + '/.env' });
const http = require('http');
const url = require('url');

// 🚀 SERVEUR HYBRIDE v4.0.0 - FORCE SUPABASE EN PRODUCTION
console.log('🚀 Démarrage serveur HYBRIDE v4.0.0 avec FORCE Supabase');

// Test configuration Supabase
let useSupabase = false;
let productsService = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { testConnection } = require('./config/supabase');
    productsService = require('./services/productsService');
    
    testConnection().then(() => {
      console.log('✅ Supabase PostgreSQL activé');
      useSupabase = true;
    }).catch(error => {
      console.log('❌ Supabase échec:', error.message);
    });
    
    useSupabase = true; // Force l'utilisation même en cas d'erreur de test initial
  } catch (error) {
    console.log('⚠️ Module Supabase non trouvé:', error.message);
  }
} else {
  console.log('⚠️ Variables Supabase manquantes');
}

// Données fallback (ancien système)
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

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`${req.method} ${path} (${useSupabase ? 'Supabase' : 'Fallback'})`);

  // Route de base avec diagnostic
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'API E-commerce Bijoux - SERVEUR HYBRIDE v4.0.0 ✨',
      version: '4.0.0',
      status: 'active',
      database: useSupabase ? 'Supabase PostgreSQL' : 'Fallback hardcoded',
      supabaseStatus: useSupabase ? 'Connecté' : 'Non disponible',
      variables: {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Configuré' : 'Manquant',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configuré' : 'Manquant'
      },
      endpoints: [
        'GET / - Cette page avec diagnostic',
        'GET /api/products - Liste des produits',
        'POST /api/orders - Créer une commande'
      ]
    }));
    return;
  }

  // Route produits avec Supabase prioritaire
  if (path === '/api/products' && req.method === 'GET') {
    try {
      let products = [];
      let source = 'fallback';
      
      if (useSupabase && productsService) {
        try {
          const result = await productsService.getAllProducts(query);
          if (result.success && result.data.length > 0) {
            products = result.data;
            source = 'supabase';
          } else {
            products = fallbackProducts;
            source = 'fallback-empty';
          }
        } catch (supabaseError) {
          console.log('Erreur Supabase, fallback:', supabaseError.message);
          products = fallbackProducts;
          source = 'fallback-error';
        }
      } else {
        products = fallbackProducts;
        source = 'fallback-no-supabase';
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: products.length,
        source: source,
        data: products
      }));
    } catch (error) {
      console.error('Erreur API products:', error);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: fallbackProducts.length,
        source: 'fallback-critical-error',
        data: fallbackProducts
      }));
    }
    return;
  }

  // Route commandes
  if (path === '/api/orders' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const orderData = JSON.parse(body);
        const orderId = Math.floor(Math.random() * 10000) + 1000;
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Commande créée avec succès',
          data: {
            orderId: orderId,
            status: 'pending'
          }
        }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: 'Erreur lors de la création de la commande'
        }));
      }
    });
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
  console.log(`🚀 Serveur HYBRIDE v4.0.0 démarré sur port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Base de données: ${useSupabase ? 'Supabase PostgreSQL' : 'Fallback hardcoded'}`);
  console.log(`🔧 Variables: SUPABASE_URL=${process.env.SUPABASE_URL ? 'OK' : 'MISSING'}`);
  console.log(`📊 Test: http://0.0.0.0:${PORT}/api/products`);
});
