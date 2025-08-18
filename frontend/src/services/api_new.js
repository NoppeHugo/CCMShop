import axios from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse:', error.response?.data || error.message);
    
    // Gestion des erreurs courantes
    if (error.response?.status === 404) {
      console.warn('⚠️ Ressource non trouvée');
    } else if (error.response?.status === 500) {
      console.error('🔥 Erreur serveur');
    }
    
    return Promise.reject(error);
  }
);

// Services pour les produits
export const productsService = {
  // Récupérer tous les produits (combine backend + admin)
  getAll: async (params = {}) => {
    try {
      // Essayer de récupérer depuis le backend
  const response = await api.get('/api/products', { params });
  const backendProducts = response.data?.data || response.data || [];
  return { data: backendProducts };
    } catch (error) {
  console.error('Erreur API getAll products:', error);
  return { data: [] };
    }
  },

  // Récupérer les produits mis en avant
  getFeatured: async (limit = 4) => {
    try {
      const allProductsResponse = await productsService.getAll();
      const allProducts = allProductsResponse.data || [];
      
      // Filtrer les produits marqués comme "featured" puis prendre les premiers
      const featuredProducts = allProducts
        .filter(product => product.featured)
        .slice(0, limit);
      
      // Si pas assez de produits featured, compléter avec les plus récents
      if (featuredProducts.length < limit) {
        const remainingProducts = allProducts
          .filter(product => !product.featured)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, limit - featuredProducts.length);
        
        featuredProducts.push(...remainingProducts);
      }
      
      return { data: featuredProducts };
    } catch (error) {
      console.error('Erreur lors du chargement des produits mis en avant:', error);
      return { data: [] };
    }
  },

  // Récupérer un produit par ID
  getById: async (id) => {
    try {
  const response = await api.get(`/api/products/${id}`);
  return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('Produit non trouvé:', error);
      throw error;
    }
  },

  // Récupérer par catégorie
  getByCategory: async (category) => {
    try {
      const allProductsResponse = await productsService.getAll();
      const allProducts = allProductsResponse.data || [];
      
      const filteredProducts = allProducts.filter(product => 
        product.category === category
      );
      
      return { data: filteredProducts };
    } catch (error) {
      console.error('Erreur lors du filtrage par catégorie:', error);
      return { data: [] };
    }
  },

  // Récupérer les catégories disponibles
  getCategories: async () => {
    try {
      const allProductsResponse = await productsService.getAll();
      const allProducts = allProductsResponse.data || [];
      
      const categories = [...new Set(allProducts.map(product => product.category))];
      return { data: categories };
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      return { data: ['colliers', 'bagues', 'boucles-oreilles', 'bracelets'] };
    }
  }
};

// Services pour les commandes
export const ordersService = {
  // Créer une nouvelle commande
  create: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Récupérer une commande par ID
  getById: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Récupérer toutes les commandes (admin)
  getAll: async (params = {}) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
  }
};

export default api;
