require('dotenv').config({ path: __dirname + '/.env' });
const http = require('http');
const url = require('url');
const { testConnection } = require('./config/supabase');
const productsService = require('./services/productsService');

// Test de la connexion Supabase au démarrage
testConnection();

const server = http.createServer(async (req, res) => {
  // Headers CORS
  const allowedOrigins = [
    'http://localhost:5173',
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

  console.log(`${req.method} ${path}`);

  // Route de base
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'API E-commerce Bijoux avec Supabase ✨',
      version: '2.0.0',
      status: 'active',
      database: 'Supabase',
      endpoints: [
        'GET / - Cette page',
        'GET /api/products - Liste des produits',
        'GET /api/products/:id - Détail d\'un produit',
        'POST /api/products - Créer un produit',
        'PUT /api/products/:id - Modifier un produit',
        'DELETE /api/products/:id - Supprimer un produit'
      ]
    }));
    return;
  }

  // Route produits - GET /api/products
  if (path === '/api/products' && req.method === 'GET') {
    try {
      const result = await productsService.getAllProducts(query);
      
      if (result.success) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          count: result.count,
          data: result.data
        }));
      } else {
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: result.error
        }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des produits'
      }));
    }
    return;
  }

  // Route produit par ID - GET /api/products/:id
  if (path.startsWith('/api/products/') && req.method === 'GET') {
    try {
      const id = parseInt(path.split('/')[3]);
      const result = await productsService.getProductById(id);
      
      if (result.success) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: result.data
        }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: result.error || 'Produit non trouvé'
        }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération du produit'
      }));
    }
    return;
  }

  // Route création produit - POST /api/products
  if (path === '/api/products' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const productData = JSON.parse(body);
        const result = await productsService.createProduct(productData);
        
        if (result.success) {
          res.writeHead(201);
          res.end(JSON.stringify({
            success: true,
            message: 'Produit créé avec succès',
            data: result.data
          }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: result.error
          }));
        }
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: 'Erreur lors de la création du produit'
        }));
      }
    });
    return;
  }

  // Route commandes - POST /api/orders
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
  console.log(`🚀 Serveur démarré avec Supabase sur le port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Base de données: Supabase`);
  console.log(`📊 Test API: http://0.0.0.0:${PORT}/api/products`);
});
