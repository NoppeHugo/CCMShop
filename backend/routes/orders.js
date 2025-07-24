const express = require('express');
const router = express.Router();

// Stockage temporaire des commandes (sera remplacé par la base de données)
let orders = [];
let orderIdCounter = 1;

// POST /api/orders - Créer une nouvelle commande
router.post('/', (req, res) => {
  try {
    const {
      customerInfo,
      items,
      shippingAddress,
      notes
    } = req.body;

    // Validation des données requises
    if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Informations client manquantes (prénom, nom, email requis)'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun article dans la commande'
      });
    }

    // Calcul du total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Création de la commande
    const newOrder = {
      id: orderIdCounter++,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone || null
      },
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      shippingAddress: shippingAddress || null,
      total: parseFloat(total.toFixed(2)),
      status: 'pending', // pending, confirmed, shipped, delivered, cancelled
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        orderId: newOrder.id,
        total: newOrder.total,
        status: newOrder.status
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

// GET /api/orders/:id - Récupérer une commande par ID
router.get('/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la commande'
    });
  }
});

// POST /api/orders/:id/status - Mettre à jour le statut d'une commande
router.post('/:id/status', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut non valide'
      });
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: {
        orderId: orderId,
        newStatus: status
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut'
    });
  }
});

module.exports = router;
