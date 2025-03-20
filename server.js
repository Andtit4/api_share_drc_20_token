// server.js
require('express-async-errors');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { AddressController } = require('./controllers/AddressController');
const { Address } = require('./models/Address');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { transferDRC20 } = require('./controllers/transactionController');


// Configuration
const app = express();
const PORT = process.env.PORT || 3000;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

// Configuration Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de l\'API pour la gestion des adresses Dogecoin et des transactions DRC-20',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Changez cela si nécessaire
      },
    ],
  },
  apis: ['./server.js'], // Chemin vers votre fichier de routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Modèle MongoDB
mongoose.connect(process.env.MONGO_URI);

// Fonctions utilitaires
function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let [iv, encrypted] = text.split(':');
  iv = Buffer.from(iv, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Routes
const addressController = new AddressController();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Gestion des adresses Dogecoin
 */

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Créer une nouvelle adresse
 *     tags: [Addresses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: Label pour l'adresse
 *     responses:
 *       201:
 *         description: Adresse créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   description: L'adresse Dogecoin créée
 *                 privateKey:
 *                   type: string
 *                   description: La clé privée chiffrée
 *       500:
 *         description: Erreur interne du serveur
 */
app.post('/api/addresses', addressController.createAddress.bind(addressController));

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Récupérer toutes les adresses
 *     tags: [Addresses]
 *     responses:
 *       200:
 *         description: Liste des adresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     description: L'adresse Dogecoin
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date de création de l'adresse
 *       500:
 *         description: Erreur interne du serveur
 */
app.get('/api/addresses', addressController.getAddresses.bind(addressController));

/**
 * @swagger
 * /api/addresses/{address}/transactions:
 *   get:
 *     summary: Récupérer les transactions d'une adresse spécifique
 *     tags: [Addresses]
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         description: Adresse Dogecoin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   txid:
 *                     type: string
 *                     description: ID de la transaction
 *                   amount:
 *                     type: number
 *                     description: Montant de la transaction
 *                   confirmations:
 *                     type: integer
 *                     description: Nombre de confirmations
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Date et heure de la transaction
 *       404:
 *         description: Adresse non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
app.get('/api/addresses/:address/transactions', addressController.getTransactions.bind(addressController));

/**
 * @swagger
 * /api/drc20/transfer:
 *   post:
 *     summary: Transférer des DRC-20
 *     tags: [DRC20]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *                 description: Adresse d'envoi
 *               recepient:
 *                 type: string
 *                 description: Adresse de réception
 *               ticker:
 *                  type: string
 *                  description: DOGE
 *               amount:
 *                 type: number
 *                 description: Montant à transférer
 *     responses:
 *       200:
 *         description: Transfert réussi
 *       400:
 *         description: Erreur de validation des données
 *       500:
 *         description: Erreur interne du serveur
 */
app.post('/api/drc20/transfer', transferDRC20);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`API en écoute sur le port ${PORT}`);
});