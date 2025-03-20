const { Address } = require('../models/Address');
const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');
const { ECPairFactory } = require('ecpair');
const tinysecp = require('tiny-secp256k1');
const ECPair = ECPairFactory(tinysecp);

// Exemple de génération d'une clé de 32 octets
const ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

// Configuration Dogecoin
const dogecoinNetwork = {
    messagePrefix: '\x19Dogecoin Signed Message:\n',
    bech32: 'doge',
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398,
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
  };

class AddressService {
    
  async createAddress() {
    // const keyPair = bitcoin.ECPair.makeRandom({ network: dogecoinNetwork });
    const keyPair = ECPair.makeRandom({ network: dogecoinNetwork });
    // const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: dogecoinNetwork });
    const { address } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: dogecoinNetwork
      });
      
    const encryptedPrivateKey = this.encrypt(keyPair.toWIF());

    await Address.create({
      address: address,
      encryptedPrivateKey: encryptedPrivateKey
    });

    return { address: address, privateKey: keyPair.toWIF() };
  }

  async getAddresses() {
    return await Address.find().select('-__v -_id');
  }

  async getTransactions(address) {
    const response = await axios.get(`https://dogechain.info/api/v1/address/transactions/${address}`);
    const transactions = response.data.transactions.map(tx => ({
      txid: tx.txid,
      amount: tx.value,
      confirmations: tx.confirmations,
      timestamp: tx.time,
    }));

    transactions.forEach(tx => {
      tx.drc20 = tx.amount === 0 && tx.vout.includes('OP_RETURN');
    });

    return transactions;
  }

  encrypt(text) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(text) {
    let [iv, encrypted] = text.split(':');
    iv = Buffer.from(iv, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

module.exports = { AddressService }; 