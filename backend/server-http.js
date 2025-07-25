const http = require('http');
const url = require('url');

// Données temporaires pour les produits
const products = [
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

const server = http.createServer((req, res) => {
  // Headers CORS - Accepter localhost et Vercel
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ccm-jewelry.vercel.app',
    'https://ccm-jewelry-hugons-projects-b1234567.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Par défaut, accepter localhost en développement
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
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
      message: 'API E-commerce Bijoux - Serveur démarré avec succès ✨',
      version: '1.0.0',
      status: 'active',
      endpoints: [
        'GET / - Cette page',
        'GET /api/products - Liste des produits',
        'GET /api/products/:id - Détail d\'un produit'
      ]
    }));
    return;
  }

  // Route produits
  if (path === '/api/products' && req.method === 'GET') {
    try {
      let filteredProducts = [...products];
      
      // Filtrer par catégorie
      if (query.category) {
        filteredProducts = filteredProducts.filter(p => p.category === query.category);
      }
      
      // Filtrer les produits mis en avant
      if (query.featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }
      
      // Limiter le nombre de résultats
      if (query.limit) {
        filteredProducts = filteredProducts.slice(0, parseInt(query.limit));
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: filteredProducts.length,
        data: filteredProducts
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des produits'
      }));
    }
    return;
  }

  // Route produit par ID
  if (path.startsWith('/api/products/') && req.method === 'GET') {
    try {
      const id = parseInt(path.split('/')[3]);
      const product = products.find(p => p.id === id);
      
      if (!product) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Produit non trouvé'
        }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: product
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération du produit'
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
  console.log(`🚀 Serveur HTTP démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`📊 Test API: http://0.0.0.0:${PORT}/api/products`);
});
