import axios from 'axios';

// URL de base de l'API (variable d'environnement ou hardcodée)
const API_URL = import.meta.env.VITE_API_URL || 'https://ccmshop-production.up.railway.app';

const apiService = {
  // Produits
  async getProducts() {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  },
  
  async getProductById(id) {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id}:`, error);
      throw error;
    }
  },
  
  // Vérifions comment la fonction createProduct est implémentée
  async createProduct(productData) {
    try {
      const response = await axios.post(`${API_URL}/api/products`, productData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  },
  
  async updateProduct(id, productData) {
    try {
      const response = await axios.put(`${API_URL}/api/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du produit ${id}:`, error);
      throw error;
    }
  },
  
  async deleteProduct(id) {
    try {
      const response = await axios.delete(`${API_URL}/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit ${id}:`, error);
      throw error;
    }
  },
  
  // Commandes
  async createOrder(orderData) {
    try {
      const response = await axios.post(`${API_URL}/api/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  },
  
  // Vérification API/DB
  async checkApiStatus() {
    try {
      const response = await axios.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de l\'API:', error);
      throw error;
    }
  }
};

export default apiService;