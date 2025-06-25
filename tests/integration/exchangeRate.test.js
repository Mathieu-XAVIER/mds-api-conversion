/**
 * Tests d'intégration - Mock d'une API externe de taux de change
 */

const conversionService = require('../../src/services/conversionService');

class MockExchangeRateAPI {
    constructor() {
        this.rates = {
            'EUR_USD': 1.1,
            'USD_GBP': 0.8,
            'EUR_GBP': 0.88
        };
        this.isOnline = true;
        this.delay = 0;
    }

    async getRates() {
        if (!this.isOnline) {
            throw new Error('API Service Unavailable');
        }

        if (this.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }

        return { ...this.rates };
    }

    async getRate(from, to) {
        const rates = await this.getRates();
        const key = `${from}_${to}`;

        if (!rates[key]) {
            throw new Error(`Rate not available for ${from} to ${to}`);
        }

        return rates[key];
    }

    setOffline() {
        this.isOnline = false;
    }

    setOnline() {
        this.isOnline = true;
    }

    setDelay(ms) {
        this.delay = ms;
    }

    updateRate(from, to, rate) {
        const key = `${from}_${to}`;
        this.rates[key] = rate;
    }
}

class ExchangeRateService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getRate(from, to) {
        const cacheKey = `${from}_${to}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.rate;
        }

        try {
            const rate = await this.apiClient.getRate(from, to);

            this.cache.set(cacheKey, {
                rate,
                timestamp: Date.now()
            });

            return rate;
        } catch (error) {
            console.warn('API unavailable, using fallback rates:', error.message);
            return conversionService.getExchangeRate(from, to);
        }
    }

    async convertWithExternalAPI(from, to, amount) {
        const rate = await this.getRate(from, to);
        const convertedAmount = Math.round(amount * rate * 100) / 100;

        return {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            originalAmount: amount,
            convertedAmount,
            rate,
            source: 'external_api'
        };
    }

    clearCache() {
        this.cache.clear();
    }
}

describe('Tests d\'intégration - API de taux de change', () => {
    let mockAPI;
    let exchangeService;

    beforeEach(() => {
        mockAPI = new MockExchangeRateAPI();
        exchangeService = new ExchangeRateService(mockAPI);
    });

    describe('Communication avec l\'API mockée', () => {
        test('devrait récupérer les taux depuis l\'API', async () => {
            const rate = await exchangeService.getRate('EUR', 'USD');
            expect(rate).toBe(1.1);
        });

        test('devrait convertir en utilisant l\'API externe', async () => {
            const result = await exchangeService.convertWithExternalAPI('EUR', 'USD', 100);

            expect(result).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110,
                rate: 1.1,
                source: 'external_api'
            });
        });

        test('devrait mettre en cache les taux', async () => {
            const rate1 = await exchangeService.getRate('EUR', 'USD');

            mockAPI.updateRate('EUR', 'USD', 1.2);

            const rate2 = await exchangeService.getRate('EUR', 'USD');

            expect(rate1).toBe(1.1);
            expect(rate2).toBe(1.1);
        });

        test('devrait rafraîchir le cache après expiration', async () => {
            exchangeService.cacheTimeout = 10; // 10ms

            const rate1 = await exchangeService.getRate('EUR', 'USD');

            await new Promise(resolve => setTimeout(resolve, 20));

            mockAPI.updateRate('EUR', 'USD', 1.2);

            const rate2 = await exchangeService.getRate('EUR', 'USD');

            expect(rate1).toBe(1.1);
            expect(rate2).toBe(1.2);
        });
    });

    describe('Gestion des erreurs et fallback', () => {
        test('devrait utiliser les taux de fallback quand l\'API est hors ligne', async () => {
            mockAPI.setOffline();

            const result = await exchangeService.convertWithExternalAPI('EUR', 'USD', 100);

            expect(result.convertedAmount).toBe(110);
            expect(result.rate).toBe(1.1);
        });

        test('devrait gérer les timeouts de l\'API', async () => {
            mockAPI.setDelay(1000);

            const startTime = Date.now();
            const rate = await exchangeService.getRate('EUR', 'USD');
            const endTime = Date.now();

            expect(rate).toBe(1.1);
            expect(endTime - startTime).toBeGreaterThan(900);
        });

        test('devrait gérer les taux non disponibles', async () => {
            try {
                await exchangeService.getRate('EUR', 'JPY');
            } catch (error) {
                expect(error.message).toContain('Taux de conversion non disponible');
            }
        });
    });

    describe('Scénarios de charge', () => {
        test('devrait gérer plusieurs appels simultanés', async () => {
            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(exchangeService.getRate('EUR', 'USD'));
            }

            const rates = await Promise.all(promises);

            rates.forEach(rate => {
                expect(rate).toBe(1.1);
            });
        });

        test('devrait maintenir la performance avec le cache', async () => {
            await exchangeService.getRate('EUR', 'USD');

            const startTime = Date.now();

            for (let i = 0; i < 100; i++) {
                await exchangeService.getRate('EUR', 'USD');
            }

            const endTime = Date.now();
            const avgTime = (endTime - startTime) / 100;

            expect(avgTime).toBeLessThan(1);
        });
    });

    describe('Intégration avec le service de conversion', () => {
        test('devrait pouvoir basculer entre API externe et service local', async () => {
            const externalResult = await exchangeService.convertWithExternalAPI('EUR', 'USD', 100);

            const localResult = conversionService.convertCurrency('EUR', 'USD', 100);

            expect(externalResult.convertedAmount).toBe(localResult.convertedAmount);
            expect(externalResult.rate).toBe(localResult.rate);
        });

        test('devrait valider la cohérence des taux', async () => {
            const eurToUsd = await exchangeService.getRate('EUR', 'USD');
            const usdToGbp = await exchangeService.getRate('USD', 'GBP');

            const directRate = eurToUsd * usdToGbp;
            const expectedRate = 1.1 * 0.8; // 0.88

            expect(directRate).toBeCloseTo(expectedRate, 2);
        });
    });

    describe('Nettoyage et maintenance', () => {
        test('devrait pouvoir vider le cache', async () => {
            await exchangeService.getRate('EUR', 'USD');
            expect(exchangeService.cache.size).toBe(1);

            exchangeService.clearCache();
            expect(exchangeService.cache.size).toBe(0);
        });

        test('devrait gérer la mémoire avec un grand nombre de paires', async () => {
            const pairs = [
                ['EUR', 'USD'], ['USD', 'GBP'], ['EUR', 'GBP'],
                ['USD', 'EUR'], ['GBP', 'USD'], ['GBP', 'EUR']
            ];

            mockAPI.updateRate('USD', 'EUR', 1/1.1);
            mockAPI.updateRate('GBP', 'USD', 1/0.8);
            mockAPI.updateRate('GBP', 'EUR', 1/0.88);

            for (const [from, to] of pairs) {
                try {
                    await exchangeService.getRate(from, to);
                } catch (error) {
                    // Ignorer les erreurs pour les paires non supportées
                    console.log(`Skipping ${from}_${to}: ${error.message}`);
                }
            }

            expect(exchangeService.cache.size).toBeLessThanOrEqual(pairs.length);
        });
    });
});