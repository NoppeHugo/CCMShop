// Test rapide des variables Railway depuis server-hybrid.js
console.log('🔍 DIAGNOSTIC VARIABLES RAILWAY:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'CONFIGURÉ' : 'MANQUANT');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'CONFIGURÉ' : 'MANQUANT');

// Test Supabase
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    supabase.from('products').select('count').then(result => {
      console.log('✅ TEST SUPABASE DIRECT:', result.data ? 'CONNECTÉ' : 'ERREUR');
    }).catch(err => {
      console.log('❌ ERREUR SUPABASE:', err.message);
    });
  } catch (error) {
    console.log('❌ ERREUR MODULE SUPABASE:', error.message);
  }
} else {
  console.log('❌ Variables Supabase manquantes');
}

// Serveur simple pour test
const http = require('http');
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/') {
    res.end(JSON.stringify({
      message: 'Test Variables Railway',
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    }));
  } else {
    res.end(JSON.stringify({ error: 'Test endpoint' }));
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🧪 Serveur de test démarré sur port ${PORT}`);
});
