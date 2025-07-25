const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://ccmshop.vercel.app',
    'https://ccm-bijoux.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'CCM Bijoux API', 
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Route de health check pour Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes API simples
app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 1,
      name: "Collier Élégance Dorée",
      description: "Magnifique collier en plaqué or avec pendentif en forme de coeur",
      price: 89.99,
      category: "colliers",
      images: ["https://via.placeholder.com/300x300/F7E7CE/D4AF37?text=Collier"],
      stock: 15,
      featured: true
    },
    {
      id: 2,
      name: "Boucles d'Oreilles Perles Nacrées",
      description: "Boucles d'oreilles délicates avec perles nacrées authentiques",
      price: 45.50,
      category: "boucles-oreilles",
      images: ["https://via.placeholder.com/300x300/F7E7CE/D4AF37?text=Boucles"],
      stock: 8,
      featured: false
    },
    {
      id: 3,
      name: "Bracelet Argent Infinity",
      description: "Bracelet en argent sterling avec charm infini",
      price: 65.00,
      category: "bracelets",
      images: ["https://via.placeholder.com/300x300/F7E7CE/D4AF37?text=Bracelet"],
      stock: 12,
      featured: true
    }
  ];

  const { category } = req.query;
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = products.filter(p => p.category === category);
  }

  res.json({
    success: true,
    data: filteredProducts,
    total: filteredProducts.length
  });
});

// Route pour un produit spécifique
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  
  const products = [
    {
      id: 1,
      name: "Collier Élégance Dorée",
      description: "Magnifique collier en plaqué or avec pendentif en forme de coeur",
      price: 89.99,
      category: "colliers",
      images: ["https://via.placeholder.com/300x300/F7E7CE/D4AF37?text=Collier"],
      stock: 15,
      featured: true
    },
    {
      id: 2,
      name: "Boucles d'Oreilles Perles Nacrées",
      description: "Boucles d'oreilles délicates avec perles nacrées authentiques",
      price: 45.50,
      category: "boucles-oreilles",
      images: ["https://via.placeholder.com/300x300/F7E7CE/D4AF37?text=Boucles"],
      stock: 8,
      featured: false
    }
  ];

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
});

// Route pour les commandes
app.post('/api/orders', (req, res) => {
  const { customerInfo, items, total } = req.body;
  
  if (!customerInfo || !items || !total) {
    return res.status(400).json({
      success: false,
      error: 'Données de commande manquantes'
    });
  }

  const order = {
    id: Date.now(),
    customerInfo,
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  console.log('Nouvelle commande reçue:', order);

  res.status(201).json({
    success: true,
    data: order,
    message: 'Commande créée avec succès'
  });
});

// Route pour les catégories
app.get('/api/categories', (req, res) => {
  const categories = ['colliers', 'bagues', 'boucles-oreilles', 'bracelets'];
  
  res.json({
    success: true,
    data: categories
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    success: false,
    error: 'Erreur interne du serveur'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur CCM démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend autorisé: ${process.env.FRONTEND_URL || 'localhost'}`);
  console.log(`⏰ Démarrage: ${new Date().toISOString()}`);
});

module.exports = app;
