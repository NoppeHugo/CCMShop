const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API E-commerce Bijoux - Serveur démarré avec succès ✨',
    version: '1.0.0',
    status: 'active',
    endpoints: [
      'GET / - Cette page',
      'GET /api/products - Liste des produits',
      'GET /api/products/:id - Détail d\'un produit',
      'POST /api/orders - Créer une commande'
    ]
  });
});

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

// Routes API
// GET /api/products - Récupérer tous les produits
app.get('/api/products', (req, res) => {
  try {
    const { category, featured, limit } = req.query;
    
    let filteredProducts = [...products];
    
    // Filtrer par catégorie
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Filtrer les produits mis en avant
    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.featured);
    }
    
    // Limiter le nombre de résultats
    if (limit) {
      filteredProducts = filteredProducts.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des produits'
    });
  }
});

// GET /api/products/:id - Récupérer un produit par ID
app.get('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du produit'
    });
  }
});

// POST /api/orders - Créer une nouvelle commande
app.post('/api/orders', (req, res) => {
  try {
    const { customerInfo, items, shippingAddress, notes } = req.body;

    // Validation basique
    if (!customerInfo || !customerInfo.firstName || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Informations client manquantes'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun article dans la commande'
      });
    }

    // Calcul du total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Simulation de création de commande
    const orderId = Math.floor(Math.random() * 10000) + 1000;

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        orderId: orderId,
        total: parseFloat(total.toFixed(2)),
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande'
    });
  }
});

// Route pour les erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    message: 'Cette route n\'existe pas sur notre API'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`📊 Test API: http://localhost:${PORT}/api/products`);
});

module.exports = app;
