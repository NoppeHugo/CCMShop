import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { stockService } from '../services/stockService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Persist cart in a cookie (avoid localStorage). Cookie is used only to keep cart across refreshes.
  const COOKIE_NAME = 'jewelry_cart';

  const readCartFromCookie = () => {
    try {
      const match = document.cookie.split('; ').find(row => row.startsWith(COOKIE_NAME + '='));
      if (!match) return null;
      const value = decodeURIComponent(match.split('=')[1] || '');
      const parsed = JSON.parse(value);
      return parsed;
    } catch (err) {
      console.warn('Impossible de lire le cookie du panier:', err);
      return null;
    }
  };

  const saveCartToCookie = (cartState) => {
    try {
      const serialized = JSON.stringify(cartState);
      // Guard: avoid huge cookies. If too large, skip saving.
      if (serialized.length > 3800) {
        console.warn('Cart too large to store in cookie; skipping persistence');
        return;
      }
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    } catch (err) {
      console.warn('Impossible de sauvegarder le panier dans le cookie:', err);
    }
  };

  // Charger le panier depuis le cookie au démarrage
  useEffect(() => {
    (async () => {
      try {
        // Try to read server-side cart
        const res = await fetch(`${API_BASE}/api/cart`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.items) {
            // map items shape
            const items = data.data.items.map(i => ({ id: i.productId, name: i.product.name || i.productId, price: i.product.price, quantity: i.quantity }));
            dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items } });
            return;
          }
        }
      } catch (err) {
        // ignore and fallback to cookie
      }

      const saved = readCartFromCookie();
      if (saved && saved.items) dispatch({ type: CART_ACTIONS.LOAD_CART, payload: saved });
    })();
  }, []);

  // Synchroniser le stock au démarrage
  useEffect(() => {
    stockService.syncWithProducts();
  }, []);

  // Persist cart to server on changes; fallback to cookie if backend unavailable
  useEffect(() => {
    (async () => {
      try {
        const payload = { items: state.items.map(i => ({ productId: i.id, quantity: i.quantity })) };
        const res = await fetch(`${API_BASE}/api/cart`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('cart save failed');
      } catch (err) {
        // fallback: cookie persistence
        saveCartToCookie(state);
      }
    })();
  }, [state]);

  // Fonctions utilitaires avec gestion de stock
  const addToCart = (product, quantity = 1) => {
    // Vérifier si le stock est disponible
    if (!stockService.isQuantityAvailable(product.id, quantity)) {
      const availableStock = stockService.getAvailableStock(product.id);
      console.warn(`Stock insuffisant. Disponible: ${availableStock}, Demandé: ${quantity}`);
      return false; // Échec de l'ajout
    }

  // Do not reserve stock client-side; only check availability for UX
  dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { product, quantity } });
  return true;
  };

  const removeFromCart = (productId) => {
  // Removing from cart does not release DB stock — reservations are server-side on order
  dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
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
  // Do not reserve stock client-side; rely on DB at confirmation
    } else if (quantityDifference < 0) {
      // Diminuer la quantité - libérer le stock
  // No-op: no client-side reservation to release
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity: newQuantity }
    });
    return true;
  };

  const clearCart = () => {
    // Clear local cart and server-side cart
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    (async () => {
      try {
        await fetch(`${API_BASE}/api/cart`, { method: 'DELETE', credentials: 'include' });
      } catch (err) {
        // ignore
      }
    })();
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

    // Send order to backend (if available). If backend fails, keep order in memory only.
    (async () => {
      try {
        // Send items with productId to match backend expectation
        const payloadItems = order.items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price }));
        const res = await fetch(`${API_BASE}/api/orders`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerInfo, items: payloadItems, shippingAddress: null, notes: null })
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Commande confirmée par le backend:', data);
        } else {
          console.warn('Échec création commande backend:', res.status);
          throw new Error('order failed');
        }
      } catch (err) {
        console.warn('Backend indisponible, commande en mémoire:', err);
        // If backend failed, do not decrement stock (items were reserved locally). We keep behavior: confirmSale still called.
      } finally {
        // Confirmer la vente dans le stockService et vider le panier localement
        stockService.confirmSale(state.items);
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
      }
    })();

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
