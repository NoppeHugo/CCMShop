# 🚀 Guide Déploiement CCM avec Supabase

## 🎯 Architecture Finale
- **Frontend**: React sur Vercel (https://ccm-shop.vercel.app)
- **Backend**: Node.js sur Railway (https://ccmshop-production.up.railway.app)
- **Database**: PostgreSQL sur Supabase

## 📋 Étape 1: Configuration Supabase

### 1.1 Créer le Projet
1. Aller sur [supabase.com](https://supabase.com)
2. Se connecter avec GitHub
3. **Créer un nouveau projet :**
   - Nom: `ccm-ecommerce`
   - Région: `West Europe (Frankfurt)`
   - Mot de passe DB: **Noter le mot de passe !**

### 1.2 Configuration de la Base de Données
1. **Dans Supabase Dashboard > SQL Editor**
2. **Nouvelle requête**
3. **Copier le contenu de `backend/sql/schema.sql`**
4. **Exécuter** ▶️

### 1.3 Récupérer les Clés
Dans **Settings > API**, noter :
```
Project URL: https://[projet-id].supabase.co
anon public: eyJ[clé-publique]...
service_role: eyJ[clé-privée]... ⚠️ CONFIDENTIELLE
```

## 🛠️ Étape 2: Configuration Railway

### 2.1 Variables d'Environnement Railway
Dans le **Dashboard Railway** de votre projet :

1. **Aller dans Variables**
2. **Ajouter les variables Supabase :**

```env
SUPABASE_URL=https://[votre-projet-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ[votre-service-role-key]
NODE_ENV=production
```

### 2.2 Déploiement du Code
```bash
# 1. Commiter les nouveaux fichiers
git add .
git commit -m "feat: Migration vers Supabase PostgreSQL"

# 2. Push vers Railway
git push origin main
```

### 2.3 Vérification Railway
- Le `railway.toml` est configuré pour utiliser `node server-supabase.js`
- Railway va automatiquement redéployer
- Tester : https://ccmshop-production.up.railway.app/api/products

## 🌐 Étape 3: Configuration Vercel (Frontend)

### 3.1 Variables d'Environnement Vercel
Le frontend utilise déjà l'API Railway, **aucune modification requise** !

### 3.2 Optionnel: Variables pour Features Avancées
Si vous voulez ajouter des fonctions côté client :

Dans **Vercel Dashboard > Settings > Environment Variables** :
```env
VITE_SUPABASE_URL=https://[projet-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[clé-publique]...
```

### 3.3 Redéploiement (si ajout variables)
```bash
# Depuis le frontend
git add .
git commit -m "feat: Ajout variables Supabase pour features avancées"
git push origin main
```

## 🔍 Étape 4: Tests de Production

### 4.1 Test API Backend
```bash
# Test de base
curl https://ccmshop-production.up.railway.app/

# Test produits
curl https://ccmshop-production.up.railway.app/api/products
```

### 4.2 Test Frontend
1. **Ouvrir** https://ccm-shop.vercel.app
2. **Vérifier** que les produits s'affichent
3. **Tester** le panier et les fonctionnalités

### 4.3 Test Interface Admin
1. **Ouvrir** https://ccm-shop.vercel.app/admin
2. **Tester** l'ajout de produits
3. **Vérifier** dans Supabase Dashboard que les produits sont sauvegardés

## 📊 Étape 5: Monitoring et Maintenance

### 5.1 Monitoring Supabase
- **Dashboard Supabase** : Monitoring DB, requêtes, performance
- **Logs** : Erreurs et activité en temps réel
- **Métriques** : Nombre de requêtes, latence

### 5.2 Monitoring Railway
- **Logs Railway** : Logs serveur Node.js
- **Métriques** : CPU, RAM, requêtes
- **Santé** : Status des déploiements

### 5.3 Monitoring Vercel
- **Analytics Vercel** : Visites, performance
- **Function Logs** : Si fonctions serverless ajoutées
- **Build Logs** : Historique des déploiements

## 🔄 Migration Progressive (Plan B)

Si problème avec Supabase, **retour rapide possible** :

### Option 1: Rollback Railway
```bash
# Revenir au serveur HTTP simple
git revert HEAD
git push origin main
```

### Option 2: Configuration Hybride
Dans Railway Variables, **supprimer** :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Le serveur détectera l'absence et utilisera les données hardcodées.

## 🎯 Résultat Final

### ✅ **Architecture Complète**
- **Frontend React** déployé sur Vercel
- **API Node.js** déployée sur Railway  
- **Database PostgreSQL** hébergée sur Supabase
- **CDN Global** pour la performance
- **Monitoring** complet sur les 3 plateformes

### ✅ **Fonctionnalités**
- **Catalogue produits** avec données persistantes
- **Interface admin** avec sauvegarde en DB
- **Commandes** stockées en base
- **Performance** optimisée
- **Évolutivité** sans limite

### ✅ **URLs Finales**
- **Site Public** : https://ccm-shop.vercel.app
- **API** : https://ccmshop-production.up.railway.app
- **Admin DB** : Dashboard Supabase
- **Monitoring** : Dashboards Railway + Vercel + Supabase

## 🚨 Points d'Attention

1. **Service Role Key** : Garder confidentielle, jamais dans le frontend
2. **CORS** : Configuré pour Vercel dans server-supabase.js
3. **Limites Supabase** : 500MB gratuit, 2GB de transfert/mois
4. **Sauvegardes** : Automatiques avec Supabase

## 🔧 Dépannage Rapide

### ❌ "Invalid API key"
- Vérifier les variables Railway
- Tester les clés dans Supabase Dashboard

### ❌ "CORS Error"
- Vérifier que l'origin Vercel est dans server-supabase.js
- Redéployer Railway si modifié

### ❌ "Database connection failed"
- Vérifier que les tables sont créées dans Supabase
- Tester la connexion avec test-supabase.js localement
