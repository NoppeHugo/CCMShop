import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { stockService } from '../services/stockService';

// Actions pour le panier
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer pour gérer l'état du panier
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Le produit existe déjà, on met à jour la quantité
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Nouveau produit
        return {
          ...state,
          items: [...state.items, { ...product, quantity }]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.productId)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la quantité est 0 ou moins, on supprime l'article
        return {
          ...state,
          items: state.items.filter(item => item.id !== productId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload.items || []
      };
    }

    default:
      return state;
  }
};

// État initial du panier
const initialCartState = {
  items: []
};

// Création du contexte
const CartContext = createContext();

// Hook personnalisé pour utiliser le contexte du panier
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
};

// Fournisseur du contexte du panier
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Charger le panier depuis le localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('jewelry-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: parsedCart
        });
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
  }, []);

  // Synchroniser le stock au démarrage
  useEffect(() => {
    stockService.syncWithProducts();
  }, []);

  // Sauvegarder le panier dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('jewelry-cart', JSON.stringify(state));
  }, [state]);

  // Fonctions utilitaires avec gestion de stock
  const addToCart = (product, quantity = 1) => {
    // Vérifier si le stock est disponible
    if (!stockService.isQuantityAvailable(product.id, quantity)) {
      const availableStock = stockService.getAvailableStock(product.id);
      console.warn(`Stock insuffisant. Disponible: ${availableStock}, Demandé: ${quantity}`);
      return false; // Échec de l'ajout
    }

    // Réserver le stock
    const stockReserved = stockService.reserveStock(product.id, quantity);
    
    if (stockReserved) {
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: { product, quantity }
      });
      return true; // Succès de l'ajout
    }
    return false; // Échec de l'ajout
  };

  const removeFromCart = (productId) => {
    // Trouver l'article dans le panier pour libérer le stock
    const itemToRemove = state.items.find(item => item.id === productId);
    if (itemToRemove) {
      stockService.releaseStock(productId, itemToRemove.quantity);
    }
    
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    const currentItem = state.items.find(item => item.id === productId);
    if (!currentItem) return false;

    const quantityDifference = newQuantity - currentItem.quantity;

    if (quantityDifference > 0) {
      // Augmenter la quantité - vérifier le stock
      if (!stockService.isQuantityAvailable(productId, quantityDifference)) {
        const availableStock = stockService.getAvailableStock(productId);
        console.warn(`Stock insuffisant pour augmenter la quantité. Disponible: ${availableStock}`);
        return false;
      }
      // Réserver le stock supplémentaire
      stockService.reserveStock(productId, quantityDifference);
    } else if (quantityDifference < 0) {
      // Diminuer la quantité - libérer le stock
      stockService.releaseStock(productId, Math.abs(quantityDifference));
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity: newQuantity }
    });
    return true;
  };

  const clearCart = () => {
    // Libérer tout le stock réservé
    stockService.cancelReservation(state.items);
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Fonction pour finaliser la commande
  const confirmOrder = (customerInfo, deliveryType) => {
    // Créer la commande
    const order = {
      id: Date.now(),
      orderNumber: `CCM-${Date.now().toString().slice(-6)}`,
      customerInfo,
      deliveryType,
      items: state.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Commande créée'
        }
      ]
    };

    // Sauvegarder la commande
    try {
      const existingOrders = JSON.parse(localStorage.getItem('jewelry-orders') || '[]');
      const updatedOrders = [...existingOrders, order];
      localStorage.setItem('jewelry-orders', JSON.stringify(updatedOrders));
      console.log('Commande sauvegardée:', order);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande:', error);
    }

    // Confirmer la vente dans le stockService
    stockService.confirmSale(state.items);
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    
    return order;
  };

  // Calculs dérivés
  const cartTotal = state.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const cartItemsCount = state.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Nouvelles fonctions pour la gestion de stock
  const getAvailableStock = (productId) => {
    return stockService.getAvailableStock(productId);
  };

  const canAddToCart = (productId, quantity = 1) => {
    return stockService.isQuantityAvailable(productId, quantity);
  };

  // Valeur du contexte
  const value = {
    // État
    cartItems: state.items,
    cartTotal,
    cartItemsCount,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    confirmOrder,
    
    // Utilitaires
    isInCart,
    getItemQuantity,
    getAvailableStock,
    canAddToCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
