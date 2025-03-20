// middlewares/validation.js
const DOGECOIN_ADDRESS_REGEX = /^D[a-km-zA-HJ-NP-Z1-9]{33}$/;
const ALLOWED_TICKERS = ['DOGE', 'DRC']; // Exemple de tickers autorisés

module.exports = {
  validateDRC20Transfer: (req, res, next) => {
    const errors = [];
    const { sender, recipient, ticker, amount } = req.body;

    // Validation de l'adresse expéditeur
    if (!sender || !DOGECOIN_ADDRESS_REGEX.test(sender)) {
      errors.push('Adresse expéditeur invalide');
    }

    // Validation de l'adresse destinataire
    if (!recipient || !DOGECOIN_ADDRESS_REGEX.test(recipient)) {
      errors.push('Adresse destinataire invalide');
    }

    // Validation du ticker
    if (!ticker || !ALLOWED_TICKERS.includes(ticker.toUpperCase())) {
      errors.push(`Ticker invalide. Autorisés: ${ALLOWED_TICKERS.join(', ')}`);
    }

    // Validation du montant
    if (isNaN(amount) || amount <= 0 || amount > 1000000) {
      errors.push('Montant invalide (doit être entre 1 et 1,000,000)');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  }
};