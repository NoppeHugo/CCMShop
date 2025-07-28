# Scripts de Démarrage CCM Backend

## 🔄 Serveurs Disponibles

### 1. Serveur HTTP Simple (Actuel)
```bash
node server-http.js
```
- ✅ **En production sur Railway**
- ✅ Données hardcodées (4 produits)
- ✅ Fonctionne avec localStorage admin

### 2. Serveur Supabase (Nouveau)
```bash
node server-supabase.js
```
- 🔧 **Configuration Supabase requise**
- ✅ Base de données PostgreSQL
- ✅ CRUD complet

### 3. Test Supabase
```bash
node test-supabase.js
```
- 🔍 **Validation de l'intégration**
- ✅ Test connexion et opérations

## ⚙️ Configuration Requise

### Variables d'environnement (.env)
```env
# Configuration actuelle
PORT=5000

# Nouvelle configuration Supabase
SUPABASE_URL=https://[projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ[service-role-key]
```

## 🚀 Étapes de Migration

### 1. Configuration Supabase
```bash
# Suivre le guide docs/supabase-setup.md
# 1. Créer projet Supabase
# 2. Exécuter backend/sql/schema.sql
# 3. Configurer les variables d'environnement
```

### 2. Test Local
```bash
cd backend
node test-supabase.js  # Vérifier la config
node server-supabase.js  # Démarrer le nouveau serveur
```

### 3. Déploiement Railway
```bash
# 1. Configurer les variables sur Railway
# 2. Changer Start Command: node server-supabase.js
# 3. Push du code
git add .
git commit -m "feat: Migration vers Supabase"
git push
```

## 🔍 Comparaison des Serveurs

| Fonctionnalité | server-http.js | server-supabase.js |
|---|---|---|
| **Base de données** | Hardcodé | PostgreSQL |
| **Nombre de produits** | 4 | Illimité |
| **Persistence** | Aucune | Complète |
| **Performance** | Rapide | Rapide + Cache |
| **Évolutivité** | Limitée | Complète |
| **Administration** | localStorage | Interface Supabase |
| **Sauvegardes** | Aucune | Automatiques |

## 📊 URLs de Test

### Serveur HTTP (Actuel)
- Local: http://localhost:5000/api/products
- Production: https://ccmshop-production.up.railway.app/api/products

### Serveur Supabase (Nouveau)
- Local: http://localhost:5000/api/products *(après config)*
- Production: https://ccmshop-production.up.railway.app/api/products *(après migration)*

## 🎯 Avantages Migration

✅ **Base de données robuste** PostgreSQL
✅ **Interface d'administration** Supabase Dashboard
✅ **API REST automatique** pour toutes les tables
✅ **Monitoring et analytics** intégrés
✅ **Sauvegardes automatiques**
✅ **Évolutivité** sans limite
✅ **Gestion des utilisateurs** avec Supabase Auth
✅ **Stockage de fichiers** avec Supabase Storage
