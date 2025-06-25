const conversionService = require('../../src/services/conversionService');
const tvaService = require('../../src/services/tvaService');
const remiseService = require('../../src/services/remiseService');

describe('Service Unit Tests', () => {
  // Tests for conversionService
  describe('conversionService', () => {
    describe('validateConversionParams', () => {
      test('should validate correct parameters', () => {
        const result = conversionService.validateConversionParams('EUR', 'USD', 100);
        expect(result.isValid).toBe(true);
        expect(result.amount).toBe(100);
      });

      test('should reject invalid source currency', () => {
        const result = conversionService.validateConversionParams('XXX', 'USD', 100);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject invalid target currency', () => {
        const result = conversionService.validateConversionParams('EUR', 'XXX', 100);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject negative amount', () => {
        const result = conversionService.validateConversionParams('EUR', 'USD', -10);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject non-numeric amount', () => {
        const result = conversionService.validateConversionParams('EUR', 'USD', 'abc');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject zero amount', () => {
        const result = conversionService.validateConversionParams('EUR', 'USD', 0);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should handle missing currencies', () => {
        const result = conversionService.validateConversionParams(null, null, 100);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(2);
      });
    });

    describe('getExchangeRate', () => {
      test('should return correct rate for EUR to USD', () => {
        const rate = conversionService.getExchangeRate('EUR', 'USD');
        expect(rate).toBe(1.1);
      });

      test('should return 1 for same currency', () => {
        const rate = conversionService.getExchangeRate('EUR', 'EUR');
        expect(rate).toBe(1);
      });

      test('should throw error for unavailable rate', () => {
        expect(() => {
          conversionService.getExchangeRate('EUR', 'JPY');
        }).toThrow();
      });
    });

    describe('convertCurrency', () => {
      test('should convert EUR to USD correctly', () => {
        const result = conversionService.convertCurrency('EUR', 'USD', 100);
        expect(result.convertedAmount).toBe(110);
        expect(result.rate).toBe(1.1);
      });

      test('should throw error for invalid parameters', () => {
        expect(() => {
          conversionService.convertCurrency('EUR', 'USD', -10);
        }).toThrow();
      });
    });

    describe('getAllExchangeRates', () => {
      test('should return all exchange rates', () => {
        const rates = conversionService.getAllExchangeRates();
        expect(rates).toHaveProperty('EUR_USD');
        expect(rates).toHaveProperty('USD_GBP');
        expect(rates).toHaveProperty('EUR_GBP');
        expect(Object.keys(rates).length).toBeGreaterThan(0);
      });
    });
  });

  // Tests for tvaService
  describe('tvaService', () => {
    describe('validateTvaParams', () => {
      test('should validate correct parameters', () => {
        const result = tvaService.validateTvaParams(100, 20);
        expect(result.isValid).toBe(true);
        expect(result.ht).toBe(100);
        expect(result.taux).toBe(20);
      });

      test('should reject negative HT', () => {
        const result = tvaService.validateTvaParams(-10, 20);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject negative rate', () => {
        const result = tvaService.validateTvaParams(100, -5);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject rate over 100%', () => {
        const result = tvaService.validateTvaParams(100, 150);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject non-numeric values', () => {
        const result = tvaService.validateTvaParams('abc', 'xyz');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(2);
      });
    });

    describe('calculateTTC', () => {
      test('should calculate TTC correctly', () => {
        const result = tvaService.calculateTTC(100, 20);
        expect(result.ttc).toBe(120);
        expect(result.montantTva).toBe(20);
      });

      test('should handle 0% rate', () => {
        const result = tvaService.calculateTTC(100, 0);
        expect(result.ttc).toBe(100);
        expect(result.montantTva).toBe(0);
      });

      test('should throw error for invalid parameters', () => {
        expect(() => {
          tvaService.calculateTTC(-10, 20);
        }).toThrow();
      });
    });

    describe('calculateHT', () => {
      test('should calculate HT correctly', () => {
        const result = tvaService.calculateHT(120, 20);
        expect(result.ht).toBe(100);
        expect(result.montantTva).toBe(20);
      });

      test('should handle 0% rate', () => {
        const result = tvaService.calculateHT(100, 0);
        expect(result.ht).toBe(100);
        expect(result.montantTva).toBe(0);
      });

      test('should throw error for negative TTC', () => {
        expect(() => {
          tvaService.calculateHT(-10, 20);
        }).toThrow();
      });

      test('should throw error for negative rate', () => {
        expect(() => {
          tvaService.calculateHT(100, -5);
        }).toThrow();
      });

      test('should throw error for rate over 100%', () => {
        expect(() => {
          tvaService.calculateHT(100, 150);
        }).toThrow();
      });

      test('should throw error for non-numeric values', () => {
        expect(() => {
          tvaService.calculateHT('abc', 20);
        }).toThrow();
      });
    });

    describe('calculateTvaAmount', () => {
      test('should calculate TVA amount correctly', () => {
        const amount = tvaService.calculateTvaAmount(100, 20);
        expect(amount).toBe(20);
      });

      test('should throw error for invalid parameters', () => {
        expect(() => {
          tvaService.calculateTvaAmount(-10, 20);
        }).toThrow();
      });
    });

    describe('getStandardTvaRates', () => {
      test('should return standard TVA rates', () => {
        const rates = tvaService.getStandardTvaRates();
        expect(rates).toHaveProperty('normal', 20);
        expect(rates).toHaveProperty('intermediaire', 10);
        expect(rates).toHaveProperty('reduit', 5.5);
        expect(rates).toHaveProperty('particulier', 2.1);
      });
    });
  });

  // Tests for remiseService
  describe('remiseService', () => {
    describe('validateRemiseParams', () => {
      test('should validate correct parameters', () => {
        const result = remiseService.validateRemiseParams(100, 10);
        expect(result.isValid).toBe(true);
        expect(result.prix).toBe(100);
        expect(result.pourcentage).toBe(10);
      });

      test('should reject negative price', () => {
        const result = remiseService.validateRemiseParams(-10, 10);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject negative percentage', () => {
        const result = remiseService.validateRemiseParams(100, -5);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject percentage over 100%', () => {
        const result = remiseService.validateRemiseParams(100, 150);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('should reject non-numeric values', () => {
        const result = remiseService.validateRemiseParams('abc', 'xyz');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(2);
      });
    });

    describe('applyRemise', () => {
      test('should apply discount correctly', () => {
        const result = remiseService.applyRemise(100, 10);
        expect(result.prixFinal).toBe(90);
        expect(result.montantRemise).toBe(10);
      });

      test('should handle 0% discount', () => {
        const result = remiseService.applyRemise(100, 0);
        expect(result.prixFinal).toBe(100);
        expect(result.montantRemise).toBe(0);
      });

      test('should handle 100% discount', () => {
        const result = remiseService.applyRemise(100, 100);
        expect(result.prixFinal).toBe(0);
        expect(result.montantRemise).toBe(100);
      });

      test('should throw error for invalid parameters', () => {
        expect(() => {
          remiseService.applyRemise(-10, 10);
        }).toThrow();
      });
    });

    describe('calculateRemiseAmount', () => {
      test('should calculate discount amount correctly', () => {
        const amount = remiseService.calculateRemiseAmount(100, 10);
        expect(amount).toBe(10);
      });

      test('should throw error for invalid parameters', () => {
        expect(() => {
          remiseService.calculateRemiseAmount(-10, 10);
        }).toThrow();
      });
    });

    describe('applyRemiseFixe', () => {
      test('should apply fixed discount correctly', () => {
        const result = remiseService.applyRemiseFixe(100, 10);
        expect(result.prixFinal).toBe(90);
        expect(result.pourcentage).toBe(10);
      });

      test('should handle 0 discount', () => {
        const result = remiseService.applyRemiseFixe(100, 0);
        expect(result.prixFinal).toBe(100);
        expect(result.pourcentage).toBe(0);
      });

      test('should throw error for negative price', () => {
        expect(() => {
          remiseService.applyRemiseFixe(-10, 5);
        }).toThrow();
      });

      test('should throw error for negative discount', () => {
        expect(() => {
          remiseService.applyRemiseFixe(100, -5);
        }).toThrow();
      });

      test('should throw error for discount greater than price', () => {
        expect(() => {
          remiseService.applyRemiseFixe(100, 150);
        }).toThrow();
      });

      test('should throw error for non-numeric values', () => {
        expect(() => {
          remiseService.applyRemiseFixe('abc', 10);
        }).toThrow();
      });

      test('should handle zero price with zero discount', () => {
        const result = remiseService.applyRemiseFixe(0, 0);
        expect(result.prixFinal).toBe(0);
        expect(result.pourcentage).toBe(0);
      });
    });

    describe('calculatePrixOriginal', () => {
      test('should calculate original price correctly', () => {
        const result = remiseService.calculatePrixOriginal(90, 10);
        expect(result.prixInitial).toBe(100);
        expect(result.montantRemise).toBe(10);
      });

      test('should handle 0% discount', () => {
        const result = remiseService.calculatePrixOriginal(100, 0);
        expect(result.prixInitial).toBe(100);
        expect(result.montantRemise).toBe(0);
      });

      test('should throw error for negative final price', () => {
        expect(() => {
          remiseService.calculatePrixOriginal(-10, 10);
        }).toThrow();
      });

      test('should throw error for negative percentage', () => {
        expect(() => {
          remiseService.calculatePrixOriginal(90, -5);
        }).toThrow();
      });

      test('should throw error for percentage of 100% or more', () => {
        expect(() => {
          remiseService.calculatePrixOriginal(0, 100);
        }).toThrow();
      });

      test('should throw error for non-numeric values', () => {
        expect(() => {
          remiseService.calculatePrixOriginal('abc', 10);
        }).toThrow();
      });
    });
  });
});