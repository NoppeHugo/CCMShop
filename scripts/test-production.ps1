# Test du déploiement Supabase en production
Write-Host "🧪 Test du déploiement Supabase en production" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Test 1: Page d'accueil API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://ccmshop-production.up.railway.app/" -Method GET
    Write-Host "Message: $($response.message)" -ForegroundColor Cyan
    Write-Host "Database: $($response.database)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test 2: Nombre de produits (doit être 5 avec Supabase)" -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "https://ccmshop-production.up.railway.app/api/products" -Method GET
    Write-Host "Nombre de produits: $($products.count)" -ForegroundColor Cyan
    
    if ($products.count -eq 5) {
        Write-Host "✅ Supabase fonctionne ! (5 produits)" -ForegroundColor Green
    } elseif ($products.count -eq 4) {
        Write-Host "❌ Encore les données hardcodées (4 produits)" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Nombre inattendu: $($products.count)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur produits: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test 3: Premier produit" -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "https://ccmshop-production.up.railway.app/api/products" -Method GET
    if ($products.data -and $products.data.Count -gt 0) {
        Write-Host "Premier produit: $($products.data[0].name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération du premier produit" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Magenta
Write-Host "✅ Si database='Supabase' et count=5 → Migration réussie !" -ForegroundColor Green
Write-Host "❌ Si count=4 → Variables Railway pas encore configurées" -ForegroundColor Red
