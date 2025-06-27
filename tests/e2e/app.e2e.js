const request = require('supertest');
const app = require('../../src/app');

describe('Endpoints API', () => {
  it('GET / doit répondre 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('GET /convert doit répondre 200', async () => {
    const res = await request(app)
      .get('/convert')
      .query({ from: 'EUR', to: 'USD', amount: 100 });
    expect(res.statusCode).toBe(200);
  });

  it('GET /tva doit répondre 200', async () => {
    const res = await request(app)
      .get('/tva')
      .query({ ht: 100, taux: 20 });
    expect(res.statusCode).toBe(200);
  });

  it('GET /remise doit répondre 200', async () => {
    const res = await request(app)
      .get('/remise')
      .query({ prix: 100, pourcentage: 10 });
    expect(res.statusCode).toBe(200);
  });
});