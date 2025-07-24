// Script pour migrer les données localStorage entre ports
// À exécuter dans la console du navigateur

function migrateLocalStorageData() {
  console.log('🔄 Migration des données localStorage...');
  
  // Données à migrer
  const keysToMigrate = [
    'jewelry_products',
    'jewelry_stock',
    'jewelry_sales',
    'jewelry_collections',
    'jewelry_cart',
    'admin_token'
  ];
  
  // Afficher les données actuelles
  console.log('📦 Données actuelles:');
  keysToMigrate.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`${key}:`, JSON.parse(data));
    } else {
      console.log(`${key}: (vide)`);
    }
  });
  
  // Créer un export
  const exportData = {};
  keysToMigrate.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      exportData[key] = JSON.parse(data);
    }
  });
  
  console.log('💾 Données exportées:', exportData);
  
  // Copier dans le presse-papiers
  navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
    console.log('✅ Données copiées dans le presse-papiers !');
    console.log('📋 Pour importer: exécutez importLocalStorageData() sur le nouveau port');
  });
  
  return exportData;
}

function importLocalStorageData(data) {
  console.log('📥 Import des données...');
  
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  
  Object.keys(data).forEach(key => {
    localStorage.setItem(key, JSON.stringify(data[key]));
    console.log(`✅ ${key} importé`);
  });
  
  console.log('🎉 Import terminé ! Rechargez la page.');
  
  // Recharger automatiquement
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Rendre les fonctions disponibles globalement
window.migrateLocalStorageData = migrateLocalStorageData;
window.importLocalStorageData = importLocalStorageData;

console.log('🛠️ Outils de migration disponibles:');
console.log('- migrateLocalStorageData() : Exporter les données');
console.log('- importLocalStorageData(data) : Importer les données');

export { migrateLocalStorageData, importLocalStorageData };
