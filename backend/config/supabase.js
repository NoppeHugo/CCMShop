const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation des variables d'environnement
if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL manquant dans les variables d\'environnement');
}

if (!supabaseKey) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d\'environnement');
}

// Créer le client Supabase avec la clé service (accès admin)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test de connexion
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Supabase:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};
