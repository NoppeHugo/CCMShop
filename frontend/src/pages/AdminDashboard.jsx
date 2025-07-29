import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProductForm from '../components/AddProductForm';
import StockManagement from '../components/StockManagement';
import SalesManagement from '../components/SalesManagement';
import CollectionsManagement from '../components/CollectionsManagement';
import apiService from '../services/apiService.js';
import { stockService } from '../services/stockService';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStockManagement, setShowStockManagement] = useState(false);
  const [showSalesManagement, setShowSalesManagement] = useState(false);
  const [showCollectionsManagement, setShowCollectionsManagement] = useState(false);
  const [stockData, setStockData] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  // Vérifier l'état de l'API et la connexion à la base de données
  const checkApiStatus = async () => {
    try {
      const status = await apiService.checkApiStatus();
      setApiStatus(status);
    } catch (err) {
      console.error("Erreur lors de la vérification de l'API:", err);
      setApiStatus({ error: err.message });
    }
  };
  
  // Fonction pour charger les produits depuis l'API
  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des produits...');
      
      const response = await apiService.getProducts();
      console.log('📦 Réponse reçue:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log('✅ Produits trouvés:', response.data.length);
        setProducts(response.data);
        
        // Mise à jour des données dans le stockService
        if (stockService && stockService.updateProductsData) {
          await stockService.updateProductsData(response.data);
          setStockData({ ...stockService.stockData });
        }
      } else {
        console.warn('⚠️ Aucun produit trouvé ou structure incorrecte');
        setProducts([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des produits:", err);
      setError(`Erreur: ${err.message}`);
      setProducts([]); // S'assurer que products est un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouveau produit via l'API
  const addProduct = async (newProduct) => {
    try {
      console.log('🔍 AdminDashboard - Début ajout produit:', newProduct);
      setLoading(true);
      setError(null);
      
      // Validation basique côté client
      if (!newProduct.name || !newProduct.price) {
        throw new Error('Le nom et le prix sont obligatoires');
      }
      
      // Appel API
      console.log('📡 AdminDashboard - Appel API createProduct...');
      const result = await apiService.createProduct(newProduct);
      console.log('✅ AdminDashboard - Réponse API:', result);
      
      // Recharger les produits
      console.log('🔄 AdminDashboard - Rechargement des produits...');
      await loadProducts();
      
      // Fermer le formulaire
      setShowAddForm(false);
      
      // Notification de succès
      alert('✅ Produit ajouté avec succès dans la base de données !');
      
    } catch (err) {
      console.error("❌ AdminDashboard - Erreur lors de l'ajout du produit:", err);
      
      // Log détaillé pour le débogage
      if (err.response) {
        console.error('📄 Détails de l\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      
      const errorMessage = err.response?.data?.error || err.message || 'Erreur inconnue';
      setError(`Erreur lors de l'ajout: ${errorMessage}`);
      alert(`❌ Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un produit via l'API
  const updateProduct = async (id, updatedProduct) => {
    try {
      setLoading(true);
      await apiService.updateProduct(id, updatedProduct);
      await loadProducts(); // Recharger les produits
      setEditingProduct(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du produit:", err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un produit via l'API
  const deleteProduct = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      try {
        setLoading(true);
        await apiService.deleteProduct(id);
        await loadProducts(); // Recharger les produits
      } catch (err) {
        console.error("Erreur lors de la suppression du produit:", err);
        setError(`Erreur: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const isConnected = localStorage.getItem('isAdminConnected');
    if (!isConnected) {
      navigate('/admin/login');
      return;
    }
    
    // Charger l'état de l'API et les produits
    checkApiStatus();
    loadProducts();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
      
      {/* Statut de l'API */}
      {apiStatus && (
        <div className="bg-gray-100 p-4 mb-6 rounded-lg">
          <h2 className="font-semibold mb-2">Statut de l'API:</h2>
          <p>Base de données: <span className="font-medium">{apiStatus.database || "Non connectée"}</span></p>
          <p>Version: <span className="font-medium">{apiStatus.version || "Inconnue"}</span></p>
          {apiStatus.supabaseStatus && (
            <p>Supabase: <span className="font-medium">{apiStatus.supabaseStatus}</span></p>
          )}
        </div>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowStockManagement(false);
            setShowSalesManagement(false);
            setShowCollectionsManagement(false);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showAddForm ? "Masquer le formulaire" : "Ajouter un produit"}
        </button>
        
        <button
          onClick={() => {
            setShowStockManagement(!showStockManagement);
            setShowAddForm(false);
            setShowSalesManagement(false);
            setShowCollectionsManagement(false);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {showStockManagement ? "Masquer la gestion des stocks" : "Gérer les stocks"}
        </button>
        
        <button
          onClick={() => {
            setShowSalesManagement(!showSalesManagement);
            setShowAddForm(false);
            setShowStockManagement(false);
            setShowCollectionsManagement(false);
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          {showSalesManagement ? "Masquer les ventes" : "Voir les ventes"}
        </button>
        
        <button
          onClick={() => {
            setShowCollectionsManagement(!showCollectionsManagement);
            setShowAddForm(false);
            setShowStockManagement(false);
            setShowSalesManagement(false);
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          {showCollectionsManagement ? "Masquer les collections" : "Gérer les collections"}
        </button>
        
        <button
          onClick={loadProducts}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Rafraîchir les données
        </button>
        
        {/* Bouton de test d'API */}
        <button
          onClick={() => {
            import('../utils/adminApiTest').then(module => {
              module.runAdminApiTests().then(success => {
                if (success) {
                  alert('✅ Test d\'API réussi! Vérifiez la console pour plus de détails.');
                  loadProducts(); // Recharger les produits pour voir le nouveau
                } else {
                  alert('❌ Test d\'API échoué. Vérifiez la console pour les erreurs.');
                }
              });
            });
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Tester API
        </button>
      </div>
      
      {/* Formulaire d'ajout de produit */}
      {showAddForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter un nouveau produit</h2>
          <AddProductForm onAddProduct={addProduct} />
        </div>
      )}
      
      {/* Gestion des stocks */}
      {showStockManagement && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gestion des stocks</h2>
          <StockManagement 
            products={products} 
            stockData={stockData} 
            onUpdateProduct={updateProduct}
          />
        </div>
      )}
      
      {/* Gestion des ventes */}
      {showSalesManagement && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gestion des ventes</h2>
          <SalesManagement />
        </div>
      )}
      
      {/* Gestion des collections */}
      {showCollectionsManagement && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gestion des collections</h2>
          <CollectionsManagement 
            products={products} 
            onUpdateProduct={updateProduct}
          />
        </div>
      )}
      
      {/* Liste des produits */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Liste des produits ({products.length})</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Image</th>
                <th className="border px-4 py-2">Nom</th>
                <th className="border px-4 py-2">Prix</th>
                <th className="border px-4 py-2">Catégorie</th>
                <th className="border px-4 py-2">Stock</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="border px-4 py-2">{product.id}</td>
                  <td className="border px-4 py-2">
                    {product.images && product.images.length > 0 && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover"
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">{product.price}€</td>
                  <td className="border px-4 py-2">{product.category}</td>
                  <td className="border px-4 py-2">{product.stock}</td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de modification d'un produit */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Modifier le produit</h2>
            <AddProductForm 
              product={editingProduct}
              onAddProduct={(updatedProduct) => updateProduct(editingProduct.id, updatedProduct)}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
