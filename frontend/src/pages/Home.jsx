import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { stockService } from '../services/stockService';
import ccmLogo from '../assets/ccm.png';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les produits mis en avant
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getFeatured(4);
        
        // Vérification robuste de la réponse
        if (response && response.data && Array.isArray(response.data)) {
          setFeaturedProducts(response.data);
        } else {
          console.warn('Format de réponse inattendu:', response);
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits pour le moment.');
        setFeaturedProducts([]); // Produits vides en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Section Hero - Photo immersive */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-accent-champagne via-accent-rose to-neutral-50">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url(${ccmLogo})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-accent-champagne/60 via-accent-rose/60 to-neutral-50/60"></div>
        
        {/* Contenu hero */}
        <div className="relative z-10 text-center container-padding">
          <h1 className="font-display text-4xl md:text-6xl lg:text-hero font-light text-neutral-900 mb-6 fade-in">
            Des bijoux faits avec amour
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-700 mb-8 max-w-2xl mx-auto leading-relaxed slide-up">
            Chaque création raconte une histoire unique, façonnée par la passion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up">
            <Link to="/boutique" className="btn-primary">
              Découvrir mes créations
            </Link>
            <Link to="/notre-histoire" className="btn-secondary">
              Mon histoire
            </Link>
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section Nouveautés */}
      <section className="section-padding bg-white">
        <div className="container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-neutral-900 mb-4">
              Nouveautés & Coups de Cœur
            </h2>
            <div className="w-24 h-px bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Une sélection de mes plus belles créations, pensées pour sublimer vos moments précieux
            </p>
          </div>

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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/boutique" className="btn-secondary">
              Voir toute la collection
            </Link>
          </div>
        </div>
      </section>

      {/* Section Catégories */}
      <section className="section-padding bg-neutral-50">
        <div className="container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-neutral-900 mb-4">
              Nos Collections
            </h2>
            <div className="w-24 h-px bg-primary-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Bagues', href: '/boutique?category=bagues', image: 'rings' },
              { name: 'Colliers', href: '/boutique?category=colliers', image: 'necklaces' },
              { name: 'Boucles d\'oreilles', href: '/boutique?category=boucles-oreilles', image: 'earrings' },
              { name: 'Bracelets', href: '/boutique?category=bracelets', image: 'bracelets' },
            ].map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-square bg-gradient-to-br from-accent-champagne to-accent-rose flex items-center justify-center">
                  <span className="text-4xl text-primary-700 opacity-60">◊</span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section Savoir-faire */}
      <section className="section-padding bg-white">
        <div className="container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-neutral-900 mb-6">
                L'Art de la Bijouterie Artisanale
              </h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Ma passion pour la bijouterie se transmet de génération en génération. 
                Chaque pièce est conçue dans mon atelier à Mouscron, alliant techniques 
                traditionnelles et créativité contemporaine.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: 'Créations Uniques',
                    description: 'Chaque bijou est pensé comme une œuvre d\'art unique'
                  },
                  {
                    title: 'Matériaux Nobles',
                    description: 'Sélection rigoureuse des métaux précieux et pierres fines'
                  },
                  {
                    title: 'Personnalisation',
                    description: 'Adaptations sur mesure selon vos envies et émotions'
                  }
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-1">{feature.title}</h4>
                      <p className="text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link to="/notre-histoire" className="btn-secondary">
                  Découvrir mon histoire
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-accent-champagne to-accent-rose rounded-lg flex items-center justify-center">
                <div className="text-center text-primary-700">
                  <div className="text-6xl mb-4 opacity-60">◊</div>
                  <p className="text-lg font-medium">Atelier de création</p>
                  <p className="text-sm opacity-75">Mouscron, Belgique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Garanties */}
      <section className="section-padding bg-neutral-50">
        <div className="container-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Livraison Soignée',
                description: 'Emballage élégant et livraison sécurisée pour protéger vos bijoux précieux'
              },
              {
                title: 'Garantie Qualité',
                description: 'Satisfaction garantie avec service après-vente personnalisé'
              },
              {
                title: 'Conseil Expert',
                description: 'Accompagnement professionnel pour choisir le bijou parfait'
              }
            ].map((guarantee) => (
              <div key={guarantee.title} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-6 h-6 bg-primary-600 rounded-full"></div>
                </div>
                <h3 className="text-xl font-medium text-neutral-900 mb-3">{guarantee.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
