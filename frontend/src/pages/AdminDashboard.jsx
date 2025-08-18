import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProductForm from '../components/AddProductForm';
import StockManagement from '../components/StockManagement';
import SalesManagement from '../components/SalesManagement';
import CollectionsManagement from '../components/CollectionsManagement';
import { stockService } from '../services/stockService';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStockManagement, setShowStockManagement] = useState(false);
  const [showSalesManagement, setShowSalesManagement] = useState(false);
  const [showCollectionsManagement, setShowCollectionsManagement] = useState(false);
  const [stockData, setStockData] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fonction pour charger les données de stock
  const loadStockData = async () => {
    await stockService.syncWithProducts();
    setStockData({ ...stockService.stockData });
  };

  // Vérifier si l'utilisateur est connecté via le backend (session HttpOnly cookie)
  useEffect(() => {
    (async () => {
      try {
        // Vérification session (doit retourner 200 + user info si connecté, 401 sinon)
        const authRes = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (authRes.status === 401) {
          // Non connecté -> redirection vers la page de login
          navigate('/admin/login');
          return;
        }

        if (!authRes.ok) {
          console.warn('Échec vérification session admin, redirection vers login');
          navigate('/admin/login');
          return;
        }

        // Charger les produits depuis le backend en envoyant les credentials (cookie HttpOnly)
        const res = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (res.ok) {
          const body = await res.json();
          setProducts(body.data || []);
        } else {
          // En production on n'utilise PAS de fallback localStorage: on affiche une erreur
          console.error('Impossible de charger les produits depuis le backend:', res.status, res.statusText);
          setProducts([]);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session ou du chargement des produits:', err);
        // Ne pas tomber sur un fallback localStorage en prod — montrer page vide et laisser l'utilisateur se reconnecter
        setProducts([]);
      }

      // Charger les données de stock (conserve la logique de synchronisation)
      await loadStockData();
    })();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Appel au backend pour détruire la session (cookie HttpOnly côté serveur)
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
    navigate('/admin/login');
  };

  const handleResetAll = () => {
    if (window.confirm('⚠️ ATTENTION : Supprimer TOUS les produits et collections ? Cette action est irréversible !')) {
      (async () => {
        try {
          // Appel sécurisé au backend qui doit vérifier les droits et effectuer la suppression
          const res = await fetch(`${API_BASE}/api/admin/reset`, { method: 'DELETE', credentials: 'include' });
          if (res.ok) {
            setProducts([]);
            setStockData({});
            alert('✅ Tous les produits ont été supprimés !');
          } else {
            const body = await res.json().catch(() => ({}));
            alert('Erreur reset: ' + (body.error || res.statusText));
          }
        } catch (err) {
          console.error('Erreur reset produits:', err);
          alert('Erreur reset: ' + err.message);
        }
      })();
    }
  };

  const deleteProduct = (id) => {
    if (window.confirm('Êtes-vous sûre de vouloir supprimer ce bijou ?')) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
          if (res.ok) {
            const updatedProducts = products.filter(product => product.id !== id);
            setProducts(updatedProducts);
            loadStockData();
          } else {
            const body = await res.json().catch(() => ({}));
            alert('Erreur suppression: ' + (body.error || res.statusText));
          }
        } catch (err) {
          console.error('Erreur suppression produit:', err);
          alert('Erreur suppression produit: ' + err.message);
        }
      })();
    }
  };

  // Fonction pour démarrer l'édition d'un produit
  const editProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Fonction pour mettre à jour un produit
  const updateProduct = (updatedProduct) => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${updatedProduct.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        if (res.ok) {
          const body = await res.json();
          const data = body.data || updatedProduct;
          const updatedProducts = products.map(product => product.id === data.id ? data : product);
          setProducts(updatedProducts);

          if (data.stock !== undefined) {
            stockService.updateProductStock(data.id, data.stock);
          }

          setEditingProduct(null);
          setShowAddForm(false);
          loadStockData();
        } else {
          const body = await res.json().catch(() => ({}));
          alert('Erreur mise à jour: ' + (body.error || res.statusText));
        }
      } catch (err) {
        console.error('Erreur mise à jour produit:', err);
        alert('Erreur mise à jour produit: ' + err.message);
      }
    })();
  };

  // Fonction pour obtenir le statut du stock
  const getStockStatus = (productId) => {
    const stock = stockData[productId] || 0;
    if (stock === 0) return { status: 'out', label: 'Épuisé', color: 'bg-red-100 text-red-700' };
    if (stock <= 3) return { status: 'low', label: `${stock} en stock`, color: 'bg-amber-100 text-amber-700' };
    return { status: 'good', label: `${stock} en stock`, color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header admin */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-serif font-medium text-neutral-900">
              Gestion des bijoux - Colliers Colliers Maison
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleResetAll}
                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                title="Supprimer tous les produits"
              >
                🗑️ Reset
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                Voir le site
              </button>
              <button
                onClick={handleLogout}
                className="text-sm bg-neutral-200 text-neutral-700 px-3 py-1 rounded-lg hover:bg-neutral-300"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions principales */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-serif font-medium text-neutral-900">
              Mes bijoux ({products.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowSalesManagement(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Ventes</span>
              </button>
              <button
                onClick={() => setShowCollectionsManagement(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Collections</span>
              </button>
              <button
                onClick={() => setShowStockManagement(true)}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Gérer les stocks</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Ajouter un bijou</span>
              </button>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-6xl text-neutral-300 mb-4">💎</div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Aucun bijou pour le moment
              </h3>
              <p className="text-neutral-600 mb-4">
                Commencez par ajouter votre premier bijou à la collection
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Ajouter mon premier bijou
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-accent-champagne to-accent-rose flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-primary-700">
                      <div className="text-4xl mb-2 opacity-60">◊</div>
                      <p className="text-sm opacity-75">Photo à ajouter</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-neutral-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-neutral-600 mb-2 capitalize">{product.category?.replace('-', ' ')}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-lg font-semibold text-primary-600">
                      {product.price}€
                    </p>
                    
                    {/* Indicateur de stock */}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(product.id).color}`}>
                      {getStockStatus(product.id).label}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editProduct(product)}
                      className="flex-1 bg-neutral-100 text-neutral-700 py-1 px-3 rounded text-sm hover:bg-neutral-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 bg-red-100 text-red-700 py-1 px-3 rounded text-sm hover:bg-red-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification (modal) */}
      {showAddForm && (
        <AddProductForm 
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onProductAdded={(newProduct) => {
            // Ajouter le produit renvoyé par le backend
            const updatedProducts = [...products, newProduct];
            setProducts(updatedProducts);

            // Initialiser le stock dans le stockService si fourni
            if (newProduct.stock !== undefined) {
              stockService.setInitialStock(newProduct.id, newProduct.stock);
            }

            setShowAddForm(false);
            // Recharger les données de stock
            loadStockData();
          }}
          onProductUpdated={updateProduct}
          editingProduct={editingProduct}
        />
      )}

      {/* Gestion des stocks (modal) */}
      {showStockManagement && (
        <StockManagement 
          onClose={() => {
            setShowStockManagement(false);
            loadStockData(); // Recharger les données après modification
          }}
        />
      )}

      {/* Gestion des ventes (modal) */}
      {showSalesManagement && (
        <SalesManagement 
          onClose={() => setShowSalesManagement(false)}
        />
      )}

      {/* Gestion des collections (modal) */}
      {showCollectionsManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Gestion des Collections</h2>
              <button
                onClick={() => setShowCollectionsManagement(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CollectionsManagement />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
