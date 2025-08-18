import React, { useState, useEffect } from 'react';

const AddProductForm = ({ onClose, onProductAdded, onProductUpdated, editingProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'colliers',
    stock: '1',
    featured: false
  });
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire avec les données du produit à éditer
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price?.toString() || '',
        category: editingProduct.category || 'colliers',
        stock: editingProduct.stock?.toString() || '1',
        featured: editingProduct.featured || false
      });
      setImages(editingProduct.images || []);
    }
  }, [editingProduct]);

  const categories = [
    { value: 'colliers', label: 'Colliers' },
    { value: 'bagues', label: 'Bagues' },
    { value: 'boucles-oreilles', label: 'Boucles d\'oreilles' },
    { value: 'bracelets', label: 'Bracelets' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newImages = [];
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            id: Date.now() + index,
            file: file,
            preview: e.target.result,
            name: file.name
          });
          
          if (newImages.length === files.length) {
            setImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation simple
    if (!formData.name || !formData.price) {
      alert('Veuillez remplir au moins le nom et le prix');
      setLoading(false);
      return;
    }

    // Appel réel à l'API backend pour créer/mettre à jour
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  (async () => {
      try {
        if (editingProduct) {
          // Édition : appeler endpoint PUT si nécessaire (non implémenté ici)
          const updatedProduct = {
            ...editingProduct,
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            images: images.map(img => typeof img === 'string' ? img : img.preview),
            updatedAt: new Date().toISOString()
          };
          // Appeler callback local pour l'instant
          onProductUpdated(updatedProduct);
        } else {
          // Création : POST vers /api/products
          const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            images: images.map(img => typeof img === 'string' ? img : img.preview)
          };

          const res = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Erreur création produit');
          }

          const body = await res.json();
          const created = body.data || null;
          if (created) {
            onProductAdded(created);
          } else {
            throw new Error('Réponse invalide du serveur');
          }
        }
      } catch (err) {
        console.error('Erreur création/édition produit :', err);
        alert('Erreur lors de la sauvegarde du produit : ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-medium text-neutral-900">
              {editingProduct ? 'Modifier le bijou' : 'Ajouter un nouveau bijou'}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du bijou */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nom du bijou *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Collier en or rose avec perles"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Prix et Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Ex: 45.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Stock disponible
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Décrivez votre bijou (matériaux, style, etc.)"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Upload d'images */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Photos du bijou
              </label>
              
              {/* Zone de drop */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-neutral-600 mb-2">
                  Glissez vos photos ici ou 
                  <label className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer ml-1">
                    cliquez pour parcourir
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-neutral-500">PNG, JPG jusqu'à 10MB</p>
              </div>

              {/* Aperçu des images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coup de cœur */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-neutral-700">
                Mettre en avant sur la page d'accueil (coup de cœur)
              </label>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-neutral-200 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  editingProduct ? 'Modifier le bijou' : 'Ajouter le bijou'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
