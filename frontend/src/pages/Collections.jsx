import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import collectionsService from '../services/collectionsService';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (categoryFilter) {
      const categoryCollections = collectionsService.getCollectionsByCategory(categoryFilter);
      setFilteredCollections(categoryCollections);
    } else {
      setFilteredCollections(collections);
    }
  }, [collections, categoryFilter]);

  const loadCollections = () => {
    try {
      // Charger seulement les collections actives
      const allCollections = collectionsService.getAll();
      const activeCollections = allCollections.filter(collection => collection.active);
      setCollections(activeCollections);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
      setLoading(false);
    }
  };

  const getCollectionProducts = (collection) => {
    return collectionsService.getCollectionProducts(collection.id);
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'colliers': 'Colliers',
      'bagues': 'Bagues',
      'boucles-oreilles': 'Boucles d\'oreilles',
      'bracelets': 'Bracelets'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <TagIcon className="mx-auto h-12 w-12 text-primary-600 mb-4" />
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {categoryFilter ? `Collections ${getCategoryLabel(categoryFilter)}` : 'Nos Collections'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {categoryFilter 
                ? `Découvrez nos collections dédiées aux ${getCategoryLabel(categoryFilter).toLowerCase()}.`
                : 'Découvrez nos bijoux organisés par thèmes et styles uniques. Chaque collection raconte une histoire et exprime un univers particulier.'
              }
            </p>
            {categoryFilter && (
              <Link
                to="/collections"
                className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Voir toutes les collections
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-16">
            <TagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {categoryFilter 
                ? `Aucune collection pour ${getCategoryLabel(categoryFilter).toLowerCase()}`
                : 'Aucune collection disponible'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              Nos collections sont en cours de préparation. Revenez bientôt !
            </p>
            <Link
              to="/boutique"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Voir tous nos bijoux
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((collection) => {
              const products = getCollectionProducts(collection);
              const previewImage = collection.imageApercu || collection.imageCouverture;
              
              return (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Image de la collection */}
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={collection.nom}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <TagIcon className="h-16 w-16 text-primary-400" />
                      </div>
                    )}
                    
                    {/* Overlay avec nombre de produits */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        {products.length} bijou{products.length > 1 ? 'x' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {collection.nom}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {collection.description}
                    </p>

                    {/* Call to action */}
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-medium group-hover:text-primary-700">
                        Découvrir la collection
                      </span>
                      <ArrowRightIcon className="h-4 w-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Call to action vers la boutique */}
        {collections.length > 0 && (
          <div className="text-center mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vous cherchez quelque chose de spécifique ?
            </h3>
            <p className="text-gray-600 mb-6">
              Explorez tous nos bijoux dans notre boutique complète
            </p>
            <Link
              to="/boutique"
              className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Voir toute la boutique
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
