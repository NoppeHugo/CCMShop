import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, PhotoIcon, CubeIcon } from '@heroicons/react/24/outline';
import collectionsService from '../services/collectionsService';
import CollectionProductsManager from './CollectionProductsManager';
import ImageCompressionService from '../services/imageCompressionService';

const CollectionsManagement = () => {
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showProductsManager, setShowProductsManager] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, totalProducts: 0 });

  // Formulaire
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    imageCouverture: '', // Image rectangulaire
    imageApercu: '' // Image carrée
  });

  const [imagePreviewCouverture, setImagePreviewCouverture] = useState(null);
  const [imagePreviewApercu, setImagePreviewApercu] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => { await loadCollections(); })();
  }, []);

  const loadCollections = () => {
    return (async () => {
      const collectionsData = await collectionsService.getAll();
      setCollections(collectionsData || []);
      const s = await collectionsService.getStats();
      setStats(s || { total: 0, active: 0, totalProducts: 0 });
    })();
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      imageCouverture: '',
      imageApercu: ''
    });
    setImagePreviewCouverture(null);
    setImagePreviewApercu(null);
    setErrors({});
    setEditingCollection(null);
  };

  const openModal = (collection = null) => {
    if (collection) {
      setFormData({
        nom: collection.nom,
        description: collection.description,
        imageCouverture: collection.imageCouverture || '',
        imageApercu: collection.imageApercu || ''
      });
      setImagePreviewCouverture(collection.imageCouverture);
      setImagePreviewApercu(collection.imageApercu);
      setEditingCollection(collection);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImageCouvertureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit avant compression
        setErrors({...errors, imageCouverture: 'L\'image ne doit pas dépasser 10MB'});
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({...errors, imageCouverture: 'Veuillez sélectionner un fichier image'});
        return;
      }

      try {
        const compressedImage = await ImageCompressionService.compressForCover(file);
        setFormData({...formData, imageCouverture: compressedImage});
        setImagePreviewCouverture(compressedImage);
        setErrors({...errors, imageCouverture: null});
      } catch (error) {
        console.error('Erreur lors de la compression:', error);
        setErrors({...errors, imageCouverture: 'Erreur lors du traitement de l\'image'});
      }
    }
  };

  const handleImageApercuUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit avant compression
        setErrors({...errors, imageApercu: 'L\'image ne doit pas dépasser 10MB'});
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({...errors, imageApercu: 'Veuillez sélectionner un fichier image'});
        return;
      }

      try {
        const compressedImage = await ImageCompressionService.compressForPreview(file);
        setFormData({...formData, imageApercu: compressedImage});
        setImagePreviewApercu(compressedImage);
        setErrors({...errors, imageApercu: null});
      } catch (error) {
        console.error('Erreur lors de la compression:', error);
        setErrors({...errors, imageApercu: 'Erreur lors du traitement de l\'image'});
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la collection est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      (async () => {
        if (editingCollection) {
          await collectionsService.update(editingCollection.id, formData);
        } else {
          await collectionsService.create(formData);
        }
        await loadCollections();
        closeModal();
      })();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = (collection) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la collection "${collection.nom}" ?`)) {
      try {
  (async () => { await collectionsService.delete(collection.id); await loadCollections(); })();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openProductsManager = (collection) => {
    setSelectedCollection(collection);
    setShowProductsManager(true);
  };

  const closeProductsManager = () => {
    setShowProductsManager(false);
    setSelectedCollection(null);
    loadCollections(); // Recharger pour mettre à jour les stats
  };

  const toggleActive = (collection) => {
    try {
  (async () => { await collectionsService.update(collection.id, { active: !collection.active }); await loadCollections(); })();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Collections</h2>
          <p className="text-gray-600">Organisez vos bijoux en collections thématiques</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle Collection
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <TagIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collections Actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <TagIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits Assignés</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
            <TagIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Liste des collections */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Collections ({collections.length})</h3>
        </div>

        {collections.length === 0 ? (
          <div className="p-8 text-center">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune collection</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première collection.</p>
            <button
              onClick={() => openModal()}
              className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Créer une collection
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {collections.map((collection) => (
              <div key={collection.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {collection.imageCouverture ? (
                        <img
                          src={collection.imageCouverture}
                          alt={collection.nom}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium text-gray-900">{collection.nom}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          collection.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {collection.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{collection.produits.length} produit(s)</span>
                        <span>Créée le {new Date(collection.dateCreation).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openProductsManager(collection)}
                      className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-1"
                      title="Gérer les produits"
                    >
                      <CubeIcon className="h-3 w-3" />
                      Produits
                    </button>

                    <button
                      onClick={() => toggleActive(collection)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        collection.active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {collection.active ? 'Désactiver' : 'Activer'}
                    </button>

                    <button
                      onClick={() => openModal(collection)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(collection)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingCollection ? 'Modifier la Collection' : 'Nouvelle Collection'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la collection *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Collection Vintage"
                />
                {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Décrivez l'esprit et le style de cette collection..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Images - Grid 2 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image de couverture (rectangulaire) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image de couverture (rectangulaire)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Format 16:9 recommandé pour l'affichage principal</p>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {imagePreviewCouverture ? (
                        <div className="relative">
                          <img
                            src={imagePreviewCouverture}
                            alt="Aperçu couverture"
                            className="mx-auto h-24 w-40 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreviewCouverture(null);
                              setFormData({...formData, imageCouverture: ''});
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                              <span>Choisir</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageCouvertureUpload}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.imageCouverture && <p className="text-red-500 text-sm mt-1">{errors.imageCouverture}</p>}
                </div>

                {/* Image d'aperçu (carrée) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image d'aperçu (carrée)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Format carré 1:1 pour les vignettes</p>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {imagePreviewApercu ? (
                        <div className="relative">
                          <img
                            src={imagePreviewApercu}
                            alt="Aperçu carré"
                            className="mx-auto h-24 w-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreviewApercu(null);
                              setFormData({...formData, imageApercu: ''});
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                              <span>Choisir</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageApercuUpload}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.imageApercu && <p className="text-red-500 text-sm mt-1">{errors.imageApercu}</p>}
                </div>
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm">{errors.submit}</p>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                >
                  {editingCollection ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gestionnaire de produits */}
      {showProductsManager && selectedCollection && (
        <CollectionProductsManager
          collection={selectedCollection}
          onClose={closeProductsManager}
          onUpdate={loadCollections}
        />
      )}
    </div>
  );
};

export default CollectionsManagement;
