import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import formatPrice from '../utils/formatPrice';

const Checkout = () => {
  const { cartItems, cartTotal, cartItemsCount, confirmOrder } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Informations personnelles
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    
    // Adresse de livraison
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'Belgique',
    
    // Options
    modeCommande: 'livraison', // 'livraison' ou 'retrait'
    commentaires: '',
    
    // Validation
    accepteConditions: false,
    
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Rediriger si le panier est vide
  if (cartItems.length === 0 && !orderSubmitted) {
    navigate('/panier');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Nettoyer l'erreur si l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Champs obligatoires
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Adresse pour livraison
    if (formData.modeCommande === 'livraison') {
      if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
      if (!formData.ville.trim()) newErrors.ville = 'La ville est requise';
      if (!formData.codePostal.trim()) newErrors.codePostal = 'Le code postal est requis';
    }
    
    // Conditions
    if (!formData.accepteConditions) {
      newErrors.accepteConditions = 'Vous devez accepter les conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler l'envoi de commande
    try {
      console.log('Commande soumise:', formData);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer la commande avec les informations
      const deliveryType = formData.modeCommande === 'livraison' ? 'delivery' : 'pickup';
      // Map local form fields (FR) to backend expected shape (firstName/lastName/email/phone)
      const customerInfo = {
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        phone: formData.telephone
      };

      const orderData = confirmOrder(customerInfo, deliveryType);
      setOrderSubmitted(true);
      
      console.log('Commande créée:', orderData);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setErrors({ submit: 'Erreur lors de l\'envoi de la commande. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Page de confirmation
  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-padding">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-neutral-900 mb-4">
                Commande confirmée !
              </h1>
              
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Merci pour votre commande ! Nous vous contacterons très prochainement 
                pour confirmer les détails et organiser la livraison.
              </p>
              
              <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                <p className="text-sm text-neutral-600 mb-2">Numéro de commande</p>
                <p className="font-mono text-lg font-medium text-neutral-900">
                  CCM-{Date.now()}
                </p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/')}
                  className="btn-primary w-full"
                >
                  Retour à l'accueil
                </button>
                <button 
                  onClick={() => navigate('/boutique')}
                  className="btn-secondary w-full"
                >
                  Continuer mes achats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-neutral-900 mb-2">
              Finaliser la commande
            </h1>
            <p className="text-neutral-600">
              Remplissez vos informations pour recevoir vos bijoux
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informations personnelles */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">
                    Informations personnelles
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.prenom ? 'border-red-300' : 'border-neutral-300'
                        }`}
                      />
                      {errors.prenom && (
                        <p className="text-red-600 text-sm mt-1">{errors.prenom}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.nom ? 'border-red-300' : 'border-neutral-300'
                        }`}
                      />
                      {errors.nom && (
                        <p className="text-red-600 text-sm mt-1">{errors.nom}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.email ? 'border-red-300' : 'border-neutral-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.telephone ? 'border-red-300' : 'border-neutral-300'
                        }`}
                      />
                      {errors.telephone && (
                        <p className="text-red-600 text-sm mt-1">{errors.telephone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mode de commande */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">
                    Mode de récupération
                  </h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="modeCommande"
                        value="livraison"
                        checked={formData.modeCommande === 'livraison'}
                        onChange={handleInputChange}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-medium text-neutral-900">Livraison à domicile</span>
                        <p className="text-sm text-neutral-600">Livraison gratuite en Belgique</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="modeCommande"
                        value="retrait"
                        checked={formData.modeCommande === 'retrait'}
                        onChange={handleInputChange}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-medium text-neutral-900">Retrait à l'atelier</span>
                        <p className="text-sm text-neutral-600">Mouscron, Belgique - Sur rendez-vous</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Adresse de livraison */}
                {formData.modeCommande === 'livraison' && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-6">
                      Adresse de livraison
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          name="adresse"
                          value={formData.adresse}
                          onChange={handleInputChange}
                          placeholder="Rue et numéro"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.adresse ? 'border-red-300' : 'border-neutral-300'
                          }`}
                        />
                        {errors.adresse && (
                          <p className="text-red-600 text-sm mt-1">{errors.adresse}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Code postal *
                          </label>
                          <input
                            type="text"
                            name="codePostal"
                            value={formData.codePostal}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.codePostal ? 'border-red-300' : 'border-neutral-300'
                            }`}
                          />
                          {errors.codePostal && (
                            <p className="text-red-600 text-sm mt-1">{errors.codePostal}</p>
                          )}
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Ville *
                          </label>
                          <input
                            type="text"
                            name="ville"
                            value={formData.ville}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.ville ? 'border-red-300' : 'border-neutral-300'
                            }`}
                          />
                          {errors.ville && (
                            <p className="text-red-600 text-sm mt-1">{errors.ville}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Pays
                        </label>
                        <select
                          name="pays"
                          value={formData.pays}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="Belgique">Belgique</option>
                          <option value="France">France</option>
                          <option value="Luxembourg">Luxembourg</option>
                          <option value="Pays-Bas">Pays-Bas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Commentaires */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">
                    Commentaires (optionnel)
                  </h2>
                  
                  <textarea
                    name="commentaires"
                    value={formData.commentaires}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Demandes spéciales, préférences de livraison..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Conditions et options */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="accepteConditions"
                        checked={formData.accepteConditions}
                        onChange={handleInputChange}
                        className="mt-0.5 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm text-neutral-900">
                          J'accepte les conditions générales de vente *
                        </span>
                        {errors.accepteConditions && (
                          <p className="text-red-600 text-sm mt-1">{errors.accepteConditions}</p>
                        )}
                      </div>
                    </label>
                    
                    {/* Newsletter checkbox removed per request */}
                  </div>
                </div>

                {/* Erreur générale */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{errors.submit}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-medium text-neutral-900 mb-6">
                  Résumé de commande
                </h2>

                {/* Articles */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-champagne to-accent-rose rounded-lg overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-primary-700 text-sm opacity-60">◊</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {item.quantity} × {formatPrice(item.price)}€
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatPrice(item.price * item.quantity)}€
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="space-y-2 mb-6 pt-4 border-t border-neutral-200">
                  <div className="flex justify-between text-neutral-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(cartTotal)}€</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Livraison</span>
                    <span className="text-green-600 font-medium">Gratuite</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                    <span className="font-medium text-neutral-900">Total</span>
                    <span className="text-xl font-semibold text-neutral-900">
                      {formatPrice(cartTotal)}€
                    </span>
                  </div>
                </div>

                {/* Bouton de commande */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-neutral-400 text-neutral-700 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700 active:transform active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>

                {/* Informations */}
                <div className="mt-6 pt-4 border-t border-neutral-200 text-xs text-neutral-500 space-y-2">
                  <p>🔒 Paiement sécurisé</p>
                  <p>📦 Livraison gratuite en Belgique</p>
                  <p>💎 Satisfaction garantie</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
