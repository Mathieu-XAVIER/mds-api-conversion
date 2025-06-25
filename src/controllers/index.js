const conversionService = require('../services/conversionService');
const tvaService = require('../services/tvaService');
const remiseService = require('../services/remiseService');

/**
 * Controller pour la conversion de devises
 * GET /convert?from=EUR&to=USD&amount=100
 */
function convertController(req, res) {
    try {
        const {from, to, amount} = req.query;

        if (!from || !to || !amount) {
            return res.status(400).json({
                error: 'Paramètres requis manquants',
                required: ['from', 'to', 'amount'],
                received: {from, to, amount}
            });
        }

        const result = conversionService.convertCurrency(from, to, amount);

        const response = {
            from: result.from,
            to: result.to,
            originalAmount: result.originalAmount,
            convertedAmount: result.convertedAmount
        };

        res.json(response);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

/**
 * Controller pour le calcul de TVA
 * GET /tva?ht=100&taux=20
 */
function tvaController(req, res) {
    try {
        const {ht, taux} = req.query;

        if (!ht || !taux) {
            return res.status(400).json({
                error: 'Paramètres requis manquants',
                required: ['ht', 'taux'],
                received: {ht, taux}
            });
        }

        const result = tvaService.calculateTTC(ht, taux);

        const response = {
            ht: result.ht,
            taux: result.taux,
            ttc: result.ttc
        };

        res.json(response);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

/**
 * Controller pour le calcul de remise
 * GET /remise?prix=100&pourcentage=10
 */
function remiseController(req, res) {
    try {
        const {prix, pourcentage} = req.query;

        if (!prix || !pourcentage) {
            return res.status(400).json({
                error: 'Paramètres requis manquants',
                required: ['prix', 'pourcentage'],
                received: {prix, pourcentage}
            });
        }

        const result = remiseService.applyRemise(prix, pourcentage);

        const response = {
            prixInitial: result.prixInitial,
            pourcentage: result.pourcentage,
            prixFinal: result.prixFinal
        };

        res.json(response);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

/**
 * Controller pour la page d'accueil / health check
 */
function healthController(req, res) {
    res.json({
        service: 'Conversion API',
        version: '1.0.0',
        status: 'OK',
        endpoints: [
            'GET /convert?from=EUR&to=USD&amount=100',
            'GET /tva?ht=100&taux=20',
            'GET /remise?prix=100&pourcentage=10'
        ]
    });
}

/**
 * Controller pour les routes non trouvées
 */
function notFoundController(req, res) {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.path,
        method: req.method,
        availableEndpoints: [
            'GET /',
            'GET /convert',
            'GET /tva',
            'GET /remise'
        ]
    });
}

/**
 * Middleware de gestion des erreurs
 */
function errorHandler(err, req, res) {
    console.error('Erreur:', err);

    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}

module.exports = {
    convertController,
    tvaController,
    remiseController,
    healthController,
    notFoundController,
    errorHandler
};