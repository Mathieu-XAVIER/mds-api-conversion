/**
 * Valide les paramètres de calcul TVA
 * @param {number} ht - Montant hors taxes
 * @param {number} taux - Taux de TVA en pourcentage
 * @returns {Object} Résultat de la validation
 */
function validateTvaParams(ht, taux) {
    const errors = [];

    // Vérification du montant HT
    const numHt = parseFloat(ht);
    if (isNaN(numHt) || numHt < 0) {
        errors.push('Le montant HT doit être un nombre positif ou nul');
    }

    // Vérification du taux de TVA
    const numTaux = parseFloat(taux);
    if (isNaN(numTaux) || numTaux < 0 || numTaux > 100) {
        errors.push('Le taux de TVA doit être un nombre entre 0 et 100');
    }

    return {
        isValid: errors.length === 0,
        errors,
        ht: numHt,
        taux: numTaux
    };
}

/**
 * Calcule le montant TTC à partir du montant HT et du taux de TVA
 * @param {number} ht - Montant hors taxes
 * @param {number} taux - Taux de TVA en pourcentage
 * @returns {Object} Résultat du calcul
 */
function calculateTTC(ht, taux) {
    // Validation des paramètres
    const validation = validateTvaParams(ht, taux);
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
    }

    // Calcul du montant TTC
    const montantTva = (validation.ht * validation.taux) / 100;
    const ttc = validation.ht + montantTva;

    return {
        ht: validation.ht,
        taux: validation.taux,
        montantTva: Math.round(montantTva * 100) / 100, // Arrondi à 2 décimales
        ttc: Math.round(ttc * 100) / 100 // Arrondi à 2 décimales
    };
}

/**
 * Calcule le montant HT à partir du montant TTC et du taux de TVA
 * @param {number} ttc - Montant toutes taxes comprises
 * @param {number} taux - Taux de TVA en pourcentage
 * @returns {Object} Résultat du calcul
 */
function calculateHT(ttc, taux) {
    const errors = [];

    // Vérification du montant TTC
    const numTtc = parseFloat(ttc);
    if (isNaN(numTtc) || numTtc < 0) {
        errors.push('Le montant TTC doit être un nombre positif ou nul');
    }

    // Vérification du taux de TVA
    const numTaux = parseFloat(taux);
    if (isNaN(numTaux) || numTaux < 0 || numTaux > 100) {
        errors.push('Le taux de TVA doit être un nombre entre 0 et 100');
    }

    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    // Calcul du montant HT
    const ht = numTtc / (1 + numTaux / 100);
    const montantTva = numTtc - ht;

    return {
        ttc: numTtc,
        taux: numTaux,
        montantTva: Math.round(montantTva * 100) / 100,
        ht: Math.round(ht * 100) / 100
    };
}

/**
 * Calcule le montant de TVA uniquement
 * @param {number} ht - Montant hors taxes
 * @param {number} taux - Taux de TVA en pourcentage
 * @returns {number} Montant de la TVA
 */
function calculateTvaAmount(ht, taux) {
    const validation = validateTvaParams(ht, taux);
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
    }

    const montantTva = (validation.ht * validation.taux) / 100;
    return Math.round(montantTva * 100) / 100;
}

/**
 * Obtient les taux de TVA courants (France)
 * @returns {Object} Taux de TVA standards
 */
function getStandardTvaRates() {
    return {
        normal: 20,
        intermediaire: 10,
        reduit: 5.5,
        particulier: 2.1
    };
}

module.exports = {
    calculateTTC,
    calculateHT,
    calculateTvaAmount,
    getStandardTvaRates,
    validateTvaParams
};