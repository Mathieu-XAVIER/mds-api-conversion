const express = require('express');
const cors = require('cors');
const {
    convertController,
    tvaController,
    remiseController,
    healthController,
    notFoundController,
    errorHandler
} = require('./controllers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Query: ${JSON.stringify(req.query)}`);
    next();
});

app.get('/', healthController);
app.get('/convert', convertController);
app.get('/tva', tvaController);
app.get('/remise', remiseController);

app.use(notFoundController);

app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}`);
        console.log(`📝 Documentation disponible sur http://localhost:${PORT}/`);
        console.log(`🔄 Conversion: http://localhost:${PORT}/convert?from=EUR&to=USD&amount=100`);
        console.log(`💰 TVA: http://localhost:${PORT}/tva?ht=100&taux=20`);
        console.log(`💸 Remise: http://localhost:${PORT}/remise?prix=100&pourcentage=10`);
    });
}

module.exports = app;