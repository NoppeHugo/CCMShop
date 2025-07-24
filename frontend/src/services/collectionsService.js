// Service de gestion des collections
class CollectionsService {
  constructor() {
    this.storageKey = 'jewelry_collections';
    this.collections = this.loadCollections();
  }

  // Charger les collections depuis le localStorage
  loadCollections() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const collections = stored ? JSON.parse(stored) : [];
      
      // Migration: ajouter le champ imageApercu aux anciennes collections
      const migratedCollections = collections.map(collection => {
        if (!collection.hasOwnProperty('imageApercu')) {
          return {
            ...collection,
            imageApercu: '' // Ajouter le champ manquant
          };
        }
        return collection;
      });
      
      // Sauvegarder la version migrée si nécessaire
      if (migratedCollections.length !== collections.length || 
          migratedCollections.some((col, index) => !collections[index].hasOwnProperty('imageApercu'))) {
        localStorage.setItem(this.storageKey, JSON.stringify(migratedCollections));
      }
      
      return migratedCollections;
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
      return [];
    }
  }

  // Sauvegarder les collections dans le localStorage
  saveCollections() {
    try {
      const dataToSave = JSON.stringify(this.collections);
      localStorage.setItem(this.storageKey, dataToSave);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des collections:', error);
    }
  }

  // Obtenir toutes les collections
  getAll() {
    return this.collections.sort((a, b) => new Date(a.dateCreation) - new Date(b.dateCreation));
  }

  // Obtenir une collection par ID
  getById(id) {
    return this.collections.find(collection => collection.id === id);
  }

  // Créer une nouvelle collection
  create(collectionData) {
    const newCollection = {
      id: Date.now(),
      nom: collectionData.nom,
      description: collectionData.description || '',
      imageCouverture: collectionData.imageCouverture || '', // Image rectangulaire principale
      imageApercu: collectionData.imageApercu || '', // Image carrée pour aperçu
      produits: [], // IDs des produits associés
      dateCreation: new Date().toISOString(),
      active: true
    };

    this.collections.push(newCollection);
    this.saveCollections();
    
    return newCollection;
  }

  // Mettre à jour une collection
  update(id, updates) {
    const index = this.collections.findIndex(collection => collection.id === id);
    if (index === -1) {
      throw new Error('Collection non trouvée');
    }

    this.collections[index] = {
      ...this.collections[index],
      ...updates,
      dateModification: new Date().toISOString()
    };

    this.saveCollections();
    return this.collections[index];
  }

  // Supprimer une collection
  delete(id) {
    const index = this.collections.findIndex(collection => collection.id === id);
    if (index === -1) {
      throw new Error('Collection non trouvée');
    }

    const deletedCollection = this.collections.splice(index, 1)[0];
    this.saveCollections();
    
    console.log('🗑️ Collection supprimée:', deletedCollection);
    return deletedCollection;
  }

  // Ajouter un produit à une collection
  addProduct(collectionId, productId) {
    const collection = this.getById(collectionId);
    if (!collection) {
      throw new Error('Collection non trouvée');
    }

    if (!collection.produits.includes(productId)) {
      collection.produits.push(productId);
      this.update(collectionId, { produits: collection.produits });
      console.log(`📦 Produit ${productId} ajouté à la collection ${collection.nom}`);
    }

    return collection;
  }

  // Retirer un produit d'une collection
  removeProduct(collectionId, productId) {
    const collection = this.getById(collectionId);
    if (!collection) {
      throw new Error('Collection non trouvée');
    }

    collection.produits = collection.produits.filter(id => id !== productId);
    this.update(collectionId, { produits: collection.produits });
    
    console.log(`📦 Produit ${productId} retiré de la collection ${collection.nom}`);
    return collection;
  }

  // Obtenir les produits d'une collection
  getCollectionProducts(collectionId) {
    const collection = this.getById(collectionId);
    if (!collection) {
      return [];
    }

    // Récupérer les produits depuis le localStorage des produits admin
    try {
      const allProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      return allProducts.filter(product => collection.produits.includes(product.id));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      return [];
    }
  }

  // Obtenir les collections contenant un produit spécifique
  getProductCollections(productId) {
    return this.collections.filter(collection => 
      collection.produits.includes(productId)
    );
  }

  // Obtenir les collections contenant des produits d'une catégorie
  getCollectionsByCategory(category) {
    try {
      const products = JSON.parse(localStorage.getItem('jewelry_products') || '[]');
      const categoryProducts = products.filter(product => product.category === category);
      const categoryProductIds = categoryProducts.map(product => product.id);
      
      return this.collections.filter(collection => 
        collection.active && 
        collection.produits.some(productId => categoryProductIds.includes(productId))
      );
    } catch (error) {
      console.error('Erreur lors du filtrage des collections par catégorie:', error);
      return [];
    }
  }

  // Obtenir les statistiques des collections
  getStats() {
    const total = this.collections.length;
    const active = this.collections.filter(c => c.active).length;
    
    return {
      total,
      active,
      inactive: total - active,
      totalProducts: this.collections.reduce((sum, c) => sum + c.produits.length, 0)
    };
  }
}

// Instance unique
const collectionsService = new CollectionsService();
export default collectionsService;
