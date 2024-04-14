const request = require('supertest');
const path = require('path');
const app = require(path.resolve(__dirname, './server'));

// Test suite for the Product API
describe('Product API', () => {
  // Test suite for POST /products endpoint
  describe('POST /products', () => {
    // Test case to create a new product
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        category: 'Test Category',
        price: 100,
        stock: 10
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock
      });
    });

    // Test case to validate required fields
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/products')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('กรุณาระบุค่าทุกฟิลด์ที่จำเป็น');
    });

    // Test case to validate field types
    it('should return 400 if field types are invalid', async () => {
      const invalidProduct = {
        name: 123,
        category: 456,
        price: '100',
        stock: '10'
      };

      const response = await request(app)
        .post('/products')
        .send(invalidProduct);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('ประเภทของค่าไม่ถูกต้อง');
    });

    // Test case to validate price and stock values
    it('should return 400 if price or stock is less than or equal to 0', async () => {
      const invalidProduct = {
        name: 'Test Product',
        category: 'Test Category',
        price: -1,
        stock: -1
      };

      const response = await request(app)
        .post('/products')
        .send(invalidProduct);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('ราคาและจำนวนสินค้าคงคลังต้องมากกว่า 0');
    });
  });

  // Test suite for GET /products endpoint
  describe('GET /products', () => {
    // Test case to get all products
    it('should return all products', async () => {
      const response = await request(app).get('/products');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Test suite for PUT /products/:id endpoint
  describe('PUT /products/:id', () => {
    // Test case to update an existing product
    it('should update an existing product', async () => {
      const newProduct = {
        name: 'Updated Test Product',
        category: 'Updated Test Category',
        price: 150,
        stock: 20
      };

      const response = await request(app)
        .put('/products/1')
        .send(newProduct);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        ...newProduct
      });
    });

    // Test case to validate required fields
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .put('/products/1')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('กรุณาระบุค่าทุกฟิลด์ที่จำเป็น');
    });

    // Test case to validate field types
    it('should return 400 if field types are invalid', async () => {
      const invalidProduct = {
        name: 123,
        category: 456,
        price: '100',
        stock: '10'
      };

      const response = await request(app)
        .put('/products/1')
        .send(invalidProduct);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('ประเภทของค่าไม่ถูกต้อง');
    });

    // Test case to validate price and stock values
    it('should return 400 if price or stock is less than or equal to 0', async () => {
      const invalidProduct = {
        name: 'Test Product',
        category: 'Test Category',
        price: -1,
        stock: -1
      };

      const response = await request(app)
        .put('/products/1')
        .send(invalidProduct);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('ราคาและจำนวนสินค้าคงคลังต้องมากกว่า 0');
    });

    // Test case to handle product not found
    it('should return 404 if product not found', async () => {
      const response = await request(app)
        .put('/products/999')
        .send({
          name: 'Test Product',
          category: 'Test Category',
          price: 100,
          stock: 10
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('ไม่พบสินค้าที่ต้องการ');
    });
  });

  // Test suite for DELETE /products/:id endpoint
  describe('DELETE /products/:id', () => {
    // Test case to delete a product
    it('should delete a product', async () => {
      const response = await request(app).delete('/products/1');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('สินค้าถูกลบแล้ว และได้รีไอดีสินค้าทั้งหมดใหม่');
    });

    // Test case to handle product not found
    it('should return 404 if product not found', async () => {
      const response = await request(app).delete('/products/999');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('ไม่พบสินค้าที่ต้องการ');
    });
  });

  // Test suite for DELETE /products endpoint
  describe('DELETE /products', () => {
    // Test case to delete all products and reset auto-increment
    it('should delete all products and reset auto-increment', async () => {
      const response = await request(app).delete('/products');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('สินค้าทั้งหมดถูกลบแล้ว และได้รีไอดีสินค้าทั้งหมดใหม่');
    });
  });
});
