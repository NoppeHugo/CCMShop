const { supabase } = require('../config/supabase');

class ProductsService {
  
  // Créer un nouveau produit
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur création produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les produits
  async getAllProducts(filters = {}) {
    try {
      let query = supabase.from('products').select('*');

      // Appliquer les filtres
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.limit) {
        query = query.limit(parseInt(filters.limit));
      }

      // Trier par date de création (plus récent en premier)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Récupérer un produit par ID
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur récupération produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour un produit
  async updateProduct(id, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur mise à jour produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un produit
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le stock d'un produit
  async updateStock(id, quantity) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: quantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur mise à jour stock:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ProductsService();
