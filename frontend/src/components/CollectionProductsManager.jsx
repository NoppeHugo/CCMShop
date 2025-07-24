import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import collectionsService from '../services/collectionsService';

const CollectionProductsManager = ({ collection, onClose, onUpdate }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [collection]);

  const loadProducts = () => {
    try {
      // Charger tous les produits
      const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      setAllProducts(products);

      // Charger les produits de la collection
      const collectionProds = collectionsService.getCollectionProducts(collection.id);
      setCollectionProducts(collectionProds);

      // Produits disponibles (non encore dans la collection)
      const available = products.filter(product => 
        !collection.produits.includes(product.id)
      );
      setAvailableProducts(available);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setLoading(false);
    }
  };

  const addProductToCollection = (productId) => {
    try {
      collectionsService.addProduct(collection.id, productId);
      loadProducts();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const removeProductFromCollection = (productId) => {
    try {
      collectionsService.removeProduct(collection.id, productId);
      loadProducts();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Gérer les produits</h2>
            <p className="text-gray-600">Collection: {collection.nom}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-96">
          {/* Produits dans la collection */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-900">
                Produits dans la collection ({collectionProducts.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {collectionProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun produit dans cette collection</p>
                  <p className="text-sm">Ajoutez des produits depuis la liste de droite</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collectionProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                      <img
                        src={product.images?.[0] || '/placeholder-jewelry.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-sm font-medium text-primary-600">{product.price}€</p>
                      </div>
                      <button
                        onClick={() => removeProductFromCollection(product.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Retirer de la collection"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Produits disponibles */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-900 mb-3">
                Produits disponibles ({availableProducts.length})
              </h3>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredAvailableProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? (
                    <p>Aucun produit trouvé pour "{searchTerm}"</p>
                  ) : (
                    <p>Tous les produits sont déjà dans des collections</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailableProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50">
                      <img
                        src={product.images?.[0] || '/placeholder-jewelry.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-sm font-medium text-primary-600">{product.price}€</p>
                      </div>
                      <button
                        onClick={() => addProductToCollection(product.id)}
                        className="text-purple-600 hover:text-purple-700 p-1"
                        title="Ajouter à la collection"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {collectionProducts.length} produit(s) dans cette collection
            </p>
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Terminé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionProductsManager;
