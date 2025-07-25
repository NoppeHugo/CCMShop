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

// Intercepteur pour les requêtes (logs réduits)
api.interceptors.request.use(
  (config) => {
    // Logs uniquement pour les erreurs importantes
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
    // Pas de log pour les réponses réussies en développement
    return response;
  },
  (error) => {
    // Logs réduits pour les erreurs
    if (error.code !== 'ERR_NETWORK') {
      console.error('❌ Erreur API:', error.response?.data || error.message);
    }
    
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
  // Récupérer tous les produits (backend seulement pour le site, backend + admin pour l'admin)
  getAll: async (params = {}) => {
    try {
      // Essayer de récupérer depuis le backend
      const response = await api.get('/api/products', { params });
      
      // Le backend retourne { success: true, data: [...] }
      const backendProducts = response.data?.data || response.data || [];
      
      // Si on est dans l'interface admin (détecté par l'URL ou localStorage admin connecté)
      const isAdminContext = window.location.pathname.includes('/admin') || 
                            localStorage.getItem('isAdminConnected');
      
      if (isAdminContext) {
        // Mode admin : combiner backend + localStorage
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const allProducts = [...backendProducts, ...adminProducts];
        return { data: allProducts };
      } else {
        // Mode site normal : seulement le backend
        return { data: backendProducts };
      }
    } catch (error) {
      // Backend non disponible - utiliser localStorage seulement si on est en admin
      const isAdminContext = window.location.pathname.includes('/admin') || 
                            localStorage.getItem('isAdminConnected');
      
      if (isAdminContext) {
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        return { data: adminProducts };
      } else {
        return { data: [] }; // Site normal sans backend = pas de produits
      }
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
      // Chercher d'abord dans les produits admin
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const adminProduct = adminProducts.find(p => p.id === parseInt(id));
      
      if (adminProduct) {
        return { data: adminProduct };
      }
      
      // Sinon chercher dans le backend
      const response = await api.get(`/api/products/${id}`);
      return { data: response.data };
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
  },

  // Supprimer un produit (localStorage uniquement)
  delete: async (id) => {
    try {
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const updatedProducts = adminProducts.filter(product => product.id !== parseInt(id));
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
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
