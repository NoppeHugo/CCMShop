const { prisma } = require('../config/supabase');

class ProductsService {
  // Créer un nouveau produit
  async createProduct(productData) {
    try {
      const created = await prisma.product.create({ data: productData });
      return { success: true, data: created };
    } catch (error) {
      console.error('Erreur création produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les produits
  async getAllProducts(filters = {}) {
    try {
      const where = {};
      if (filters.category) where.category = filters.category;
      if (filters.featured !== undefined) where.featured = filters.featured === 'true' || filters.featured === true;

      const take = filters.limit ? parseInt(filters.limit) : undefined;

      const data = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take
      });

      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Récupérer un produit par ID
  async getProductById(id) {
    try {
      const data = await prisma.product.findUnique({ where: { id } });
      if (!data) return { success: false, error: 'Produit non trouvé' };
      return { success: true, data };
    } catch (error) {
      console.error('Erreur récupération produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour un produit
  async updateProduct(id, updates) {
    try {
      const data = await prisma.product.update({ where: { id }, data: updates });
      return { success: true, data };
    } catch (error) {
      console.error('Erreur mise à jour produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un produit
  async deleteProduct(id) {
    try {
      await prisma.product.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le stock d'un produit
  async updateStock(id, quantity) {
    try {
      const data = await prisma.product.update({ where: { id }, data: { stock: quantity } });
      return { success: true, data };
    } catch (error) {
      console.error('Erreur mise à jour stock:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ProductsService();
