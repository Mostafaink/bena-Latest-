process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('unknown route returns 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth Routes', () => {
  const user = { name: 'Alice', email: 'alice@example.com', password: 'secret123' };
  let token;

  it('POST /api/auth/register creates a user', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password).toBeUndefined();
    token = res.body.token;
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/register validates fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad', password: '123' });
    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/me returns current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  it('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

describe('Items Routes', () => {
  let token;
  let itemId;

  beforeAll(async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'secret123' });
    token = reg.body.token;
  });

  it('GET /api/items returns empty list initially', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('POST /api/items creates item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Test item', description: 'A description' });
    expect(res.statusCode).toBe(201);
    expect(res.body.item.title).toBe('Test item');
    itemId = res.body.item.id;
  });

  it('POST /api/items without auth returns 401', async () => {
    const res = await request(app).post('/api/items').send({ title: 'x' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/items without title returns 422', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer ' + token)
      .send({});
    expect(res.statusCode).toBe(422);
  });

  it('GET /api/items/:id returns the item', async () => {
    const res = await request(app).get('/api/items/' + itemId);
    expect(res.statusCode).toBe(200);
    expect(res.body.item.id).toBe(itemId);
  });

  it('PUT /api/items/:id updates the item', async () => {
    const res = await request(app)
      .put('/api/items/' + itemId)
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Updated title' });
    expect(res.statusCode).toBe(200);
    expect(res.body.item.title).toBe('Updated title');
  });

  it('DELETE /api/items/:id removes the item', async () => {
    const res = await request(app)
      .delete('/api/items/' + itemId)
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(204);
  });

  it('GET /api/items/:id returns 404 after deletion', async () => {
    const res = await request(app).get('/api/items/' + itemId);
    expect(res.statusCode).toBe(404);
  });
});
