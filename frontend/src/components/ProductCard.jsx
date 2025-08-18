import React, { useState } from 'react';
import formatPrice from '../utils/formatPrice';
import { useCart } from '../context/CartContext';
import placeholderImg from '../assets/ccm.png'; // <-- ajouté

function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [stockError, setStockError] = useState('');
  const { isInCart, getItemQuantity, getAvailableStock, addToCart } = useCart();
  
  // Validation et valeurs par défaut pour éviter les erreurs
  if (!product) {
    console.error('ProductCard: produit non défini');
    return null;
  }

  const {
    id = 0,
    name = 'Produit sans nom',
    description = 'Description non disponible',
    price: rawPrice = 0,
    images = [],
    category = 'bijou',
    featured = false
  } = product;

  // safe price conversion (remplace l'ancien usage direct de product.price.toFixed(...))
  let price = 0;
  if (typeof rawPrice === 'string') {
    // supporte "12.34" ou "12,34"
    price = parseFloat(rawPrice.replace(',', '.'));
  } else if (typeof rawPrice === 'number') {
    price = rawPrice;
  } else {
    price = Number(rawPrice);
  }
  if (!Number.isFinite(price)) price = 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    setStockError('');
    
    // Simuler un petit délai pour l'animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const success = addToCart(product, 1);
    
    if (success) {
      setJustAdded(true);
      // Réinitialiser l'état après quelques secondes
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
    } else {
      setStockError(`Plus que ${availableStock} en stock`);
      setTimeout(() => {
        setStockError('');
      }, 3000);
    }
    
    setIsAdding(false);
  };

  const quantityInCart = getItemQuantity(id);
  const productInCart = isInCart(id);
  const availableStock = getAvailableStock(id);
  // Utiliser uniquement le stock du stockService qui est la source de vérité
  const actualStock = availableStock;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image du produit */}
      <div className="aspect-square bg-gradient-to-br from-accent-champagne to-accent-rose overflow-hidden relative">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // éviter boucle d'erreur : supprimer le handler avant de remplacer la source
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderImg;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-primary-700">
              <div className="text-4xl mb-2 opacity-60">◊</div>
              <p className="text-sm font-medium opacity-75">{name}</p>
            </div>
          </div>
        )}
        
        {/* Badge produit mis en avant */}
        {featured && (
          <div className="absolute top-3 left-3 bg-accent-rose text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
            Coup de cœur
          </div>
        )}
      </div>

      {/* Informations du produit */}
      <div className="p-6">
        {/* Catégorie */}
        <div className="mb-2">
          <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
            {category?.replace('-', ' ') || 'Bijou'}
          </span>
        </div>

        {/* Nom du produit */}
        <h3 className="font-serif text-lg font-medium text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Prix et actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-semibold text-neutral-900">
              {formatPrice(price)}€
            </span>
          </div>
          
          {/* Indicateur de stock - ne s'affiche que si stock <= 2 */}
          {actualStock !== undefined && actualStock <= 2 && (
            <div className="text-xs">
              {actualStock > 0 ? (
                <span className="text-amber-600 font-medium">
                  Plus que {actualStock} en stock
                </span>
              ) : (
                <span className="text-red-600 font-medium">Épuisé</span>
              )}
            </div>
          )}
        </div>

        {/* Bouton d'action */}
        <button
          onClick={handleAddToCart}
          disabled={actualStock === 0 || isAdding}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 relative overflow-hidden ${
            actualStock === 0
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : justAdded
              ? 'bg-green-600 text-white'
              : isAdding
              ? 'bg-primary-500 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:transform active:scale-98 shadow-sm hover:shadow-md'
          }`}
        >
          {actualStock === 0 ? (
            'Produit épuisé'
          ) : isAdding ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Ajout...</span>
            </div>
          ) : justAdded ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ajouté !</span>
            </div>
          ) : (
            'Ajouter au panier'
          )}
        </button>

        {/* Erreur de stock */}
        {stockError && (
          <div className="mt-2 text-center">
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              {stockError}
            </span>
          </div>
        )}

        {/* Indicateur panier */}
        {productInCart && !justAdded && !stockError && (
          <div className="mt-2 text-center">
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
              {quantityInCart} dans le panier
            </span>
          </div>
        )}
      </div>

      {/* Indicateur de stock faible */}
      {actualStock && actualStock <= 3 && actualStock > 0 && (
        <div className="px-6 pb-4">
          <div className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full text-center font-medium">
            Plus que {actualStock} en stock
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
