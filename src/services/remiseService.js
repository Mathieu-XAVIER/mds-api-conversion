/**
 * Valide les paramètres de calcul de remise
 * @param {number} prix - Prix initial
 * @param {number} pourcentage - Pourcentage de remise
 * @returns {Object} Résultat de la validation
 */
function validateRemiseParams(prix, pourcentage) {
    const errors = [];

    const numPrix = parseFloat(prix);
    if (isNaN(numPrix) || numPrix < 0) {
        errors.push('Le prix doit être un nombre positif ou nul');
    }

    const numPourcentage = parseFloat(pourcentage);
    if (isNaN(numPourcentage) || numPourcentage < 0 || numPourcentage > 100) {
        errors.push('Le pourcentage de remise doit être un nombre entre 0 et 100');
    }

    return {
        isValid: errors.length === 0,
        errors,
        prix: numPrix,
        pourcentage: numPourcentage
    };
}

/**
 * Applique une remise en pourcentage sur un prix
 * @param {number} prix - Prix initial
 * @param {number} pourcentage - Pourcentage de remise
 * @returns {Object} Résultat du calcul
 */
function applyRemise(prix, pourcentage) {
    const validation = validateRemiseParams(prix, pourcentage);
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
    }

    const montantRemise = (validation.prix * validation.pourcentage) / 100;
    const prixFinal = validation.prix - montantRemise;

    return {
        prixInitial: validation.prix,
        pourcentage: validation.pourcentage,
        montantRemise: Math.round(montantRemise * 100) / 100,
        prixFinal: Math.round(prixFinal * 100) / 100
    };
}

/**
 * Calcule le montant de remise sans appliquer la remise
 * @param {number} prix - Prix initial
 * @param {number} pourcentage - Pourcentage de remise
 * @returns {number} Montant de la remise
 */
function calculateRemiseAmount(prix, pourcentage) {
    const validation = validateRemiseParams(prix, pourcentage);
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
    }

    const montantRemise = (validation.prix * validation.pourcentage) / 100;
    return Math.round(montantRemise * 100) / 100;
}

/**
 * Applique une remise en montant fixe sur un prix
 * @param {number} prix - Prix initial
 * @param {number} montant - Montant de la remise
 * @returns {Object} Résultat du calcul
 */
function applyRemiseFixe(prix, montant) {
    const errors = [];

    const numPrix = parseFloat(prix);
    if (isNaN(numPrix) || numPrix < 0) {
        errors.push('Le prix doit être un nombre positif ou nul');
    }

    const numMontant = parseFloat(montant);
    if (isNaN(numMontant) || numMontant < 0) {
        errors.push('Le montant de remise doit être un nombre positif ou nul');
    }

    if (numMontant > numPrix) {
        errors.push('Le montant de remise ne peut pas être supérieur au prix initial');
    }

    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    const prixFinal = numPrix - numMontant;
    const pourcentage = numPrix > 0 ? (numMontant / numPrix) * 100 : 0;

    return {
        prixInitial: numPrix,
        montantRemise: numMontant,
        pourcentage: Math.round(pourcentage * 100) / 100,
        prixFinal: Math.round(prixFinal * 100) / 100
    };
}

/**
 * Calcule le prix original à partir du prix final et du pourcentage de remise
 * @param {number} prixFinal - Prix après remise
 * @param {number} pourcentage - Pourcentage de remise appliqué
 * @returns {Object} Résultat du calcul
 */
function calculatePrixOriginal(prixFinal, pourcentage) {
    const errors = [];

    const numPrixFinal = parseFloat(prixFinal);
    if (isNaN(numPrixFinal) || numPrixFinal < 0) {
        errors.push('Le prix final doit être un nombre positif ou nul');
    }

    const numPourcentage = parseFloat(pourcentage);
    if (isNaN(numPourcentage) || numPourcentage < 0 || numPourcentage >= 100) {
        errors.push('Le pourcentage de remise doit être un nombre entre 0 et 99.99');
    }

    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    const prixInitial = numPrixFinal / (1 - numPourcentage / 100);
    const montantRemise = prixInitial - numPrixFinal;

    return {
        prixFinal: numPrixFinal,
        pourcentage: numPourcentage,
        prixInitial: Math.round(prixInitial * 100) / 100,
        montantRemise: Math.round(montantRemise * 100) / 100
    };
}

module.exports = {
    applyRemise,
    applyRemiseFixe,
    calculateRemiseAmount,
    calculatePrixOriginal,
    validateRemiseParams
};