import apiService from './apiService';

class StockService {
  constructor() {
    this.stockData = {};
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.loadProducts();
      this.initialized = true;
    }
    return this.stockData;
  }

  async loadProducts() {
    try {
      const response = await apiService.getProducts();
      if (response && response.data) {
        this.updateProductsData(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // Fallback sur localStorage si existant
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        this.updateProductsData(JSON.parse(savedProducts));
      }
    }
  }

  updateProductsData(products) {
    // Mettre à jour les données de stock basées sur les produits
    products.forEach(product => {
      this.stockData[product.id] = {
        id: product.id,
        name: product.name,
        stock: product.stock || 0,
        minLevel: product.minStockLevel || 5,
        lastUpdated: new Date().toISOString()
      };
    });
    return this.stockData;
  }

  async updateStock(productId, newStockLevel) {
    try {
      // Récupérer le produit actuel
      const productResponse = await apiService.getProductById(productId);
      const product = productResponse.data;
      
      if (!product) {
        throw new Error(`Produit avec ID ${productId} non trouvé`);
      }
      
      // Mettre à jour le stock du produit
      const updatedProduct = {
        ...product,
        stock: newStockLevel
      };
      
      // Envoyer la mise à jour à l'API
      await apiService.updateProduct(productId, updatedProduct);
      
      // Mettre à jour les données locales
      if (this.stockData[productId]) {
        this.stockData[productId] = {
          ...this.stockData[productId],
          stock: newStockLevel,
          lastUpdated: new Date().toISOString()
        };
      }
      
      return this.stockData[productId];
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du stock pour le produit ${productId}:`, error);
      throw error;
    }
  }

  async syncWithProducts() {
    await this.loadProducts();
    return this.stockData;
  }

  getStockLevel(productId) {
    return this.stockData[productId]?.stock || 0;
  }

  isLowStock(productId) {
    const product = this.stockData[productId];
    if (!product) return false;
    return product.stock <= product.minLevel;
  }
}

// Singleton
export const stockService = new StockService();
