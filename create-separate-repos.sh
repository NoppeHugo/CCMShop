# Script pour créer des repositories séparés
# À exécuter depuis le dossier CCM

# 1. Créer le repository backend
echo "Création du repository backend..."
mkdir ccm-backend-deploy
cd ccm-backend-deploy
git init
cp -r ../backend/* .
cp ../backend/.* . 2>/dev/null || true
git add .
git commit -m "Initial backend for deployment"

# 2. Créer le repository frontend  
cd ..
mkdir ccm-frontend-deploy
cd ccm-frontend-deploy
git init
cp -r ../frontend/* .
cp ../frontend/.* . 2>/dev/null || true
git add .
git commit -m "Initial frontend for deployment"

echo "Repositories séparés créés !"
echo "Maintenant, créez les repositories sur GitHub :"
echo "- CCMShop-Backend"
echo "- CCMShop-Frontend"
