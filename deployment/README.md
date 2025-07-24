# 🚀 Guide de Déploiement - Bijoux Mouscron

Ce guide détaille le processus de déploiement du site e-commerce sur les plateformes de production.

## 📋 Vue d'ensemble

- **Frontend**: Vercel (gratuit)
- **Backend**: Railway (plan gratuit disponible)
- **Base de données**: Supabase (plan gratuit)
- **Images**: Cloudinary (optionnel)

## 🗄️ 1. Configuration de la Base de Données (Supabase)

### Création du projet
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Choisir la région (Europe West pour proximité)
4. Noter l'URL de connexion PostgreSQL

### Configuration
```bash
# Dans le backend
cp .env.example .env
```

Modifier `.env` avec les vraies valeurs :
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/[database]?pgbouncer=true"
JWT_SECRET="votre_secret_jwt_securise"
```

### Migration de la base
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## ⚡ 2. Déploiement Backend (Railway)

### Préparation
1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. Créer un nouveau projet

### Déploiement
```bash
# Installer Railway CLI (optionnel)
npm install -g @railway/cli

# Connecter le projet
railway login
railway link [project-id]

# Déployer
git push # Auto-deploy si connecté via GitHub
```

### Variables d'environnement Railway
Dans le dashboard Railway, ajouter :
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://votre-site.vercel.app
```

## 🌐 3. Déploiement Frontend (Vercel)

### Méthode GitHub (recommandée)
1. Push le code sur GitHub
2. Aller sur [vercel.com](https://vercel.com)
3. Importer le projet GitHub
4. Configurer le répertoire racine : `frontend`
5. Déployer

### Variables d'environnement Vercel
```
VITE_API_URL=https://votre-backend.railway.app
VITE_APP_NAME=Bijoux Mouscron
```

### Configuration vercel.json (frontend/)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

## 🔧 4. Configuration des Domaines

### Domaine personnalisé (optionnel)
1. **Vercel**: Ajouter domaine dans les paramètres
2. **Railway**: Configurer le domaine personnalisé
3. Mettre à jour les variables CORS

## 📦 5. Scripts de Déploiement

### `deploy-frontend.sh`
```bash
#!/bin/bash
echo "🚀 Déploiement Frontend..."
cd frontend
npm install
npm run build
echo "✅ Build terminé - Vercel se chargera du déploiement automatique"
```

### `deploy-backend.sh`
```bash
#!/bin/bash
echo "🚀 Déploiement Backend..."
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
echo "✅ Prêt pour Railway"
```

## 🔍 6. Vérifications Post-Déploiement

### Tests API
```bash
# Tester l'API de production
curl https://votre-backend.railway.app/api/products
```

### Tests Frontend
- Navigation sur le site
- Chargement des produits
- Fonctionnalité du panier
- Responsive design

## 🔐 7. Sécurité

### Variables sensibles
- ✅ JWT_SECRET aléatoire et sécurisé
- ✅ DATABASE_URL sécurisée
- ✅ CORS configuré correctement
- ✅ Variables d'env en mode production

### HTTPS
- Vercel et Railway fournissent HTTPS automatiquement
- Vérifier que toutes les requêtes utilisent HTTPS

## 📊 8. Monitoring

### Logs
- **Railway**: Dashboard > Logs
- **Vercel**: Dashboard > Functions > Logs
- **Supabase**: Dashboard > Logs

### Métriques
- Temps de réponse API
- Erreurs 5xx
- Utilisation de la base de données

## 🆘 9. Dépannage

### Problèmes courants

**Error: Cannot find module 'prisma'**
```bash
npx prisma generate
```

**CORS errors**
```javascript
// Dans server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Build failed on Vercel**
- Vérifier les dépendances dans package.json
- Vérifier les variables d'environnement

### Support
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

## 💡 10. Optimisations

### Performance
- **Frontend**: Lazy loading, optimisation images
- **Backend**: Cache Redis (Railway addon)
- **Database**: Index sur les requêtes fréquentes

### Coûts
- Surveiller l'usage Railway (limites gratuites)
- Optimiser les requêtes DB pour réduire la charge
- CDN pour les images statiques

---

*Dernière mise à jour : {{ date }}*
