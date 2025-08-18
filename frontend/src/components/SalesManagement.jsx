import React, { useState, useEffect } from 'react';
import formatPrice from '../utils/formatPrice';

const SalesManagement = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Statuts des commandes avec leurs couleurs
  const orderStatuses = {
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
    confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    preparing: { label: 'En préparation', color: 'bg-purple-100 text-purple-800', icon: '📦' },
    ready: { label: 'Prête', color: 'bg-green-100 text-green-800', icon: '✨' },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: '🚚' },
    collected: { label: 'Récupérée', color: 'bg-gray-100 text-gray-800', icon: '👤' },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: '❌' }
  };

  // Types de livraison
  const deliveryTypes = {
    pickup: 'Récupération sur place',
    delivery: 'Livraison à domicile'
  };

  // Charger les commandes depuis localStorage
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/orders`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const fetched = Array.isArray(data.data) ? data.data : [];
          const sortedOrders = fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sortedOrders);
        } else {
          // fallback: empty list
          setOrders([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || 
      (filter === 'pickup' && order.deliveryType === 'pickup') ||
      (filter === 'delivery' && order.deliveryType === 'delivery') ||
      order.status === filter;

    const matchesSearch = !searchTerm || 
      order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => ['delivered', 'collected'].includes(o.status)).length,
    totalRevenue: orders
      .filter(o => ['delivered', 'collected'].includes(o.status))
      .reduce((sum, order) => sum + (typeof order.total === 'number' ? order.total : parseFloat(order.total || 0)), 0)
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...(order.statusHistory || []),
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: `Statut mis à jour vers "${orderStatuses[newStatus].label}"`
              }
            ]
          }
        : order
    );
    
    setOrders(updatedOrders);
    // Persist status to backend if possible
    (async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) {
          console.warn('Échec persistance statut commande:', res.status);
        }
      } catch (err) {
        console.warn('Backend indisponible pour persister le statut:', err);
      }
    })();
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrders.find(o => o.id === orderId));
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif font-medium text-neutral-900">
                Gestion des Ventes
              </h2>
              <p className="text-neutral-600 mt-1">
                Suivez et gérez toutes vos commandes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-neutral-900">{stats.total}</div>
              <div className="text-sm text-neutral-600">Total commandes</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-amber-700">{stats.pending}</div>
              <div className="text-sm text-amber-600">En attente</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-blue-700">{stats.confirmed}</div>
              <div className="text-sm text-blue-600">Confirmées</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-green-700">{stats.completed}</div>
              <div className="text-sm text-green-600">Terminées</div>
            </div>
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-primary-700">{formatPrice(stats.totalRevenue)}€</div>
              <div className="text-sm text-primary-600">Chiffre d'affaires</div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('pickup')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'pickup' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Récupération
              </button>
              <button
                onClick={() => setFilter('delivery')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'delivery' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Livraison
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'pending' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                En attente
              </button>
            </div>

            {/* Recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-hidden flex">
          {/* Liste des commandes */}
          <div className="w-1/2 border-r border-neutral-200 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-4xl mb-4">📋</div>
                <p className="text-neutral-600">
                  {searchTerm || filter !== 'all' ? 'Aucune commande trouvée' : 'Aucune commande pour le moment'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    orderStatuses={orderStatuses}
                    deliveryTypes={deliveryTypes}
                    formatDate={formatDate}
                    isSelected={selectedOrder?.id === order.id}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Détails de la commande */}
          <div className="w-1/2 overflow-y-auto">
            {selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                orderStatuses={orderStatuses}
                deliveryTypes={deliveryTypes}
                formatDate={formatDate}
                updateOrderStatus={updateOrderStatus}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">👆</div>
                  <p>Sélectionnez une commande pour voir les détails</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour chaque carte de commande
const OrderCard = ({ order, orderStatuses, deliveryTypes, formatDate, isSelected, onClick }) => {
  const status = orderStatuses[order.status];
  
  return (
    <div 
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-neutral-900">
            {order.customerInfo.firstName} {order.customerInfo.lastName}
          </h3>
          <p className="text-sm text-neutral-500">#{order.orderNumber}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <span className="mr-1">{status.icon}</span>
          {status.label}
        </span>
      </div>
      
        <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Type:</span>
          <span className="font-medium">{deliveryTypes[order.deliveryType]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Montant:</span>
          <span className="font-medium text-primary-600">{formatPrice(order.total)}€</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Date:</span>
          <span className="text-neutral-700">{formatDate(order.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

// Composant pour les détails de la commande
const OrderDetails = ({ order, orderStatuses, deliveryTypes, formatDate, updateOrderStatus }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-serif font-medium text-neutral-900 mb-2">
          Commande #{order.orderNumber}
        </h3>
        <p className="text-neutral-600">{formatDate(order.createdAt)}</p>
      </div>

      {/* Statut et actions */}
      <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-neutral-700">Statut actuel:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${orderStatuses[order.status].color}`}>
            <span className="mr-1">{orderStatuses[order.status].icon}</span>
            {orderStatuses[order.status].label}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateOrderStatus(order.id, 'confirmed')}
            disabled={order.status === 'confirmed'}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmer
          </button>
          <button
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            disabled={order.status === 'preparing'}
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            En préparation
          </button>
          <button
            onClick={() => updateOrderStatus(order.id, 'ready')}
            disabled={order.status === 'ready'}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prête
          </button>
          {order.deliveryType === 'delivery' ? (
            <button
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              disabled={order.status === 'delivered'}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Livrée
            </button>
          ) : (
            <button
              onClick={() => updateOrderStatus(order.id, 'collected')}
              disabled={order.status === 'collected'}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Récupérée
            </button>
          )}
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-6">
        <h4 className="font-medium text-neutral-900 mb-3">Informations client</h4>
        <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-2">
          <p><strong>Nom:</strong> {order.customerInfo.firstName} {order.customerInfo.lastName}</p>
          <p><strong>Email:</strong> {order.customerInfo.email}</p>
          <p><strong>Téléphone:</strong> {order.customerInfo.phone}</p>
          <p><strong>Type:</strong> {deliveryTypes[order.deliveryType]}</p>
          {order.deliveryType === 'delivery' && order.customerInfo.address && (
            <div>
              <strong>Adresse:</strong>
              <div className="ml-4">
                <p>{order.customerInfo.address.street}</p>
                <p>{order.customerInfo.address.postalCode} {order.customerInfo.address.city}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Articles commandés */}
      <div className="mb-6">
        <h4 className="font-medium text-neutral-900 mb-3">Articles commandés</h4>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-white border border-neutral-200 rounded-lg">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-neutral-600">Quantité: {item.quantity}</p>
              </div>
              <p className="font-medium text-primary-600">{formatPrice(item.price * item.quantity)}€</p>
            </div>
          ))}
          <div className="flex justify-between items-center p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-primary-600">{formatPrice(order.total)}€</span>
          </div>
        </div>
      </div>

      {/* Historique des statuts */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 mb-3">Historique</h4>
          <div className="space-y-2">
            {order.statusHistory.map((history, index) => (
              <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{history.note}</span>
                  <span className="text-xs text-neutral-500">{formatDate(history.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
