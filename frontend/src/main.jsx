import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateDataSource, cleanupLocalStorage } from './utils/validateDataSource';

// Vérifier et nettoyer les données au démarrage
validateDataSource().then(result => {
  if (result.hasLocalStorage) {
    // Supprimer les données localStorage pour forcer l'utilisation de l'API
    cleanupLocalStorage();
    console.log('🔄 localStorage nettoyé, l\'application utilisera l\'API Supabase');
  }
  
  if (!result.usingSupabase) {
    console.warn('⚠️ L\'application n\'utilise pas Supabase. Vérifiez la configuration de l\'API.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
