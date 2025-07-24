# Instructions Copilot pour le Site E-commerce de Bijoux

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexte du Projet
Ce projet est un site e-commerce pour une créatrice de bijoux de Mouscron, Belgique. L'objectif est de créer une solution complète et réutilisable pour d'autres artisans locaux.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + React Router + Axios
- **Backend**: Node.js + Express + Prisma ORM
- **Base de données**: PostgreSQL
- **Déploiement**: Frontend sur Vercel, Backend sur Railway, DB sur Supabase

## Structure du Projet
```
CCM/
├── frontend/          # Application React
├── backend/           # API Node.js/Express
├── docs/             # Documentation
└── deployment/       # Scripts de déploiement
```

## Fonctionnalités Principales
1. **Catalogue de bijoux** (filtrage par catégorie/prix)
2. **Panier et commandes** avec formulaire client
3. **Interface d'administration** pour gérer les commandes
4. **Paiement en ligne** (Stripe - optionnel)
5. **Upload d'images** (Cloudinary - optionnel)

## Conventions de Code
- Utiliser ES6+ et syntaxe moderne
- Noms de variables en français pour l'interface utilisateur
- Commentaires en français
- API endpoints en anglais
- Utiliser Tailwind pour tous les styles
- Composants React fonctionnels avec hooks

## Priorités de Développement
1. Structure de base et navigation
2. Affichage des produits
3. Panier et processus de commande
4. Interface d'administration
5. Intégrations avancées (paiement, images)

## Modèle de Données
- **Products**: id, name, description, price, category, images, stock
- **Orders**: id, customerInfo, items, total, status, createdAt
- **Users**: id, email, role (admin uniquement)
