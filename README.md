# API Dogecoin DRC-20

API sécurisée pour la génération d'adresses Dogecoin et la gestion de tokens DRC-20

## 📋 Fonctionnalités

- Génération sécurisée d'adresses Dogecoin
- Chiffrement AES-256 des clés privées
- Suivi des transactions DRC-20
- Stockage MongoDB
- Protection contre les attaques (Helmet, Rate Limiting)
- Formatage JSON standardisé

## 🚀 Prérequis

- Node.js v18+
- MongoDB 5.0+
- npm 9+
- Clé de chiffrement AES-256

## ⚙️ Installation

1. Cloner le dépôt :
```bash
git https://github.com/Andtit4/api_share_drc_20_token.git
cd api_share_drc_20_token

## ENV
MONGO_URI=mongodb://localhost:27017/dogecoin-api
ENCRYPTION_KEY=votre_clé_32_caractères_hex
PORT=3000

##  📡 Routes API
1. Générer une nouvelle adresse
POST /api/addresses


