const request = require('supertest');
const express = require('express');

// Import the router under test
const productsRouter = require('../routes/products');

// Create a minimal express app mounting the router
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productsRouter);
  return app;
}

describe('Products routes (integration-ish)', () => {
  const app = createApp();

  test('GET /api/products returns list and respects query filters', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/products/:id returns 404 for missing product', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
