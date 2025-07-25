import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { stockService } from '../services/stockService';
import { productsService } from '../services/api';

const StockManagement = ({ onClose }) => {
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les produits et les données de stock
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les produits
        const response = await productsService.getAll();
        const productList = (response.data || []).filter(product => product && product.id);
        setProducts(productList);
        
        // Synchroniser et charger le stock
        await stockService.syncWithProducts();
        const stocks = stockService.stockData;
        setStockData(stocks);
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setProducts([]); // Assurer qu'on a un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mettre à jour le stock d'un produit
  const updateStock = async (productId, newStock) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      stockService.updateProductStock(productId, parseInt(newStock));
      
      // Recharger à la fois les produits ET le stock
      const response = await productsService.getAll();
      const productList = response.data || [];
      setProducts(productList);
      
      await stockService.syncWithProducts();
      const updatedStockData = stockService.stockData;
      setStockData(updatedStockData);
      
      console.log('Stock mis à jour:', productId, 'nouveau stock:', newStock);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Ajouter du stock (réapprovisionnement)
  const addStock = async (productId, quantity) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      stockService.addStock(productId, parseInt(quantity));
      
      // Recharger à la fois les produits ET le stock
      const response = await productsService.getAll();
      const productList = response.data || [];
      setProducts(productList);
      
      await stockService.syncWithProducts();
      const updatedStockData = stockService.stockData;
      setStockData(updatedStockData);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de stock:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Supprimer un produit
  const deleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    setUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      await productsService.delete(productId);
      
      // Supprimer aussi du stockService
      stockService.removeProduct(productId);
      
      // Recharger les données
      const response = await productsService.getAll();
      const productList = response.data || [];
      setProducts(productList);
      
      await stockService.syncWithProducts();
      const updatedStockData = stockService.stockData;
      setStockData(updatedStockData);
      
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Filtrer les produits par nom
  const filteredProducts = products.filter(product =>
    product && product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le statut du stock
  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out', label: 'Épuisé', color: 'bg-red-100 text-red-800' };
    if (stock <= 3) return { status: 'low', label: 'Stock faible', color: 'bg-amber-100 text-amber-800' };
    return { status: 'good', label: 'En stock', color: 'bg-green-100 text-green-800' };
  };

  // Statistiques rapides
  const stockStats = {
    total: filteredProducts.length,
    outOfStock: filteredProducts.filter(p => (stockData[p.id] || 0) === 0).length,
    lowStock: filteredProducts.filter(p => {
      const stock = stockData[p.id] || 0;
      return stock > 0 && stock <= 3;
    }).length,
    inStock: filteredProducts.filter(p => (stockData[p.id] || 0) > 3).length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif font-medium text-neutral-900">
                Gestion des Stocks
              </h2>
              <p className="text-neutral-600 mt-1">
                Gérez le stock de vos bijoux en temps réel
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

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-neutral-900">{stockStats.total}</div>
              <div className="text-sm text-neutral-600">Total produits</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-green-700">{stockStats.inStock}</div>
              <div className="text-sm text-green-600">En stock</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-amber-700">{stockStats.lowStock}</div>
              <div className="text-sm text-amber-600">Stock faible</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-semibold text-red-700">{stockStats.outOfStock}</div>
              <div className="text-sm text-red-600">Épuisés</div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mt-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un bijou..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-neutral-400 text-4xl mb-4">📦</div>
                    <p className="text-neutral-600">
                      {searchTerm ? 'Aucun produit trouvé pour cette recherche' : 'Aucun produit disponible'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => {
                      const stock = stockData[product.id] || 0;
                      const stockStatus = getStockStatus(stock);
                      
                      return (
                        <ProductStockCard
                          key={product.id}
                          product={product}
                          stock={stock}
                          stockStatus={stockStatus}
                          isUpdating={updating[product.id]}
                          onUpdateStock={updateStock}
                          onAddStock={addStock}
                          onDeleteProduct={deleteProduct}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour chaque produit - Version simplifiée
const ProductStockCard = ({ product, stock, stockStatus, isUpdating, onUpdateStock, onAddStock, onDeleteProduct }) => {
  
  const decreaseStock = () => {
    if (stock > 0) {
      onUpdateStock(product.id, stock - 1);
    }
  };

  const increaseStock = () => {
    onUpdateStock(product.id, stock + 1);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        {/* Informations produit */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Image */}
          <div className="w-16 h-16 bg-gradient-to-br from-accent-champagne to-accent-rose rounded-lg overflow-hidden flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const fallbackChar = (product.name && product.name.length > 0) ? product.name.charAt(0) : '◊';
                  e.target.src = `https://via.placeholder.com/64x64/F7E7CE/D4AF37?text=${encodeURIComponent(fallbackChar)}`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-primary-700 text-xl opacity-60">◊</span>
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-neutral-900 truncate">{product.name || 'Produit sans nom'}</h3>
            <p className="text-sm text-neutral-500 capitalize">{product.category?.replace('-', ' ') || 'Bijou'}</p>
            <p className="text-sm font-medium text-neutral-700">{product.price?.toFixed(2) || '0.00'}€</p>
          </div>
        </div>

        {/* Interface de gestion de stock simplifiée */}
        <div className="flex items-center space-x-4">
          {/* Statut du stock */}
          <div className="text-center">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>

          {/* Contrôles de stock : - (chiffre) + */}
          <div className="flex items-center space-x-3 bg-neutral-50 rounded-lg p-2">
            {/* Bouton - */}
            <button
              onClick={decreaseStock}
              disabled={isUpdating || stock <= 0}
              className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Diminuer le stock"
            >
              <span className="text-lg font-semibold">−</span>
            </button>

            {/* Affichage du stock */}
            <div className="text-center min-w-[3rem]">
              <div className="text-xl font-semibold text-neutral-900">
                {isUpdating ? '...' : stock}
              </div>
              <div className="text-xs text-neutral-500">stock</div>
            </div>

            {/* Bouton + */}
            <button
              onClick={increaseStock}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Augmenter le stock"
            >
              <span className="text-lg font-semibold">+</span>
            </button>
          </div>

          {/* Bouton de suppression */}
          <button
            onClick={() => onDeleteProduct(product.id)}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Supprimer le produit"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
