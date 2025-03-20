```markdown
# API Dogecoin DRC-20

API sécurisée pour la génération d'adresses Dogecoin et la gestion de tokens DRC-20.

---

## 📋 Fonctionnalités

- Génération sécurisée d'adresses Dogecoin
- Chiffrement AES-256 des clés privées
- Suivi des transactions DRC-20
- Stockage via MongoDB
- Protection contre les attaques (Helmet, Rate Limiting)
- Formatage JSON standardisé

---

## 🚀 Prérequis

- Node.js v18+
- MongoDB 5.0+
- npm 9+
- Clé de chiffrement AES-256 (32 caractères hexadécimaux)

---

## ⚙️ Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/Andtit4/api_share_drc_20_token.git
   cd api_share_drc_20_token
   ```

2. **Configurer les variables d'environnement :**

   Créez un fichier `.env` à la racine du projet et ajoutez-y :

   ```env
   MONGO_URI=mongodb://localhost:27017/dogecoin-api
   ENCRYPTION_KEY=votre_clé_32_caractères_hex
   PORT=3000
   ```

3. **Installer les dépendances :**

   ```bash
   npm install
   ```

4. **Démarrer l'API :**

   ```bash
   npm start
   ```

---

## 📡 Routes API

### 1. Générer une nouvelle adresse

- **Méthode :** `POST`
- **Route :** `/api/addresses`

**Exemple d'utilisation :**

```bash
curl -X POST http://localhost:3000/api/addresses
```

**Réponse attendue :**

```json
{
  "address": "DH5z2v...Vv7T3x",
  "privateKey": "QngKt9...W3rJvP"
}
```

---

### 2. Récupérer les adresses générées

- **Méthode :** `GET`
- **Route :** `/api/addresses`

**Exemple de réponse :**

```json
[
  {
    "address": "DH5z2v...Vv7T3x",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

---

### 3. Obtenir les transactions d'une adresse

- **Méthode :** `GET`
- **Route :** `/api/addresses/:address/transactions`

**Exemple d'utilisation :**

```bash
curl http://localhost:3000/api/addresses/DH5z2v...Vv7T3x/transactions
```

**Réponse attendue :**

```json
[
  {
    "txid": "a1b2c3...x9y8z7",
    "amount": 100,
    "confirmations": 12,
    "timestamp": 1672521600,
    "drc20": false
  }
]
```

---

## 🔒 Sécurité

### Variables d'environnement

| Variable         | Description                     |
| ---------------- | ------------------------------- |
| `MONGO_URI`      | URI de connexion à MongoDB      |
| `ENCRYPTION_KEY` | Clé AES-256 (32 caractères hex) |
| `PORT`           | Port d'écoute de l'API          |

### Mesures de sécurité

- **Chiffrement AES-256-CBC** avec IV aléatoire
- **Rate limiting** : 100 requêtes toutes les 15 minutes
- **Headers de sécurité** via Helmet
- **CORS restreint**
- **Gestion centralisée des erreurs**
```

