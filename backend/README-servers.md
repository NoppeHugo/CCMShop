# Scripts de Démarrage CCM Backend

## 🔄 Serveurs Disponibles

### 1. Serveur HTTP Simple (Actuel)
```bash
node server-http.js
```
- ✅ **En production sur Railway**
- ✅ Données hardcodées (4 produits)
- ✅ Fonctionne avec localStorage admin

### 2. Serveur PostgreSQL/Prisma (Nouveau)
```bash
node server-prisma.js  # starts the Prisma/Postgres backed server
```
- 🔧 **Configuration PostgreSQL requise (DATABASE_URL)**
- ✅ Base de données PostgreSQL (utilise Prisma)
- ✅ CRUD complet via Prisma

### 3. Test DB (Prisma)
```bash
node test-db.js
```
- 🔍 **Validation de la connexion PostgreSQL/Prisma**
- ✅ Test connexion et opérations

## ⚙️ Configuration Requise

### Variables d'environnement (.env)
```env
# Configuration minimale
PORT=5000

# PostgreSQL (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/jewelry_ecommerce
```

## 🚀 Étapes de Migration

### 1. Configuration PostgreSQL (Prisma)
```bash
# Suivre le guide docs/prisma-setup.md
# 1. Créer une base PostgreSQL (locale ou gérée)
# 2. Ajouter DATABASE_URL à .env
# 3. Exécuter les migrations Prisma: npx prisma migrate dev --name init
```

### 2. Test Local
```bash
cd backend
node test-db.js  # Vérifier la config (Prisma)
node server-prisma.js  # Démarrer le serveur (Prisma/Postgres)
```

### 3. Déploiement Railway
```bash
# 1. Configurer les variables sur Railway
# 2. Changer Start Command: node server-production.js
# 3. Push du code
git add .
git commit -m "feat: Migration vers PostgreSQL/Prisma"
git push
```

## 🔍 Comparaison des Serveurs

| Fonctionnalité | server-http.js | server-prisma.js (Prisma) |
|---|---|---|
| **Base de données** | Hardcodé | PostgreSQL |
| **Nombre de produits** | 4 | Illimité |
| **Persistence** | Aucune | Complète |
| **Performance** | Rapide | Rapide + Cache |
| **Évolutivité** | Limitée | Complète |
| **Administration** | localStorage | Database admin tool (pgAdmin, Supabase dashboard, etc.) |
| **Sauvegardes** | Aucune | Automatiques (selon provider) |

## 📊 URLs de Test

### Serveur HTTP (Actuel)
- Local: http://localhost:5000/api/products
- Production: https://ccmshop-production.up.railway.app/api/products

### Serveur PostgreSQL (Nouveau)
- Local: http://localhost:5000/api/products *(après config)*
- Production: https://ccmshop-production.up.railway.app/api/products *(après migration)*

## 🎯 Avantages Migration

✅ **Base de données robuste**: PostgreSQL
✅ **Contrôle total** sur les migrations via Prisma
✅ **Monitoring et observabilité** selon le provider
✅ **Sauvegardes automatiques (selon provider)**
✅ **Évolutivité** selon l'infrastructure
✅ **Gestion des utilisateurs**: implémentée via votre logique d'auth (JWT, tables users)
✅ **Stockage de fichiers**: recommander S3/Spaces ou le service fourni par le provider
