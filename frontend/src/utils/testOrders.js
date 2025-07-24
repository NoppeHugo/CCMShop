// Script pour créer des commandes de test - à exécuter dans la console du navigateur

const testOrders = [
  {
    id: 1643725200000,
    orderNumber: 'CCM-725200',
    customerInfo: {
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@example.com',
      phone: '0123456789',
      address: {
        street: '123 Rue de la Paix',
        postalCode: '7700',
        city: 'Mouscron'
      }
    },
    deliveryType: 'delivery',
    items: [
      {
        id: 1,
        name: 'Collier Élégance Dorée',
        price: 89.99,
        quantity: 1
      }
    ],
    total: 89.99,
    status: 'pending',
    createdAt: '2025-01-24T08:30:00.000Z',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2025-01-24T08:30:00.000Z',
        note: 'Commande créée'
      }
    ]
  },
  {
    id: 1643728800000,
    orderNumber: 'CCM-728800',
    customerInfo: {
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@example.com',
      phone: '0987654321'
    },
    deliveryType: 'pickup',
    items: [
      {
        id: 1,
        name: 'Collier Élégance Dorée',
        price: 89.99,
        quantity: 2
      }
    ],
    total: 179.98,
    status: 'confirmed',
    createdAt: '2025-01-24T09:30:00.000Z',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2025-01-24T09:30:00.000Z',
        note: 'Commande créée'
      },
      {
        status: 'confirmed',
        timestamp: '2025-01-24T09:45:00.000Z',
        note: 'Commande confirmée'
      }
    ]
  },
  {
    id: 1643732400000,
    orderNumber: 'CCM-732400',
    customerInfo: {
      firstName: 'Sophie',
      lastName: 'Lambert',
      email: 'sophie.lambert@example.com',
      phone: '0456789123',
      address: {
        street: '456 Avenue des Fleurs',
        postalCode: '7700',
        city: 'Mouscron'
      }
    },
    deliveryType: 'delivery',
    items: [
      {
        id: 1,
        name: 'Collier Élégance Dorée',
        price: 89.99,
        quantity: 1
      }
    ],
    total: 89.99,
    status: 'delivered',
    createdAt: '2025-01-24T07:00:00.000Z',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2025-01-24T07:00:00.000Z',
        note: 'Commande créée'
      },
      {
        status: 'confirmed',
        timestamp: '2025-01-24T07:15:00.000Z',
        note: 'Commande confirmée'
      },
      {
        status: 'preparing',
        timestamp: '2025-01-24T08:00:00.000Z',
        note: 'En préparation'
      },
      {
        status: 'ready',
        timestamp: '2025-01-24T10:00:00.000Z',
        note: 'Prête pour livraison'
      },
      {
        status: 'delivered',
        timestamp: '2025-01-24T11:30:00.000Z',
        note: 'Commande livrée'
      }
    ]
  }
];

// Pour ajouter ces commandes de test, exécutez dans la console :
// localStorage.setItem('jewelry-orders', JSON.stringify(testOrders));
// console.log('Commandes de test ajoutées !');

console.log('Commandes de test prêtes. Exécutez dans la console du navigateur :');
console.log('localStorage.setItem("jewelry-orders", JSON.stringify(' + JSON.stringify(testOrders) + '));');
