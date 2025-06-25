const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoints', () => {
    describe('GET /', () => {
        test('devrait retourner les informations de l\'API', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.body).toHaveProperty('service');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('endpoints');
            expect(Array.isArray(response.body.endpoints)).toBe(true);
        });
    });

    describe('GET /convert', () => {
        test('devrait convertir EUR vers USD', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.body).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110
            });
        });

        test('devrait convertir USD vers GBP', async () => {
            const response = await request(app)
                .get('/convert?from=USD&to=GBP&amount=100')
                .expect(200);

            expect(response.body).toEqual({
                from: 'USD',
                to: 'GBP',
                originalAmount: 100,
                convertedAmount: 80
            });
        });

        test('devrait gérer les montants décimaux', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=50.5')
                .expect(200);

            expect(response.body.originalAmount).toBe(50.5);
            expect(response.body.convertedAmount).toBe(55.55);
        });

        test('devrait retourner 400 pour des paramètres manquants', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Paramètres requis manquants');
        });

        test('devrait retourner 400 pour un montant négatif', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=-10')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('positif');
        });

        test('devrait retourner 400 pour une devise non supportée', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=JPY&amount=100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Devise cible invalide');
        });

        test('devrait retourner 400 pour un montant non numérique', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=abc')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait être insensible à la casse des devises', async () => {
            const response = await request(app)
                .get('/convert?from=eur&to=usd&amount=100')
                .expect(200);

            expect(response.body.from).toBe('EUR');
            expect(response.body.to).toBe('USD');
        });
    });

    describe('GET /tva', () => {
        test('devrait calculer la TVA correctement', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=20')
                .expect(200);

            expect(response.body).toEqual({
                ht: 100,
                taux: 20,
                ttc: 120
            });
        });

        test('devrait gérer un taux de 0%', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=0')
                .expect(200);

            expect(response.body).toEqual({
                ht: 100,
                taux: 0,
                ttc: 100
            });
        });

        test('devrait gérer les montants décimaux', async () => {
            const response = await request(app)
                .get('/tva?ht=33.33&taux=20')
                .expect(200);

            expect(response.body.ht).toBe(33.33);
            expect(response.body.taux).toBe(20);
            expect(response.body.ttc).toBe(40);
        });

        test('devrait retourner 400 pour des paramètres manquants', async () => {
            const response = await request(app)
                .get('/tva?ht=100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Paramètres requis manquants');
        });

        test('devrait retourner 400 pour un montant HT négatif', async () => {
            const response = await request(app)
                .get('/tva?ht=-10&taux=20')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait retourner 400 pour un taux négatif', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=-5')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait retourner 400 pour un taux supérieur à 100%', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=150')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait retourner 400 pour des paramètres non numériques', async () => {
            const response = await request(app)
                .get('/tva?ht=abc&taux=20')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /remise', () => {
        test('devrait calculer la remise correctement', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=10')
                .expect(200);

            expect(response.body).toEqual({
                prixInitial: 100,
                pourcentage: 10,
                prixFinal: 90
            });
        });

        test('devrait gérer une remise de 0%', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=0')
                .expect(200);

            expect(response.body).toEqual({
                prixInitial: 100,
                pourcentage: 0,
                prixFinal: 100
            });
        });

        test('devrait gérer une remise de 100%', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=100')
                .expect(200);

            expect(response.body).toEqual({
                prixInitial: 100,
                pourcentage: 100,
                prixFinal: 0
            });
        });

        test('devrait gérer les prix décimaux', async () => {
            const response = await request(app)
                .get('/remise?prix=33.33&pourcentage=10')
                .expect(200);

            expect(response.body.prixInitial).toBe(33.33);
            expect(response.body.pourcentage).toBe(10);
            expect(response.body.prixFinal).toBe(30);
        });

        test('devrait retourner 400 pour des paramètres manquants', async () => {
            const response = await request(app)
                .get('/remise?prix=100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Paramètres requis manquants');
        });

        test('devrait retourner 400 pour un prix négatif', async () => {
            const response = await request(app)
                .get('/remise?prix=-10&pourcentage=10')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait retourner 400 pour un pourcentage négatif', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=-10')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait retourner 400 pour un pourcentage supérieur à 100%', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=150')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('devrait retourner 400 pour des paramètres non numériques', async () => {
            const response = await request(app)
                .get('/remise?prix=abc&pourcentage=10')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Routes non existantes', () => {
        test('devrait retourner 404 pour une route inexistante', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Route non trouvée');
            expect(response.body).toHaveProperty('availableEndpoints');
        });

        test('devrait retourner 404 pour une méthode non supportée', async () => {
            const response = await request(app)
                .post('/convert')
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Headers et format de réponse', () => {
        test('devrait retourner du JSON pour toutes les routes', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.headers['content-type']).toMatch(/json/);
        });

        test('devrait supporter CORS', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });
    });
});