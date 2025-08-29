const productsService = require('../services/productsService');

// Mock the prisma client used in services/config
jest.mock('../config/supabase', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

const { prisma } = require('../config/supabase');

describe('ProductsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createProduct returns created product on success', async () => {
    const productIn = { name: 'Collier', price: 42 };
    const created = { id: 'abc', ...productIn };
    prisma.product.create.mockResolvedValue(created);

    const res = await productsService.createProduct(productIn);

    expect(prisma.product.create).toHaveBeenCalledWith({ data: productIn });
    expect(res).toEqual({ success: true, data: created });
  });

  test('getAllProducts returns empty list when none', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    const res = await productsService.getAllProducts();
    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(res).toEqual({ success: true, data: [], count: 0 });
  });

  test('getProductById returns error when not found', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    const res = await productsService.getProductById('nope');
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'nope' } });
    expect(res).toEqual({ success: false, error: 'Produit non trouvé' });
  });

  test('updateProduct returns updated data', async () => {
    const updated = { id: 'u1', name: 'Bagues' };
    prisma.product.update.mockResolvedValue(updated);
    const res = await productsService.updateProduct('u1', { name: 'Bagues' });
    expect(prisma.product.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { name: 'Bagues' } });
    expect(res).toEqual({ success: true, data: updated });
  });

  test('deleteProduct returns success true on delete', async () => {
    prisma.product.delete.mockResolvedValue({});
    const res = await productsService.deleteProduct('d1');
    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
    expect(res).toEqual({ success: true });
  });

  test('getAllProducts supports category, featured and limit filters', async () => {
    // Prepare sample data
    const sample = [
      { id: 1, category: 'colliers', featured: true },
      { id: 2, category: 'bagues', featured: false },
      { id: 3, category: 'bagues', featured: true }
    ];
    prisma.product.findMany.mockImplementation(({ where, take }) => {
      let res = sample;
      if (where && where.category) res = res.filter(r => r.category === where.category);
      if (where && where.featured !== undefined) res = res.filter(r => r.featured === where.featured);
      if (take) res = res.slice(0, take);
      return Promise.resolve(res);
    });

    const r1 = await productsService.getAllProducts({ category: 'bagues' });
    expect(r1.success).toBe(true);
    expect(r1.count).toBe(2);

    const r2 = await productsService.getAllProducts({ featured: 'true' });
    expect(r2.success).toBe(true);
    expect(r2.count).toBe(2);

    const r3 = await productsService.getAllProducts({ limit: 1 });
    expect(r3.success).toBe(true);
    expect(r3.count).toBe(1);
  });
});
