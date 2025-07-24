const express = require('express');
const router = express.Router();

// Note: Dans une version de production, il faudrait ajouter une authentification JWT
// Pour le moment, on simule un accès admin simple

// GET /api/admin/orders - Récupérer toutes les commandes (admin)
router.get('/orders', (req, res) => {
  try {
    // Simulation de données pour la démo (pas d'import externe pour éviter les erreurs)
    const demoOrders = [
      {
        id: 1,
        customerInfo: {
          firstName: "Marie",
          lastName: "Dupont",
          email: "marie.dupont@email.com",
          phone: "+32 123 45 67 89"
        },
        items: [
          {
            productId: 1,
            productName: "Collier Élégance Dorée",
            price: 89.99,
            quantity: 1,
            subtotal: 89.99
          }
        ],
        total: 89.99,
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        customerInfo: {
          firstName: "Sophie",
          lastName: "Martin",
          email: "sophie.martin@email.com",
          phone: "+32 987 65 43 21"
        },
        items: [
          {
            productId: 2,
            productName: "Boucles d'Oreilles Perles Nacrées",
            price: 45.50,
            quantity: 1,
            subtotal: 45.50
          },
          {
            productId: 3,
            productName: "Bracelet Argent Infinity",
            price: 65.00,
            quantity: 1,
            subtotal: 65.00
          }
        ],
        total: 110.50,
        status: "confirmed",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { status, limit } = req.query;
    
    let filteredOrders = [...demoOrders];
    
    // Filtrer par statut
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    // Limiter le nombre de résultats
    if (limit) {
      filteredOrders = filteredOrders.slice(0, parseInt(limit));
    }
    
    // Trier par date de création (plus récent en premier)
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes'
    });
  }
});

// GET /api/admin/stats - Récupérer les statistiques (admin)
router.get('/stats', (req, res) => {
  try {
    // Simulation de statistiques pour la démo
    const stats = {
      totalOrders: 15,
      pendingOrders: 3,
      confirmedOrders: 8,
      shippedOrders: 3,
      deliveredOrders: 1,
      totalRevenue: 2456.75,
      averageOrderValue: 163.78,
      popularProducts: [
        { id: 1, name: "Collier Élégance Dorée", sales: 8 },
        { id: 4, name: "Bague Solitaire Rose", sales: 6 },
        { id: 3, name: "Bracelet Argent Infinity", sales: 5 }
      ],
      recentActivity: [
        { type: "order", message: "Nouvelle commande #16", time: "Il y a 2 heures" },
        { type: "payment", message: "Paiement reçu pour commande #15", time: "Il y a 4 heures" },
        { type: "shipment", message: "Commande #14 expédiée", time: "Il y a 1 jour" }
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// PUT /api/admin/orders/:id - Mettre à jour une commande (admin)
router.put('/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, notes } = req.body;

    // Simulation de mise à jour
    res.json({
      success: true,
      message: 'Commande mise à jour avec succès',
      data: {
        orderId: orderId,
        status: status,
        notes: notes,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la commande'
    });
  }
});

module.exports = router;
