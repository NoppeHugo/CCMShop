import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { stockService } from '../services/stockService';
import collectionsService from '../services/collectionsService';
import { TagIcon } from '@heroicons/react/24/outline';

const Boutique = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [relatedCollections, setRelatedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();

  const categories = [
    { value: 'all', label: 'Tous les bijoux' },
    { value: 'colliers', label: 'Colliers' },
    { value: 'bagues', label: 'Bagues' },
    { value: 'boucles-oreilles', label: 'Boucles d\'oreilles' },
    { value: 'bracelets', label: 'Bracelets' }
  ];

  // Charger tous les produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productsService.getAll();
        setProducts(response.data || []);
        
        // Forcer la réinitialisation du stock pour corriger les données localStorage
        await stockService.forceResyncWithProducts();
        
        // Debug: afficher l'état du stock
        stockService.debugStock();
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Gérer la catégorie depuis l'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Filtrer les produits selon la catégorie
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
      setRelatedCollections([]);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
      // Charger les collections liées à cette catégorie
      (async () => {
        const cols = await collectionsService.getCollectionsByCategoryAsync(selectedCategory);
        setRelatedCollections(cols || []);
      })();
    }
  }, [products, selectedCategory]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Mettre à jour l'URL sans recharger la page
    const newSearchParams = new URLSearchParams();
    if (category !== 'all') {
      newSearchParams.set('category', category);
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header de la boutique */}
      <section className="bg-neutral-50 py-16">
        <div className="container-padding">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 mb-4">
              Notre Boutique
            </h1>
            <div className="w-24 h-px bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Découvrez notre collection complète de bijoux artisanaux, 
              créés avec passion dans notre atelier de Mouscron.
            </p>
          </div>
        </div>
      </section>

      {/* Filtres et contenu */}
      <section className="section-padding">
        <div className="container-padding">
          {/* Filtres par catégorie */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="mb-8 text-center">
            <p className="text-neutral-600">
              {loading ? (
                'Chargement...'
              ) : (
                <>
                  {filteredProducts.length} bijou{filteredProducts.length > 1 ? 'x' : ''} 
                  {selectedCategory !== 'all' && (
                    <span className="ml-1">
                      dans la catégorie "{categories.find(c => c.value === selectedCategory)?.label}"
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Collections liées à la catégorie */}
          {relatedCollections.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-6">
                Collections {categories.find(c => c.value === selectedCategory)?.label.toLowerCase()}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCollections.slice(0, 3).map((collection) => {
                  const collectionProducts = (collection.produits || []).map(cp => cp.product).filter(Boolean);
                  const previewImage = collection.imageApercu || collection.imageCouverture;
                  
                  return (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.id}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt={collection.nom}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <TagIcon className="h-8 w-8 text-primary-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {collection.nom}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {collectionProducts.length} bijou{collectionProducts.length > 1 ? 'x' : ''}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {relatedCollections.length > 3 && (
                <div className="text-center mt-6">
                  <Link
                    to={`/collections?category=${selectedCategory}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Voir toutes les collections →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Contenu principal */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-600 hover:text-red-800 font-medium underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-neutral-50 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-6xl text-neutral-300 mb-4">💎</div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  {selectedCategory === 'all' 
                    ? 'Aucun bijou disponible'
                    : `Aucun bijou dans cette catégorie`
                  }
                </h3>
                <p className="text-neutral-600 mb-4">
                  {selectedCategory === 'all' 
                    ? 'Les bijoux seront bientôt disponibles.'
                    : 'Découvrez nos autres catégories ou revenez bientôt.'
                  }
                </p>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Voir tous les bijoux
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Boutique;
