# 🚀 Guide de Développement Rapide

## ⚡ Démarrage Rapide

### 1. Installation
```bash
# Cloner et installer
git clone <repo>
cd CCM

# Backend
cd backend
npm install
cp .env.example .env

# Frontend  
cd ../frontend
npm install
```

### 2. Lancement
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### 3. URLs
- 🌐 Frontend: http://localhost:5173
- 🔌 API: http://localhost:5000
- 📊 Prisma Studio: http://localhost:5555 (npm run db:studio)

## 📋 Checklist de Développement

### ✅ Fait
- [x] Structure projet frontend/backend
- [x] Configuration Tailwind CSS
- [x] Système de panier (Context)
- [x] API de base (produits/commandes)
- [x] Page d'accueil avec produits
- [x] Composants Header/Footer
- [x] Schéma base de données Prisma

### 🚧 À Faire Ensuite
- [ ] Page catalogue complet avec filtres
- [ ] Processus de commande complet
- [ ] Interface d'administration
- [ ] Authentification admin
- [ ] Intégration base de données réelle
- [ ] Tests et déploiement

## 🎯 Prochaines Étapes de Développement

### 1. Page Catalogue (/produits)
- Affichage de tous les produits
- Filtres par catégorie et prix
- Recherche textuelle
- Pagination

### 2. Processus de Commande
- Page panier détaillée
- Formulaire de commande
- Confirmation et récapitulatif

### 3. Administration
- Dashboard avec statistiques
- Gestion des commandes
- Interface CRUD produits

## 🛠️ Commandes Utiles

```bash
# Backend
npm run dev          # Serveur développement
npm run db:generate  # Générer client Prisma
npm run db:migrate   # Appliquer migrations
npm run db:studio    # Interface Prisma

# Frontend
npm run dev          # Serveur développement
npm run build        # Build production
npm run preview      # Préview build

# Utilitaires
npm run lint         # Vérifier le code
npm test             # Lancer les tests (à implémenter)
```

## 📁 Structure Importante

```
src/
├── components/      # Composants réutilisables
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── ProductCard.jsx
├── pages/           # Pages principales
│   └── Home.jsx
├── context/         # State management
│   └── CartContext.jsx
└── services/        # API calls
    └── api.js
```

## 🎨 Conventions CSS (Tailwind)

### Couleurs du thème
- `jewelry-gold` : #D4AF37
- `jewelry-rose` : #F7E7CE
- `jewelry-silver` : #C0C0C0

### Polices
- `font-elegant` : Playfair Display (titres)
- `font-modern` : Inter (texte)

### Espacement
- Container : `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Sections : `py-16` ou `py-20`

## 🔧 Variables d'Environnement

### Backend (.env)
```
PORT=5000
DATABASE_URL="postgresql://..."
JWT_SECRET="secret"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:5000"
VITE_APP_NAME="Bijoux Mouscron"
```

## 🆘 Dépannage

### Erreurs courantes
1. **Module not found**: Vérifier les chemins et npm install
2. **CORS errors**: Vérifier FRONTEND_URL dans backend/.env
3. **Prisma errors**: Lancer `npm run db:generate`

### Redémarrage propre
```bash
# Arrêter tous les serveurs (Ctrl+C)
# Nettoyer les caches
rm -rf node_modules package-lock.json
npm install
```

---
*Happy coding! 💎✨*
