import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartModal = ({ isOpen, onClose }) => {
  const {
    cartItems,
    cartTotal,
    cartItemsCount,
    updateQuantity,
    removeFromCart
  } = useCart();

  if (!isOpen) return null;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900">
            Panier ({cartItemsCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {cartItems.length === 0 ? (
            // Panier vide
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-neutral-600 mb-4">Votre panier est vide</p>
                <Link 
                  to="/boutique" 
                  onClick={onClose}
                  className="btn-primary text-sm"
                >
                  Découvrir nos bijoux
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Liste des articles */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    {/* Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-champagne to-accent-rose rounded-lg overflow-hidden flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/64x64/F7E7CE/D4AF37?text=${encodeURIComponent(item.name.charAt(0))}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-primary-700 text-lg opacity-60">◊</span>
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-neutral-900 truncate pr-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-xs text-neutral-500 capitalize mb-2">
                        {item.category?.replace('-', ' ')}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Contrôles de quantité */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="w-6 text-center text-sm font-medium text-neutral-900">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Prix */}
                        <p className="text-sm font-semibold text-neutral-900">
                          {(item.price * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pied de page */}
              <div className="border-t border-neutral-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-neutral-900">Total</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {cartTotal.toFixed(2)}€
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link 
                    to="/panier" 
                    onClick={onClose}
                    className="btn-secondary w-full text-center block text-sm"
                  >
                    Voir le panier complet
                  </Link>
                  <Link 
                    to="/commande" 
                    onClick={onClose}
                    className="btn-primary w-full text-center block text-sm"
                  >
                    Passer la commande
                  </Link>
                </div>

                {/* Informations */}
                <div className="text-xs text-neutral-500 text-center">
                  Livraison gratuite • Paiement sécurisé
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartModal;
