#!/bin/bash

echo "🧪 Test du déploiement Supabase en production"
echo "=============================================="

echo ""
echo "🔍 Test 1: Page d'accueil API"
curl -s https://ccmshop-production.up.railway.app/ | jq '.message, .database'

echo ""
echo "🔍 Test 2: Nombre de produits (doit être 5 avec Supabase)"
curl -s https://ccmshop-production.up.railway.app/api/products | jq '.count'

echo ""
echo "🔍 Test 3: Premier produit (doit inclure le produit test)"
curl -s https://ccmshop-production.up.railway.app/api/products | jq '.data[0].name'

echo ""
echo "✅ Si count=5 et database='Supabase' → Migration réussie !"
echo "❌ Si count=4 → Variables Railway pas encore configurées"
