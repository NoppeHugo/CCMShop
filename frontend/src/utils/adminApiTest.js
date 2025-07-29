/**
 * Utilitaire de test pour les opérations API de l'interface admin
 */

import apiService from '../services/apiService';

// Test d'ajout de produit
export async function testAddProduct() {
  console.group('🧪 Test d\'ajout de produit via API');
  
  try {
    const testProduct = {
      name: `Test Interface ${new Date().toLocaleTimeString()}`,
      description: 'Produit de test pour l\'interface admin',
      price: 59.99,
      category: 'colliers',
      stock: 7,
      featured: false,
      images: ['https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Test+Admin']
    };
    
    console.log('📤 Envoi du produit test:', testProduct);
    
    // Appel direct à apiService sans passer par les composants React
    const response = await apiService.createProduct(testProduct);
    
    console.log('✅ Réponse de l\'API:', response);
    console.log('🎯 Test réussi! Produit créé avec succès');
    
    return {
      success: true,
      productId: response.data?.id,
      response
    };
  } catch (error) {
    console.error('❌ Échec du test:', error);
    return {
      success: false,
      error
    };
  } finally {
    console.groupEnd();
  }
}

// Fonction pour tester toute la chaîne API
export async function runAdminApiTests() {
  console.log('🚀 Démarrage des tests API admin...');
  
  // Test de connexion à l'API
  try {
    const status = await apiService.checkApiStatus();
    console.log('✅ API connectée:', status);
  } catch (error) {
    console.error('❌ Échec de connexion à l\'API:', error);
    return false;
  }
  
  // Test de récupération des produits
  try {
    const products = await apiService.getProducts();
    console.log('✅ Produits récupérés:', products.count, 'produits');
    
    if (products.count === 0) {
      console.warn('⚠️ Aucun produit trouvé dans la base de données');
    }
  } catch (error) {
    console.error('❌ Échec de récupération des produits:', error);
    return false;
  }
  
  console.log('✅ Tous les tests de base ont réussi!');
  return true;
}

// Exposer une fonction à appeler depuis la console du navigateur
if (typeof window !== 'undefined') {
  window.testAdminApi = runAdminApiTests;
}