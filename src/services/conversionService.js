const EXCHANGE_RATES = {
    'EUR_USD': 1.1,
    'USD_GBP': 0.8,
    'USD_EUR': 1 / 1.1, // Inverse de EUR_USD
    'GBP_USD': 1 / 0.8, // Inverse de USD_GBP
    'EUR_GBP': 1.1 * 0.8, // EUR -> USD -> GBP
    'GBP_EUR': 1 / (1.1 * 0.8) // Inverse de EUR_GBP
};

/**
 * Valide les paramètres de conversion
 * @param {string} from - Devise source
 * @param {string} to - Devise cible
 * @param {number} amount - Montant à convertir
 * @returns {Object} Résultat de la validation
 */
function validateConversionParams(from, to, amount) {
    const errors = [];

    // Vérification des devises supportées
    const supportedCurrencies = ['EUR', 'USD', 'GBP'];

    if (!from || !supportedCurrencies.includes(from.toUpperCase())) {
        errors.push('Devise source invalide. Devises supportées: EUR, USD, GBP');
    }

    if (!to || !supportedCurrencies.includes(to.toUpperCase())) {
        errors.push('Devise cible invalide. Devises supportées: EUR, USD, GBP');
    }

    // Vérification du montant
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        errors.push('Le montant doit être un nombre positif');
    }

    return {
        isValid: errors.length === 0,
        errors,
        amount: numAmount
    };
}

/**
 * Obtient le taux de conversion entre deux devises
 * @param {string} from - Devise source
 * @param {string} to - Devise cible
 * @returns {number} Taux de conversion
 */
function getExchangeRate(from, to) {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    // Même devise
    if (fromUpper === toUpper) {
        return 1;
    }

    const rateKey = `${fromUpper}_${toUpper}`;
    const rate = EXCHANGE_RATES[rateKey];

    if (!rate) {
        throw new Error(`Taux de conversion non disponible pour ${fromUpper} vers ${toUpper}`);
    }

    return rate;
}

/**
 * Convertit un montant d'une devise à une autre
 * @param {string} from - Devise source
 * @param {string} to - Devise cible
 * @param {number} amount - Montant à convertir
 * @returns {Object} Résultat de la conversion
 */
function convertCurrency(from, to, amount) {
    // Validation des paramètres
    const validation = validateConversionParams(from, to, amount);
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
    }

    // Conversion
    const rate = getExchangeRate(from, to);
    const convertedAmount = Math.round(validation.amount * rate * 100) / 100; // Arrondi à 2 décimales

    return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        originalAmount: validation.amount,
        convertedAmount,
        rate
    };
}

/**
 * Obtient tous les taux de conversion disponibles
 * @returns {Object} Taux de conversion
 */
function getAllExchangeRates() {
    return { ...EXCHANGE_RATES };
}

module.exports = {
    convertCurrency,
    getExchangeRate,
    getAllExchangeRates,
    validateConversionParams
};