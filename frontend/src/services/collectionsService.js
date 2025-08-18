// Service de gestion des collections
class CollectionsService {
  constructor() {
    this.base = import.meta.env.VITE_API_URL || ''; // e.g. http://localhost:5000
    this.cache = null; // simple in-memory cache
  }

  async getAll() {
    try {
      const res = await fetch(`${this.base}/api/collections`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        this.cache = json.data;
        return json.data;
      }
      return [];
    } catch (err) {
      console.error('Erreur getAll collections:', err);
      return [];
    }
  }

  async getById(id) {
    try {
      const res = await fetch(`${this.base}/api/collections/${id}`, { credentials: 'include' });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Erreur getById collection:', err);
      return null;
    }
  }

  async create(data) {
    try {
      const res = await fetch(`${this.base}/api/collections`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Erreur create collection:', err);
      return null;
    }
  }

  async update(id, updates) {
    try {
      const res = await fetch(`${this.base}/api/collections/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Erreur update collection:', err);
      return null;
    }
  }

  async delete(id) {
    try {
      const res = await fetch(`${this.base}/api/collections/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Erreur delete collection:', err);
      return false;
    }
  }

  async addProduct(collectionId, productId) {
    try {
      const res = await fetch(`${this.base}/api/collections/${collectionId}/products`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Erreur addProduct to collection:', err);
      return false;
    }
  }

  async removeProduct(collectionId, productId) {
    try {
      const res = await fetch(`${this.base}/api/collections/${collectionId}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Erreur removeProduct from collection:', err);
      return false;
    }
  }

  // Helper: fetch collections then filter client-side by category
  async getCollectionsByCategoryAsync(category) {
    try {
      const all = await this.getAll();
      return all.filter(col => col.active && col.produits && col.produits.some(p => p.product && p.product.category === category));
    } catch (err) {
      console.error('Erreur getCollectionsByCategoryAsync:', err);
      return [];
    }
  }

  // Stats
  async getStats() {
    const all = await this.getAll();
    const total = all.length;
    const active = all.filter(c => c.active).length;
    const totalProducts = all.reduce((sum, c) => sum + (c.produits ? c.produits.length : 0), 0);
    return { total, active, inactive: total - active, totalProducts };
  }
}

const collectionsService = new CollectionsService();
export default collectionsService;
