require('dotenv').config({ path: __dirname + '/.env' });
const http = require('http');
const url = require('url');
const { testConnection, prisma } = require('./config/supabase');
const productsService = require('./services/productsService');

// Use DB-backed admin users & sessions
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ccm_sess';

const bcrypt = require('bcryptjs');

// Helper: create a DB session
async function createDbSession(userId) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expiresAt = null; // keep null for now or compute expiration
  const session = await prisma.adminSession.create({ data: { token, userId, expiresAt } });
  return session;
}

// Helper: verify session token from cookie and return session row
async function getSessionFromRequest(req) {
  try {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    if (!match) return null;
    const token = match[1];
    const session = await prisma.adminSession.findUnique({ where: { token } });
    return session;
  } catch (e) {
    return null;
  }
}

// Test de la connexion PostgreSQL/Prisma au démarrage
testConnection();

const server = http.createServer(async (req, res) => {
  // Headers CORS
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://ccm-shop.vercel.app'
  ];

  const origin = req.headers.origin || '';
  // Allow explicit dev localhost ports and any localhost origin for convenience
  if (origin && (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    // When echoing the origin, it's safe to allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // Do not permit credentials for unknown origins; send explicit null to fail strict checks
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Content-Type', 'application/json');

  // Gérer les requêtes OPTIONS (préflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`${req.method} ${path}`);

  // ...existing code...

  // Route de base
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
        message: 'API E-commerce Bijoux avec PostgreSQL/Prisma ✨',
        version: '2.0.0',
        status: 'active',
        database: 'PostgreSQL (Prisma)',
      endpoints: [
        'GET / - Cette page',
        'GET /api/products - Liste des produits',
        'GET /api/products/:id - Détail d\'un produit',
        'POST /api/products - Créer un produit',
        'PUT /api/products/:id - Modifier un produit',
        'DELETE /api/products/:id - Supprimer un produit'
      ]
    }));
    return;
  }

  // Route produits - GET /api/products
  if (path === '/api/products' && req.method === 'GET') {
    try {
      const result = await productsService.getAllProducts(query);
      
      if (result.success) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          count: result.count,
          data: result.data
        }));
      } else {
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: result.error
        }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des produits'
      }));
    }
    return;
  }

  // Route commandes - GET /api/orders (admin only)
  if (path === '/api/orders' && req.method === 'GET') {
    try {
      const session = await getSessionFromRequest(req);
      if (!session) {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, error: 'Not authenticated' }));
        return;
      }

      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });

      // Map items to a frontend-friendly shape
      const mapped = orders.map(o => ({
        id: o.id,
        orderNumber: o.id,
        customerInfo: {
          firstName: o.customerFirstName,
          lastName: o.customerLastName,
          email: o.customerEmail,
          phone: o.customerPhone
        },
        items: o.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
  total: o.total,
  status: (o.status || '').toLowerCase(),
        createdAt: o.createdAt
      }));

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: mapped }));
    } catch (err) {
      console.error('Get orders error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la récupération des commandes' }));
    }
    return;
  }

  // Auth: POST /api/auth/login -> set HttpOnly session cookie
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        // Find admin user
        const user = await prisma.adminUser.findUnique({ where: { email: email || process.env.ADMIN_EMAIL || 'admin@local' } });
        if (!user) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        const match = await bcrypt.compare(password || process.env.ADMIN_PASSWORD || '', user.password);
        if (!match) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        // Create DB session
        const session = await createDbSession(user.id);
        const cookie = `${SESSION_COOKIE_NAME}=${session.token}; HttpOnly; Path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
        res.setHeader('Set-Cookie', cookie);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Login error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Login error' }));
      }
    });
    return;
  }

  // Auth: POST /api/auth/logout -> clear cookie
  if (path === '/api/auth/logout' && req.method === 'POST') {
    try {
      const cookieHeader = req.headers.cookie || '';
      const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) {
        // Delete DB session
        await prisma.adminSession.deleteMany({ where: { token: match[1] } });
      }

      // Expire cookie
      const expired = `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      res.setHeader('Set-Cookie', expired);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error('Logout error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Logout error' }));
    }
    return;
  }

  // Auth: GET /api/auth/me -> validate session
  if (path === '/api/auth/me' && req.method === 'GET') {
    try {
      const session = await getSessionFromRequest(req);
      if (!session) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Not authenticated' }));
        return;
      }
      const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
      if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid session' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ authenticated: true, user: { id: user.id, email: user.email, role: user.role } }));
    } catch (err) {
      console.error('Auth check error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Auth check error' }));
    }
    return;
  }

  // Route produit par ID - GET /api/products/:id
  if (path.startsWith('/api/products/') && req.method === 'GET') {
    try {
      const id = parseInt(path.split('/')[3]);
      const result = await productsService.getProductById(id);
      
      if (result.success) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: result.data
        }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: result.error || 'Produit non trouvé'
        }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération du produit'
      }));
    }
    return;
  }

  // Route mise à jour produit - PUT /api/products/:id
  if (path.startsWith('/api/products/') && req.method === 'PUT') {
    // Vérifier session DB
    const sessionPut = await getSessionFromRequest(req);
    if (!sessionPut) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const id = parseInt(path.split('/')[3]);
        const updates = JSON.parse(body);
        const result = await productsService.updateProduct(id, updates);
        if (result.success) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: result.data }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: result.error }));
        }
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la mise à jour du produit' }));
      }
    });
    return;
  }

  // Route suppression produit - DELETE /api/products/:id
  if (path.startsWith('/api/products/') && req.method === 'DELETE') {
    // Vérifier session DB
    const sessionDel = await getSessionFromRequest(req);
    if (!sessionDel) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    try {
      const id = parseInt(path.split('/')[3]);
      const result = await productsService.deleteProduct(id);
      if (result.success) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: result.error }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la suppression du produit' }));
    }
    return;
  }

  // Admin: DELETE /api/admin/reset -> supprimer tous les produits et collections (protégé)
  if (path === '/api/admin/reset' && req.method === 'DELETE') {
    try {
      // Vérifier session
      const sessionReset = await getSessionFromRequest(req);
      if (!sessionReset) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Not authenticated' }));
        return;
      }

      // En production, cette opération devrait être limitée / journalisée
      await prisma.product.deleteMany();
      // Si vous avez une table collections dans Prisma, la supprimer aussi
      try {
        await prisma.collection.deleteMany();
      } catch (e) {
        // Pas de modèle collection: ignorer
      }

      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erreur lors du reset admin' }));
    }
    return;
  }

  // Route création produit - POST /api/products
  if (path === '/api/products' && req.method === 'POST') {
    const sessionPost = await getSessionFromRequest(req);
    if (!sessionPost) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const productData = JSON.parse(body);
        const result = await productsService.createProduct(productData);
        
        if (result.success) {
          res.writeHead(201);
          res.end(JSON.stringify({
            success: true,
            message: 'Produit créé avec succès',
            data: result.data
          }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: result.error
          }));
        }
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: 'Erreur lors de la création du produit'
        }));
      }
    });
    return;
  }

  // --- Collections CRUD ---
  // GET /api/collections -> list all collections
  if (path === '/api/collections' && req.method === 'GET') {
    try {
      const collections = await prisma.collection.findMany({
        orderBy: { dateCreation: 'desc' },
        include: { produits: true }
      });
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: collections }));
    } catch (err) {
      console.error('Get collections error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la récupération des collections' }));
    }
    return;
  }

  // GET /api/collections/:id -> get one collection with product relations
  if (path.startsWith('/api/collections/') && req.method === 'GET') {
    try {
      const id = parseInt(path.split('/')[3]);
      const collection = await prisma.collection.findUnique({
        where: { id },
        include: { produits: { include: { product: true } } }
      });
      if (!collection) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Collection non trouvée' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: collection }));
    } catch (err) {
      console.error('Get collection error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la récupération de la collection' }));
    }
    return;
  }

  // POST /api/collections -> create collection (protected)
  if (path === '/api/collections' && req.method === 'POST') {
    const sessionC = await getSessionFromRequest(req);
    if (!sessionC) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const created = await prisma.collection.create({ data: {
          nom: data.nom || 'Nouvelle collection',
          description: data.description || '',
          imageCouverture: data.imageCouverture || '',
          imageApercu: data.imageApercu || '',
          active: typeof data.active === 'boolean' ? data.active : true
        } });
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, data: created }));
      } catch (err) {
        console.error('Create collection error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la création de la collection' }));
      }
    });
    return;
  }

  // PUT /api/collections/:id -> update collection (protected)
  if (path.startsWith('/api/collections/') && req.method === 'PUT') {
    const sessionU = await getSessionFromRequest(req);
    if (!sessionU) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const id = parseInt(path.split('/')[3]);
        const updates = JSON.parse(body);
        const updated = await prisma.collection.update({ where: { id }, data: {
          nom: updates.nom,
          description: updates.description,
          imageCouverture: updates.imageCouverture,
          imageApercu: updates.imageApercu,
          active: typeof updates.active === 'boolean' ? updates.active : undefined,
          dateModification: new Date()
        } });
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: updated }));
      } catch (err) {
        console.error('Update collection error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la mise à jour de la collection' }));
      }
    });
    return;
  }

  // DELETE /api/collections/:id -> delete collection (protected)
  if (path.startsWith('/api/collections/') && req.method === 'DELETE') {
    const sessionD = await getSessionFromRequest(req);
    if (!sessionD) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    try {
      const id = parseInt(path.split('/')[3]);
      await prisma.collection.delete({ where: { id } });
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error('Delete collection error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la suppression de la collection' }));
    }
    return;
  }

  // POST /api/collections/:id/products -> add a product to collection (protected)
  if (path.match(/^\/api\/collections\/\d+\/products$/) && req.method === 'POST') {
    const sessionAP = await getSessionFromRequest(req);
    if (!sessionAP) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parts = path.split('/');
        const collectionId = parseInt(parts[3]);
        const { productId } = JSON.parse(body);
        // create join row if not exists
        await prisma.collectionProduct.upsert({
          where: { collectionId_productId: { collectionId, productId } },
          update: {},
          create: { collectionId, productId }
        });
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Add product to collection error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de l\'ajout du produit à la collection' }));
      }
    });
    return;
  }

  // DELETE /api/collections/:id/products/:productId -> remove product from collection (protected)
  if (path.match(/^\/api\/collections\/\d+\/products\/\d+$/) && req.method === 'DELETE') {
    const sessionRP = await getSessionFromRequest(req);
    if (!sessionRP) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    try {
      const parts = path.split('/');
      const collectionId = parseInt(parts[3]);
      const productId = parseInt(parts[5]);
      await prisma.collectionProduct.deleteMany({ where: { collectionId, productId } });
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error('Remove product from collection error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la suppression du produit de la collection' }));
    }
    return;
  }

  // --- Cart endpoints (server-side cart) ---
  // GET /api/cart -> read cart by token cookie or query ?token=
  if (path === '/api/cart' && req.method === 'GET') {
    try {
      const cookieHeader = req.headers.cookie || '';
      const match = cookieHeader.match(/cart_token=([^;]+)/);
      const token = match ? match[1] : (query.token || null);
      if (!token) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: { token: null, items: [] } }));
        return;
      }
      const cart = await prisma.cart.findUnique({ where: { token }, include: { items: { include: { product: true } } } });
      if (!cart) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Cart not found' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: cart }));
    } catch (err) {
      console.error('Get cart error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la récupération du panier' }));
    }
    return;
  }

  // POST /api/cart -> create or replace cart items; returns token
  if (path === '/api/cart' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const cookieHeader = req.headers.cookie || '';
        const match = cookieHeader.match(/cart_token=([^;]+)/);
        let token = match ? match[1] : (payload.token || null);

        if (!token) {
          token = Math.random().toString(36).slice(2) + Date.now().toString(36);
          // create empty cart
          await prisma.cart.create({ data: { token } });
        }

        const cart = await prisma.cart.findUnique({ where: { token } });
        if (!cart) {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, error: 'Cart not found' }));
          return;
        }

        // Replace items: delete existing then create new
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        const items = Array.isArray(payload.items) ? payload.items : [];
        for (const it of items) {
          const productId = parseInt(it.productId);
          const quantity = parseInt(it.quantity) || 0;
          if (!productId || quantity <= 0) continue;
          await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
        }

        // Return updated cart
        const updated = await prisma.cart.findUnique({ where: { token }, include: { items: { include: { product: true } } } });
        res.writeHead(200, { 'Set-Cookie': `cart_token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax` });
        res.end(JSON.stringify({ success: true, data: updated }));
      } catch (err) {
        console.error('Create/update cart error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la mise à jour du panier' }));
      }
    });
    return;
  }

  // PUT /api/cart/items -> upsert single item
  if (path === '/api/cart/items' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const cookieHeader = req.headers.cookie || '';
        const match = cookieHeader.match(/cart_token=([^;]+)/);
        const token = match ? match[1] : (payload.token || null);
        if (!token) return res.end(JSON.stringify({ success: false, error: 'Missing cart token' }));
        const cart = await prisma.cart.findUnique({ where: { token } });
        if (!cart) return res.writeHead(404) && res.end(JSON.stringify({ success: false, error: 'Cart not found' }));

        const productId = parseInt(payload.productId);
        const quantity = parseInt(payload.quantity) || 0;
        if (!productId) return res.writeHead(400) && res.end(JSON.stringify({ success: false, error: 'Invalid productId' }));

        if (quantity <= 0) {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
        } else {
          // upsert: delete existing then create
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
          await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
        }

        const updated = await prisma.cart.findUnique({ where: { token }, include: { items: { include: { product: true } } } });
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: updated }));
      } catch (err) {
        console.error('Upsert cart item error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la modification du panier' }));
      }
    });
    return;
  }

  // DELETE /api/cart -> clear cart
  if (path === '/api/cart' && req.method === 'DELETE') {
    try {
      const cookieHeader = req.headers.cookie || '';
      const match = cookieHeader.match(/cart_token=([^;]+)/);
      const token = match ? match[1] : (query.token || null);
      if (!token) return res.writeHead(400) && res.end(JSON.stringify({ success: false, error: 'Missing token' }));
      const cart = await prisma.cart.findUnique({ where: { token } });
      if (!cart) return res.writeHead(404) && res.end(JSON.stringify({ success: false, error: 'Cart not found' }));
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error('Clear cart error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Erreur lors de la suppression du panier' }));
    }
    return;
  }

  // POST /api/orders -> create order and decrement stock atomically
  if (path === '/api/orders' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const items = Array.isArray(payload.items) ? payload.items : [];
        const customer = payload.customerInfo || {};

        if (!customer.firstName || !customer.lastName || !customer.email) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Informations client incomplètes' }));
          return;
        }

        // Validate availability
        for (const it of items) {
          const product = await prisma.product.findUnique({ where: { id: parseInt(it.productId) } });
          if (!product) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, error: `Produit ${it.productId} introuvable` }));
            return;
          }
          if (product.stock < (it.quantity || 0)) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, error: `Stock insuffisant pour ${product.name}` }));
            return;
          }
        }

        // Create order and decrement stock in a transaction
        const total = items.reduce((s, it) => s + (parseFloat(String(it.price || 0)) * (it.quantity || 0)), 0);

        const created = await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({ data: {
            customerFirstName: customer.firstName,
            customerLastName: customer.lastName,
            customerEmail: customer.email,
            customerPhone: customer.phone || null,
            shippingAddress: payload.shippingAddress || null,
            total: total,
            status: 'CONFIRMED',
            notes: payload.notes || null
          } });

          for (const it of items) {
            const pid = parseInt(it.productId);
            const qty = parseInt(it.quantity) || 0;
            const prod = await tx.product.findUnique({ where: { id: pid } });
            await tx.orderItem.create({ data: { orderId: order.id, productId: pid, quantity: qty, price: prod.price } });
            // decrement stock
            await tx.product.update({ where: { id: pid }, data: { stock: { decrement: qty } } });
          }

          // If a cart token was provided, clear it
          const cookieHeader = req.headers.cookie || '';
          const match = cookieHeader.match(/cart_token=([^;]+)/);
          const token = match ? match[1] : (payload.token || null);
          if (token) {
            const cart = await tx.cart.findUnique({ where: { token } });
            if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          }

          return order;
        });

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, data: { orderId: created.id, status: 'CONFIRMED' } }));
      } catch (err) {
        console.error('Create order error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la création de la commande' }));
      }
    });
    return;
  }

  // POST /api/orders/:id/status -> update order status (admin only)
  if (path.startsWith('/api/orders/') && path.endsWith('/status') && req.method === 'POST') {
    // require admin session
    const sessionStatus = await getSessionFromRequest(req);
    if (!sessionStatus) {
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, error: 'Not authenticated' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const newStatus = (payload.status || '').toString().toLowerCase();
        const parts = path.split('/');
        const idPart = parts[3];
        const orderId = parseInt(idPart);
        if (!orderId) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Invalid order id' }));
          return;
        }

        // Map frontend statuses to Prisma enum values
        const statusMap = {
          pending: 'PENDING',
          confirmed: 'CONFIRMED',
          preparing: 'SHIPPED',
          ready: 'SHIPPED',
          delivered: 'DELIVERED',
          collected: 'DELIVERED',
          cancelled: 'CANCELLED'
        };

        const prismaStatus = statusMap[newStatus];
        if (!prismaStatus) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Status not supported' }));
          return;
        }

        const updated = await prisma.order.update({ where: { id: orderId }, data: { status: prismaStatus } });

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: { orderId: updated.id, status: (updated.status || '').toLowerCase() } }));
      } catch (err) {
        console.error('Update order status error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la mise à jour du statut' }));
      }
    });
    return;
  }

  // Route 404
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Route non trouvée',
    message: 'Cette route n\'existe pas sur notre API'
  }));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré avec PostgreSQL/Prisma sur le port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Base de données: PostgreSQL (via Prisma)`);
  console.log(`📊 Test API: http://0.0.0.0:${PORT}/api/products`);
});
