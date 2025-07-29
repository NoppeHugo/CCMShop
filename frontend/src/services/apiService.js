import axios from 'axios';

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'https://ccmshop-production.up.railway.app';

console.log('🔧 API URL configurée:', API_URL);

// Configuration axios avec intercepteurs pour le débogage
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 secondes de timeout
});

// Intercepteur pour logger les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Réponse ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const apiService = {
  // Vérifier le statut de l'API
  checkApiStatus: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de l\'API:', error);
      throw error;
    }
  },

  // Récupérer tous les produits
  getProducts: async () => {
    try {
      const response = await api.get('/api/products');
      console.log('✅ Réponse API complète:', response.data);
      
      // L'API retourne { success, count, source, database, data }
      // Nous devons retourner la structure attendue par AdminDashboard
      if (response.data && response.data.success && response.data.data) {
        const result = {
          success: response.data.success,
          count: response.data.count,
          source: response.data.source,
          database: response.data.database,
          data: response.data.data // Les produits sont ici
        };
        
        console.log('✅ Produits formatés pour le frontend:', result);
        return result;
      }
      
      // Fallback si la structure est différente
      console.warn('⚠️ Structure de réponse inattendue:', response.data);
      return {
        success: false,
        count: 0,
        source: 'api-error',
        data: []
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits:', error);
      throw error;
    }
  },

  // Créer un nouveau produit
  createProduct: async (productData) => {
    try {
      console.log('🔍 Création d\'un produit:', productData);
      
      // S'assurer que les types sont corrects
      const cleanProductData = {
        name: String(productData.name || ''),
        description: String(productData.description || ''),
        price: parseFloat(productData.price) || 0,
        category: String(productData.category || ''),
        stock: parseInt(productData.stock, 10) || 0,
        featured: Boolean(productData.featured),
        images: Array.isArray(productData.images) 
          ? productData.images 
          : (productData.images ? [productData.images] : [])
      };
      
      console.log('📤 Données nettoyées envoyées:', cleanProductData);
      
      const response = await api.post('/api/products', cleanProductData);
      console.log('✅ Produit créé avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du produit:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mettre à jour un produit
  updateProduct: async (id, productData) => {
    try {
      console.log('🔧 Mise à jour du produit:', id, productData);
      const response = await api.put(`/api/products/${id}`, productData);
      console.log('✅ Produit mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    try {
      console.log('🗑️ Suppression du produit:', id);
      const response = await api.delete(`/api/products/${id}`);
      console.log('✅ Produit supprimé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du produit:', error);
      throw error;
    }
  },

  // Récupérer un produit par ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }
};

export default apiService;