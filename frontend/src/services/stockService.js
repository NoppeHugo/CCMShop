import { productsService } from './api';

// Service de gestion du stock
class StockService {
  constructor() {
  // Keep stock in memory; do not persist to localStorage per requirements.
  this.stockData = {};
  }

  // Charger les données de stock depuis localStorage
  loadStockFromStorage() {
  // deprecated: localStorage persistence removed
  return {};
  }

  // Sauvegarder les données de stock
  saveStockToStorage() {
  // deprecated: no-op
  }

  // Obtenir le stock disponible pour un produit
  getAvailableStock(productId) {
    return this.stockData[productId] || 0;
  }

  // Définir le stock initial pour un produit
  setInitialStock(productId, stock) {
    this.stockData[productId] = stock;
    this.saveStockToStorage();
  }

  // Vérifier si une quantité est disponible
  isQuantityAvailable(productId, requestedQuantity) {
    const availableStock = this.getAvailableStock(productId);
    return availableStock >= requestedQuantity;
  }

  // Réserver du stock (ajouter au panier)
  reserveStock(productId, quantity) {
    const currentStock = this.getAvailableStock(productId);
    
    if (currentStock >= quantity) {
      this.stockData[productId] = currentStock - quantity;
      this.saveStockToStorage();
      return true;
    }
    return false;
  }

  // Libérer du stock (retirer du panier)
  releaseStock(productId, quantity) {
    const currentStock = this.getAvailableStock(productId);
    this.stockData[productId] = currentStock + quantity;
    this.saveStockToStorage();
  }

  // Confirmer la vente (finaliser la commande)
  confirmSale(cartItems) {
    // Le stock est déjà réservé, pas besoin de le modifier
    // On pourrait ici envoyer les données au backend
    console.log('Vente confirmée pour:', cartItems);
  }

  // Annuler une réservation complète (vider le panier)
  cancelReservation(cartItems) {
    cartItems.forEach(item => {
      this.releaseStock(item.id, item.quantity);
    });
  }

  // Fonction de debug pour afficher l'état du stock
  debugStock() {
    console.log('=== ÉTAT DU STOCK ===');
  console.log('Données en mémoire:', this.stockData);
    console.log('=====================');
    return this.stockData;
  }

  // Synchroniser avec les produits sans perdre les modifications existantes
  async forceResyncWithProducts() {
    try {
      const response = await productsService.getAll();
      const products = response.data || [];

      // Seulement ajouter les nouveaux produits, ne pas écraser les stocks existants
      let hasChanges = false;
      products.forEach(product => {
        // Si le produit n'existe pas encore dans notre stock, l'ajouter
        if (!(product.id in this.stockData)) {
          this.stockData[product.id] = product.stock || 0;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        this.saveStockToStorage();
        console.log('📦 Stock synchronisé avec nouveaux produits');
      }
      
      return this.stockData;
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return this.stockData;
    }
  }

  // Forcer une réinitialisation COMPLÈTE du stock (pour l'admin)
  async forceCompleteReset() {
    try {
      const response = await productsService.getAll();
      const products = response.data || [];

      // Réinitialiser complètement le stock
      this.stockData = {};
      products.forEach(product => {
        this.stockData[product.id] = product.stock || 0;
      });

      this.saveStockToStorage();
      console.log('Stock complètement réinitialisé:', this.stockData);
      return this.stockData;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation complète:', error);
      return this.stockData;
    }
  }

  // Synchroniser avec les produits admin
  async syncWithProducts() {
    try {
      // Charger tous les produits
      const response = await productsService.getAll();
      const products = response.data || [];

      // Pour chaque produit, s'assurer qu'il a un stock défini
      products.forEach(product => {
        if (!(product.id in this.stockData)) {
          // Si le produit n'a pas de stock défini, utiliser son stock initial
          this.stockData[product.id] = product.stock || 0;
        }
        // Si le produit vient des données admin/localStorage et a un stock défini, on le garde
        // Mais on s'assure qu'il n'est pas négatif
        if (this.stockData[product.id] < 0) {
          this.stockData[product.id] = product.stock || 0;
        }
      });

      this.saveStockToStorage();
      return this.stockData;
    } catch (error) {
      console.error('Erreur lors de la synchronisation du stock:', error);
      return this.stockData;
    }
  }

  // Obtenir un rapport de stock
  getStockReport() {
    return Object.entries(this.stockData).map(([productId, stock]) => ({
      productId,
      stock,
      status: stock === 0 ? 'out-of-stock' : stock <= 3 ? 'low-stock' : 'in-stock'
    }));
  }

  // Mettre à jour le stock d'un produit (pour l'admin)
  updateProductStock(productId, newStock) {
    this.stockData[productId] = newStock;
    this.saveStockToStorage();
    
    // Aussi mettre à jour le stock dans les données produit admin
    this.updateProductInAdminStorage(productId, newStock);
  }

  // Ajouter du stock (réapprovisionnement)
  addStock(productId, quantity) {
    const currentStock = this.getAvailableStock(productId);
    const newStock = currentStock + quantity;
    this.stockData[productId] = newStock;
    this.saveStockToStorage();
    
    // Aussi mettre à jour le stock dans les données produit admin
    this.updateProductInAdminStorage(productId, newStock);
  }

  // Supprimer un produit du stock
  removeProduct(productId) {
    if (this.stockData[productId] !== undefined) {
      delete this.stockData[productId];
      this.saveStockToStorage();
      console.log(`Produit ${productId} supprimé du stock`);
    }
  }

  // Mettre à jour le stock dans les données produit admin
  updateProductInAdminStorage(productId, newStock) {
    try {
      // Tenter une mise à jour côté backend; ne pas écrire dans localStorage en production
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
          });
          if (res.ok) {
            console.log(`Stock mis à jour dans la base pour le produit ${productId}: ${newStock}`);
          } else {
            console.error(`Échec mise à jour stock backend: ${res.status} ${res.statusText}`);
          }
        } catch (err) {
          console.error('Erreur mise à jour stock via API:', err);
        }
      })();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit admin:', error);
    }
  }
}

// Instance singleton
export const stockService = new StockService();
