const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API E-commerce Bijoux - Serveur démarré avec succès ✨',
    version: '1.0.0',
    status: 'active'
  });
});

// Routes API
// app.use('/api/products', require('./routes/products'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/admin', require('./routes/admin'));

// Routes temporaires pour tester
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'Route produits temporaire',
    data: [
      {
        id: 1,
        name: "Collier Élégance Dorée",
        description: "Magnifique collier en plaqué or",
        price: 89.99,
        category: "colliers",
        images: [],
        stock: 15,
        featured: true
      }
    ]
  });
});

app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    message: 'Route commandes temporaire',
    data: []
  });
});

// Route pour les erreurs 404
app.use((req, res) => {
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
