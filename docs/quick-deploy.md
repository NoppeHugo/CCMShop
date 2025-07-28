# 🚀 Connexion Railway + Vercel + Supabase (Guide Rapide)

## ⚡ TL;DR - Déploiement Express

```bash
# 1. Configuration Supabase (une fois)
# Créer projet sur supabase.com → Exécuter sql/schema.sql

# 2. Déploiement automatique
cd backend
npm run check:deployment  # Vérification
npm run deploy           # Déploiement complet
```

## 🔧 Configuration Railway (5 minutes)

### Variables à ajouter dans Railway Dashboard :
```env
SUPABASE_URL=https://[votre-projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ[votre-service-role-key]
NODE_ENV=production
```

### Le fichier `railway.toml` est déjà configuré :
```toml
deploy:
  startCommand: node server-supabase.js  # ✅ Supabase activé
  healthcheckPath: /                     # ✅ Health check
```

## 🌐 Configuration Vercel (0 minutes)

**Aucune modification requise !** 
- Vercel utilise déjà l'API Railway
- Les URLs sont configurées dans `frontend/src/services/api.js`

## 📊 Test de la Connexion

### 1. Test Local
```bash
cd backend
npm run test:supabase    # Test Supabase
npm run start:supabase   # Serveur local
```

### 2. Test Production
```bash
# API Railway
curl https://ccmshop-production.up.railway.app/api/products

# Frontend Vercel
# Ouvrir https://ccm-shop.vercel.app
```

## 🔄 Flux de Données

```
┌─────────────┐    HTTPS     ┌─────────────┐    PostgreSQL    ┌─────────────┐
│   Vercel    │ ──────────► │   Railway   │ ───────────────► │  Supabase   │
│  (Frontend) │             │  (Backend)  │                   │ (Database)  │
│             │             │             │                   │             │
│ React App   │             │ Node.js API │                   │ PostgreSQL  │
│ ccm-shop    │             │ ccmshop-    │                   │ Tables:     │
│ .vercel.app │             │ production  │                   │ - products  │
│             │             │ .railway    │                   │ - orders    │
│             │             │ .app        │                   │ - users     │
└─────────────┘             └─────────────┘                   └─────────────┘
```

## 🎯 Points Clés

### ✅ Ce qui fonctionne automatiquement :
- **CORS** configuré pour Vercel
- **Routing** API déjà en place
- **Error handling** robuste
- **Health checks** pour Railway

### ⚙️ Ce qui nécessite une configuration :
- **Variables Supabase** dans Railway
- **Tables SQL** dans Supabase (une fois)

### 🔒 Sécurité :
- **Service Role Key** : Jamais exposée côté client
- **HTTPS** : Obligatoire en production
- **CORS** : Limité aux domaines autorisés

## 🚨 Troubleshooting Express

### ❌ "Cannot connect to Supabase"
```bash
# Vérifier les variables Railway
railway variables

# Tester en local
npm run test:supabase
```

### ❌ "CORS Error sur Vercel"
Le domaine Vercel est déjà configuré dans `server-supabase.js` :
```javascript
const allowedOrigins = [
  'https://ccm-shop.vercel.app'  // ✅ Déjà présent
];
```

### ❌ "Railway deployment failed"
```bash
# Vérifier railway.toml
cat railway.toml

# Forcer redéploiement
git commit --allow-empty -m "redeploy"
git push origin main
```

## 🎉 Résultat Final

Une fois configuré, vous aurez :
- **Site web** : https://ccm-shop.vercel.app ✅
- **API** : https://ccmshop-production.up.railway.app ✅  
- **Admin DB** : Dashboard Supabase ✅
- **Monitoring** : Railway + Vercel + Supabase ✅

**Évolutivité illimitée** avec base de données PostgreSQL robuste ! 🚀
