const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API E-commerce Bijoux - Serveur démarré avec succès ✨',
    version: '1.0.0',
    status: 'active'
  });
});

// Route de test pour les produits
app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 1,
      name: "Collier Élégance Dorée",
      description: "Magnifique collier en plaqué or avec pendentif en forme de coeur",
      price: 89.99,
      category: "colliers",
      images: ["/images/collier-elegance-1.jpg"],
      stock: 15,
      featured: true
    },
    {
      id: 2,
      name: "Boucles d'Oreilles Perles Nacrées",
      description: "Boucles d'oreilles délicates avec perles nacrées authentiques",
      price: 45.50,
      category: "boucles-oreilles",
      images: ["/images/boucles-perles-1.jpg"],
      stock: 8,
      featured: false
    }
  ];

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// Route pour les erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    message: 'Cette route n\'existe pas sur notre API'
  });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
