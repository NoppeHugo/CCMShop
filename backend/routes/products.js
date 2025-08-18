const express = require('express');
const router = express.Router();
const { prisma } = require('../config/supabase');

// Données temporaires pour le développement (sera remplacé par Prisma)
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
  },
  {
    id: 3,
    name: "Bracelet Argent Infinity",
    description: "Bracelet en argent sterling avec charm infini, symbole d'amour éternel",
    price: 65.00,
    category: "bracelets",
    images: ["/images/bracelet-infinity-1.jpg"],
    stock: 12,
    featured: true
  },
  {
    id: 4,
    name: "Bague Solitaire Rose",
    description: "Bague délicate en or rose avec cristal étincelant",
    price: 120.00,
    category: "bagues",
    images: ["/images/bague-solitaire-1.jpg"],
    stock: 5,
    featured: true
  }
];

// GET /api/products - Récupérer tous les produits
router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
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

// GET /api/products/categories - Récupérer toutes les catégories
router.get('/meta/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories'
    });
  }
});

// POST /api/products - Créer un nouveau produit (persist via Prisma)
router.post('/', async (req, res) => {
  try {
    const { name, description, price = 0, stock = 0, images = [], category = 'bijou', featured = false } = req.body;

    const created = await prisma.product.create({
      data: {
        name: name || 'Produit sans nom',
        description: description || '',
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        images: images,
        category: category || 'bijou',
        featured: !!featured
      }
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Erreur lors de la création du produit :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création du produit' });
  }
});

module.exports = router;
