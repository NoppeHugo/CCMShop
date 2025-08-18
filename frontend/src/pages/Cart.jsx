import React, { useState } from 'react';
import formatPrice from '../utils/formatPrice';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    cartItemsCount,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-padding">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-neutral-900 mb-4">
                Votre panier est vide
              </h1>
              
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Découvrez nos magnifiques créations et ajoutez vos bijoux préférés à votre panier.
              </p>
              
              <Link 
                to="/boutique" 
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Découvrir nos bijoux</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-neutral-900 mb-2">
              Mon Panier
            </h1>
            <p className="text-neutral-600">
              {cartItemsCount} {cartItemsCount > 1 ? 'articles' : 'article'} dans votre panier
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* En-tête du tableau */}
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                  <div className="flex justify-between items-center">
                    <h2 className="font-medium text-neutral-900">Articles</h2>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Vider le panier
                    </button>
                  </div>
                </div>

                {/* Articles */}
                <div className="divide-y divide-neutral-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-accent-champagne to-accent-rose rounded-lg overflow-hidden flex-shrink-0">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/80x80/F7E7CE/D4AF37?text=${encodeURIComponent(item.name.charAt(0))}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-primary-700 text-xl opacity-60">◊</span>
                            </div>
                          )}
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-neutral-900 truncate pr-4">
                                {item.name}
                              </h3>
                              <p className="text-sm text-neutral-500 capitalize">
                                {item.category?.replace('-', ' ')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Supprimer cet article"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex justify-between items-center">
                            {/* Contrôles de quantité */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <span className="w-8 text-center font-medium text-neutral-900">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>

                            {/* Prix */}
                            <div className="text-right">
                              <p className="font-semibold text-neutral-900">
                                {formatPrice(item.price * item.quantity)}€
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-neutral-500">
                                  {formatPrice(item.price)}€ × {item.quantity}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-medium text-neutral-900 mb-6">
                  Résumé de la commande
                </h2>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-neutral-600">
                    <span>Sous-total ({cartItemsCount} {cartItemsCount > 1 ? 'articles' : 'article'})</span>
                    <span>{formatPrice(cartTotal)}€</span>
                  </div>
                  
                  <div className="flex justify-between text-neutral-600">
                    <span>Livraison</span>
                    <span className="text-green-600 font-medium">Gratuite</span>
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-neutral-900">Total</span>
                      <span className="text-xl font-semibold text-neutral-900">{formatPrice(cartTotal)}€</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link 
                    to="/commande" 
                    className="btn-primary w-full text-center block"
                  >
                    Passer la commande
                  </Link>
                  
                  <Link 
                    to="/boutique" 
                    className="btn-secondary w-full text-center block"
                  >
                    Continuer mes achats
                  </Link>
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="space-y-3 text-sm text-neutral-600">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Livraison gratuite</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Satisfaction garantie</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation pour vider le panier */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              Vider le panier ?
            </h3>
            <p className="text-neutral-600 mb-6">
              Êtes-vous sûr de vouloir supprimer tous les articles de votre panier ? 
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleClearCart}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex-1"
              >
                Vider le panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
