const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  address: String,
  encryptedPrivateKey: String,
  createdAt: { type: Date, default: Date.now }
});

// Vérifiez si le modèle existe déjà pour éviter l'erreur de redéfinition
const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);

module.exports = { Address }; 