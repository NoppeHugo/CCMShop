/**
 * Utilitaire pour vérifier que les données proviennent bien de Supabase
 */

import apiService from '../services/apiService';

export async function validateDataSource() {
  try {
    console.group('🔍 Vérification de la source de données');
    
    // Vérifier l'API
    console.log('Vérification de l\'API...');
    const apiStatus = await apiService.checkApiStatus();
    console.log('Statut API:', apiStatus);
    
    // Vérifier les produits
    console.log('Vérification des produits...');
    const products = await apiService.getProducts();
    console.log('Produits:', products);
    
    // Diagnostic
    const isSupabase = 
      apiStatus.database?.includes('Supabase') || 
      products.source === 'supabase';
    
    if (isSupabase) {
      console.log('✅ SUCCÈS: L\'application utilise Supabase comme source de données');
    } else {
      console.warn('⚠️ ATTENTION: L\'application n\'utilise PAS Supabase');
      console.warn('Source actuelle:', apiStatus.database || products.source || 'Inconnue');
    }
    
    // Vérifier localStorage
    const localProducts = localStorage.getItem('products');
    const adminProducts = localStorage.getItem('adminProducts');
    
    if (localProducts || adminProducts) {
      console.warn('⚠️ Des données produits sont encore stockées dans localStorage');
      if (localProducts) console.log('localStorage.products:', JSON.parse(localProducts).length, 'produits');
      if (adminProducts) console.log('localStorage.adminProducts:', JSON.parse(adminProducts).length, 'produits');
      
      console.log('💡 Conseil: Supprimez ces données pour forcer l\'utilisation de l\'API');
    } else {
      console.log('✅ Aucune donnée produit dans localStorage - parfait !');
    }
    
    return {
      success: isSupabase,
      usingSupabase: isSupabase,
      database: apiStatus.database,
      productCount: products.count,
      hasLocalStorage: !!(localProducts || adminProducts)
    };
  } catch (error) {
    console.error('❌ Erreur lors de la validation des données:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    console.groupEnd();
  }
}

// Fonction pour nettoyer localStorage
export function cleanupLocalStorage() {
  console.log('🧹 Nettoyage des données produits dans localStorage...');
  localStorage.removeItem('products');
  localStorage.removeItem('adminProducts');
  console.log('✅ Nettoyage terminé');
  
  // Retourner le nombre d'éléments restants
  return Object.keys(localStorage).length;
}