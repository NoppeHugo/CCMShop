# Guide Configuration Supabase pour CCM E-commerce

## 🎯 Objectif
Intégrer Supabase PostgreSQL pour remplacer le système temporaire localStorage/hardcoded.

## 📋 Étape 1: Création du Projet Supabase

1. **Aller sur [Supabase.com](https://supabase.com)**
2. **Se connecter avec GitHub**
3. **Créer un nouveau projet :**
   - Nom: `ccm-ecommerce` ou `bijoux-mouscron`
   - Organisation: Personal (ou votre organisation)
   - Database Password: **Noter le mot de passe !**
   - Région: `West Europe (Frankfurt)` (plus proche de la Belgique)

## 🔑 Étape 2: Récupération des Clés

### Dans le tableau de bord Supabase :
1. **Aller dans Settings > API**
2. **Copier les informations suivantes :**

```
URL: https://[votre-ref-projet].supabase.co
anon key: eyJ... (clé publique)
service_role key: eyJ... (clé privée) ⚠️ CONFIDENTIELLE
```

## 🗄️ Étape 3: Création des Tables

### 3.1 Dans Supabase Dashboard
1. **Aller dans l'onglet "SQL Editor"**
2. **Créer une nouvelle requête**
3. **Copier le contenu de `backend/sql/schema.sql`**
4. **Exécuter la requête**

### 3.2 Vérification
- Aller dans "Table Editor"
- Vérifier que les tables `products`, `orders`, `collections` existent
- Vérifier que des produits d'exemple sont présents

## ⚙️ Étape 4: Configuration Backend

### 4.1 Variables d'environnement
Créer le fichier `backend/.env` :

```env
# Variables existantes
PORT=5000

# Nouvelles variables Supabase
SUPABASE_URL=https://[votre-ref-projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ[votre-service-role-key]
```

### 4.2 Installation dépendances
```bash
cd backend
npm install @supabase/supabase-js
```

### 4.3 Test de l'intégration
```bash
cd backend
node test-supabase.js
```

**Résultat attendu :**
```
✅ Connexion Supabase réussie
✅ X produits récupérés
✅ Produit créé avec l'ID: Y
✅ Produit récupéré: Collier Test...
```

## 🚀 Étape 5: Déploiement

### 5.1 Nouveau serveur Supabase
```bash
cd backend
node server-supabase.js
```

### 5.2 Test local
- Ouvrir http://localhost:5000
- Tester http://localhost:5000/api/products

### 5.3 Déploiement Railway
1. **Variables d'environnement sur Railway :**
   ```
   SUPABASE_URL=https://[votre-ref-projet].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ[votre-service-role-key]
   ```

2. **Commiter les nouveaux fichiers :**
   ```bash
   git add .
   git commit -m "feat: Intégration Supabase database"
   git push
   ```

3. **Sur Railway, changer le Start Command :**
   ```
   node server-supabase.js
   ```

## 🔍 Étape 6: Tests de Production

### 6.1 API en production
Tester : `https://ccmshop-production.up.railway.app/api/products`

### 6.2 Frontend
- Le frontend utilise déjà l'API
- Aucune modification nécessaire côté React

## 🐛 Dépannage

### ❌ "Invalid API key"
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correct
- Vérifier que l'URL Supabase est correcte

### ❌ "relation does not exist"
- Les tables n'ont pas été créées
- Relancer le script SQL dans Supabase

### ❌ Pas de données
- Vérifier que le script SQL a inséré les données d'exemple
- Utiliser l'interface Supabase pour ajouter des produits manuellement

## 📊 Avantages Supabase

✅ **Base de données PostgreSQL robuste**
✅ **API REST automatique**
✅ **Interface d'administration intégrée**
✅ **Sauvegardes automatiques**
✅ **Évolutivité automatique**
✅ **Monitoring intégré**

## 🔄 Migration Données Admin

Une fois Supabase configuré, l'interface admin pourra :
- Créer des produits directement en base
- Gérer le stock en temps réel
- Éviter les conflits localStorage vs API

## 📈 Prochaines Étapes

1. **Gestion des commandes** avec Supabase
2. **Authentification admin** avec Supabase Auth
3. **Upload d'images** avec Supabase Storage
4. **Analytics** avec les logs Supabase
