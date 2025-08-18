import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TagIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import collectionsService from '../services/collectionsService';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => { await loadCollectionData(); })();
  }, [id]);

  const loadCollectionData = async () => {
    try {
      const collectionData = await collectionsService.getById(parseInt(id));
      if (!collectionData) {
        setError('Collection non trouvée');
        setLoading(false);
        return;
      }
      if (!collectionData.active) {
        setError('Cette collection n\'est pas disponible');
        setLoading(false);
        return;
      }
      setCollection(collectionData);
      const collectionProducts = (collectionData.produits || []).map(cp => cp.product).filter(Boolean);
      setProducts(collectionProducts);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error);
      setError('Erreur lors du chargement');
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <TagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-600 mb-6">
              La collection que vous recherchez n'existe pas ou n'est plus disponible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Retour
              </button>
              <Link
                to="/collections"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Voir toutes les collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-gray-500"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link
                    to="/collections"
                    className="ml-4 text-gray-400 hover:text-gray-500"
                  >
                    Collections
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500">{collection.nom}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* En-tête de la collection */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {collection.imageCouverture && (
              <div className="mb-8">
                <img
                  src={collection.imageCouverture}
                  alt={collection.nom}
                  className="mx-auto h-80 w-full object-cover rounded-lg shadow-lg max-w-3xl"
                />
              </div>
            )}
            
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {collection.nom}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {collection.description}
            </p>

            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <span>{products.length} bijou{products.length > 1 ? 'x' : ''}</span>
              {products.length > 0 && (
                <span>
                  {(() => {
                    const prices = products.map(p => parseFloat(p.price)).sort((a, b) => a - b);
                    const minPrice = prices[0];
                    const maxPrice = prices[prices.length - 1];
                    
                    if (minPrice === maxPrice) {
                      return `${minPrice}€`;
                    } else {
                      return `De ${minPrice}€ à ${maxPrice}€`;
                    }
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Produits de la collection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <TagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Collection en préparation
            </h3>
            <p className="text-gray-600 mb-6">
              Les bijoux de cette collection seront bientôt disponibles.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour aux collections
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <Link
                  to="/collections"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Toutes les collections
                </Link>

                <Link
                  to="/boutique"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Voir toute la boutique
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionDetail;
