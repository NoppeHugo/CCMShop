const http = require('http');
const url = require('url');
const { createClient } = require('@supabase/supabase-js');

// Données de secours (fallback)
const fallbackProducts = [
  {
    id: 1,
    name: "Collier Élégance Dorée",
    description: "Magnifique collier en plaqué or avec pendentif en forme de coeur",
    price: 89.99,
    category: "colliers",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Collier+Doré"],
    stock: 15,
    featured: true
  },
  {
    id: 2,
    name: "Boucles d'Oreilles Perles Nacrées",
    description: "Boucles d'oreilles délicates avec perles nacrées authentiques",
    price: 45.50,
    category: "boucles-oreilles",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Boucles+Perles"],
    stock: 8,
    featured: false
  },
  {
    id: 3,
    name: "Bracelet Argent Infinity",
    description: "Bracelet en argent sterling avec charm infini, symbole d'amour éternel",
    price: 65.00,
    category: "bracelets",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Bracelet+Infinity"],
    stock: 12,
    featured: true
  },
  {
    id: 4,
    name: "Bague Solitaire Rose",
    description: "Bague délicate en or rose avec cristal étincelant",
    price: 120.00,
    category: "bagues",
    images: ["https://via.placeholder.com/400x400/F7E7CE/D4AF37?text=Bague+Rose"],
    stock: 5,
    featured: true
  }
];

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
let useSupabase = false;

// Essayer d'initialiser Supabase si les variables d'environnement existent
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    useSupabase = true;
    console.log('🔌 Supabase connecté avec succès');
    console.log(`🔗 URL: ${supabaseUrl.substring(0, 20)}...`);
  } catch (error) {
    console.error('❌ Erreur connexion Supabase:', error.message);
    useSupabase = false;
  }
} else {
  console.log('⚠️ Variables Supabase non configurées. Utilisation du mode fallback.');
}

// Headers CORS pour les requêtes
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Création du serveur HTTP
const server = http.createServer(async (req, res) => {
  // Gérer les requêtes OPTIONS (CORS pre-flight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  // Parser l'URL pour obtenir le chemin
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Page d'accueil / diagnostic API
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.end(JSON.stringify({
      message: "API E-commerce Bijoux v2.0.0",
      status: "OK",
      database: useSupabase ? "Supabase PostgreSQL" : "Mémoire (fallback)",
      supabaseStatus: useSupabase ? "Connecté" : "Non configuré",
      variables: {
        SUPABASE_URL: supabaseUrl ? "Configurée" : "Non configurée",
        SUPABASE_KEY: supabaseKey ? "Configurée" : "Non configurée"
      }
    }));
    return;
  }

  // Route produits
  if (path === '/api/products' && req.method === 'GET') {
    try {
      if (useSupabase && supabase) {
        // Utiliser Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        
        res.writeHead(200, headers);
        res.end(JSON.stringify({
          success: true,
          count: data.length,
          source: 'supabase',
          database: 'Supabase PostgreSQL',
          data: data
        }));
      } else {
        // Fallback sur les données hardcodées
        res.writeHead(200, headers);
        res.end(JSON.stringify({
          success: true,
          count: fallbackProducts.length,
          source: 'fallback',
          database: 'Mémoire (fallback)',
          data: fallbackProducts
        }));
      }
    } catch (error) {
      console.error('Erreur:', error);
      res.writeHead(200, headers);
      res.end(JSON.stringify({
        success: true,
        count: fallbackProducts.length,
        source: 'fallback-error',
        error: error.message,
        database: 'Mémoire (fallback après erreur)',
        data: fallbackProducts
      }));
    }
    return;
  }

  // Route POST pour ajouter un produit
  if (path === '/api/products' && req.method === 'POST') {
    try {
      // Récupérer les données du body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const productData = JSON.parse(body);
          
          if (useSupabase && supabase) {
            // Ajouter le produit à Supabase
            console.log('📝 Ajout d\'un nouveau produit dans Supabase:', productData.name);
            const { data, error } = await supabase
              .from('products')
              .insert([productData])
              .select();
            
            if (error) throw error;
            
            res.writeHead(201, headers);
            res.end(JSON.stringify({
              success: true,
              message: 'Produit ajouté avec succès',
              data: data[0]
            }));
          } else {
            // Répondre en mode fallback (sans DB)
            res.writeHead(201, headers);
            res.end(JSON.stringify({
              success: false,
              message: 'Produit non ajouté - Base de données non disponible',
              error: 'Supabase non configuré'
            }));
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'ajout du produit:', error);
          res.writeHead(500, headers);
          res.end(JSON.stringify({
            success: false,
            message: 'Erreur lors de l\'ajout du produit',
            error: error.message
          }));
        }
      });
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      res.writeHead(500, headers);
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
    return;
  }

  // Route PUT pour modifier un produit
  if (path.match(/^\/api\/products\/(\d+)$/) && req.method === 'PUT') {
    try {
      const productId = path.split('/').pop();
      
      // Récupérer les données du body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const productData = JSON.parse(body);
          
          if (useSupabase && supabase) {
            // Mettre à jour le produit dans Supabase
            console.log(`📝 Mise à jour du produit ${productId}:`, productData.name);
            const { data, error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', productId)
              .select();
            
            if (error) throw error;
            
            res.writeHead(200, headers);
            res.end(JSON.stringify({
              success: true,
              message: 'Produit mis à jour avec succès',
              data: data[0]
            }));
          } else {
            // Répondre en mode fallback (sans DB)
            res.writeHead(200, headers);
            res.end(JSON.stringify({
              success: false,
              message: 'Produit non mis à jour - Base de données non disponible',
              error: 'Supabase non configuré'
            }));
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la mise à jour du produit ${productId}:`, error);
          res.writeHead(500, headers);
          res.end(JSON.stringify({
            success: false,
            message: 'Erreur lors de la mise à jour du produit',
            error: error.message
          }));
        }
      });
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      res.writeHead(500, headers);
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
    return;
  }

  // Route DELETE pour supprimer un produit
  if (path.match(/^\/api\/products\/(\d+)$/) && req.method === 'DELETE') {
    try {
      const productId = path.split('/').pop();
      
      if (useSupabase && supabase) {
        // Supprimer le produit de Supabase
        console.log(`🗑️ Suppression du produit ${productId}`);
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        
        res.writeHead(200, headers);
        res.end(JSON.stringify({
          success: true,
          message: 'Produit supprimé avec succès'
        }));
      } else {
        // Répondre en mode fallback (sans DB)
        res.writeHead(200, headers);
        res.end(JSON.stringify({
          success: false,
          message: 'Produit non supprimé - Base de données non disponible',
          error: 'Supabase non configuré'
        }));
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du produit:`, error);
      res.writeHead(500, headers);
      res.end(JSON.stringify({
        success: false,
        message: 'Erreur lors de la suppression du produit',
        error: error.message
      }));
    }
    return;
  }

  // Route 404
  res.writeHead(404, headers);
  res.end(JSON.stringify({
    success: false,
    error: 'Route non trouvée'
  }));
});

// Port d'écoute (pour Railway)
const PORT = process.env.PORT || 5000;

// Démarrage du serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur HTTP démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`📊 Test API: http://0.0.0.0:${PORT}/api/products`);
});