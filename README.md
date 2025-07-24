# 💎 Bijoux Mouscron - Site E-commerce

> Site e-commerce pour une créatrice de bijoux artisanaux basée à Mouscron, Belgique

## 🎯 Description

Ce projet est un site web complet permettant à une créatrice de bijoux de :
- Présenter ses créations artisanales
- Gérer un catalogue de produits en ligne
- Recevoir des commandes de clients
- Administrer les ventes et commandes

## 🏗️ Architecture

```
CCM/
├── frontend/          # Application React (Vite + Tailwind)
├── backend/           # API Node.js/Express + Prisma
├── docs/             # Documentation
└── deployment/       # Scripts de déploiement
```

### Stack Technologique

**Frontend:**
- ⚛️ React 19 + Vite
- 🎨 Tailwind CSS
- 🛣️ React Router
- 📡 Axios
- 🛒 Context API (panier)

**Backend:**
- 🟢 Node.js + Express
- 🗄️ PostgreSQL + Prisma ORM
- 🔐 JWT (authentification admin)
- 📝 API RESTful

**Déploiement:**
- 🚀 Frontend: Vercel
- ⚡ Backend: Railway
- 🗄️ Database: Supabase

## 🚀 Installation et Développement

### Prérequis
- Node.js 18+
- npm ou yarn
- PostgreSQL (ou compte Supabase)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd CCM
```

2. **Installer les dépendances**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Configuration des variables d'environnement**
```bash
# Backend
cp .env.example .env
# Modifier DATABASE_URL et autres variables

# Frontend
cp .env.example .env
# Modifier VITE_API_URL si nécessaire
```

4. **Base de données**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Lancement en développement

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Le site sera accessible sur `http://localhost:5173` et l'API sur `http://localhost:5000`.

## 📋 Fonctionnalités

### ✅ Développées
- [x] Structure de base frontend/backend
- [x] Affichage des produits mis en avant
- [x] Système de panier (localStorage)
- [x] API produits et commandes
- [x] Design responsive avec Tailwind

### 🚧 En cours
- [ ] Page catalogue complète
- [ ] Processus de commande
- [ ] Interface d'administration
- [ ] Authentification admin

### 🔮 Prévues
- [ ] Paiement en ligne (Stripe)
- [ ] Upload d'images (Cloudinary)
- [ ] Notifications email
- [ ] Gestion des stocks
- [ ] Analytics et statistiques

## 🗄️ Modèle de Données

### Products (Bijoux)
- `id, name, description, price`
- `category, images[], stock, featured`
- `createdAt, updatedAt`

### Orders (Commandes)
- `id, customerInfo, shippingAddress`
- `total, status, notes`
- `items[] (relation OrderItem)`
- `createdAt, updatedAt`

### OrderItems (Articles de commande)
- `productId, quantity, price`
- Relations: `Order`, `Product`

## 🚀 Déploiement

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Connecter le repo à Vercel
```

### Backend (Railway)
```bash
cd backend
# Créer un projet Railway
# Configurer les variables d'environnement
# Déployer via Git ou CLI Railway
```

### Base de données (Supabase)
1. Créer un projet Supabase
2. Copier l'URL de connexion PostgreSQL
3. Configurer `DATABASE_URL` dans les variables d'environnement
4. Exécuter les migrations Prisma

## 📁 Structure des Fichiers

```
frontend/src/
├── components/        # Composants réutilisables
├── pages/            # Pages de l'application
├── context/          # Contextes React (panier, etc.)
├── services/         # Appels API
└── assets/           # Images, fonts, etc.

backend/
├── routes/           # Routes API
├── prisma/           # Schéma et migrations DB
├── middleware/       # Middleware Express
└── utils/            # Utilitaires
```

## 🎨 Design System

### Couleurs
- `jewelry-gold`: #D4AF37 (or)
- `jewelry-rose`: #F7E7CE (rose poudré)
- `jewelry-silver`: #C0C0C0 (argent)
- `jewelry-bronze`: #CD7F32 (bronze)

### Typographie
- **Headers**: Playfair Display (élégant)
- **Body**: Inter (moderne, lisible)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Contact

**Créatrice:** Bijoux Mouscron  
**Email:** contact@bijouxmouscron.be  
**Localisation:** Mouscron, Belgique

---

*Créé avec ❤️ pour promouvoir l'artisanat local belge*
