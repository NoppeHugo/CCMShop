// Serveur minimal pour diagnostic Railway - Version 3.0.0
const http = require('http');

console.log('🚀 DÉMARRAGE SERVEUR DIAGNOSTIC v3.0.0');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'CONFIGURÉ ✅' : 'MANQUANT ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'CONFIGURÉ ✅' : 'MANQUANT ❌');
console.log('PORT:', process.env.PORT || 5000);

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const diagnostic = {
    message: '🧪 DIAGNOSTIC RAILWAY - Serveur Test v3.0.0',
    timestamp: new Date().toISOString(),
    variables: {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅ CONFIGURÉ' : '❌ MANQUANT',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ CONFIGURÉ' : '❌ MANQUANT'
    },
    railway_status: 'Variables configurées correctement ?',
    next_step: process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 
      'Revenir au serveur-hybrid.js' : 
      'Configurer les variables Supabase sur Railway'
  };
  
  console.log('GET /', diagnostic.variables);
  
  res.writeHead(200);
  res.end(JSON.stringify(diagnostic, null, 2));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🧪 Serveur diagnostic v3.0.0 sur port ${PORT}`);
  console.log('Si vous voyez ce message sur Railway, les variables sont:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MISSING');
  console.log('SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');
});
