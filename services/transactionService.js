// services/transactionService.js
const { Psbt } = require('bitcoinjs-lib');
const BN = require('bn.js');
const axios = require('axios');
const network = require('../config/network');
const Address = require('../models/Address');
const encryptionService = require('./encryptionService');
const { ECPairFactory } = require('ecpair');
const tinysecp = require('tiny-secp256k1');

const ECPair = ECPairFactory(tinysecp);

module.exports = {
  async transferDRC20({ senderAddress, recipientAddress, ticker, amount }) {
    // 1. Récupération clé privée
    const sender = await Address.findOne({ address: senderAddress });
    if (!sender) throw new Error('Adresse expéditeur introuvable');
    
    const privateKey = encryptionService.decrypt(sender.encryptedPrivateKey);
    const keyPair = ECPair.fromWIF(privateKey, network.dogecoin);

    // 2. Récupération UTXO
    const { data: utxoData } = await axios.get(
      `${network.apiEndpoints.dogechain}/address/unspent/${senderAddress}`
    );
    
    if (!utxoData.unspent_outputs?.length) {
      throw new Error('Aucun UTXO disponible');
    }

    // 3. Construction inscription DRC-20
    const inscriptionData = Buffer.from(JSON.stringify({
      p: "drc-20",
      op: "transfer",
      tick: ticker,
      amt: amount.toString()
    }));

    const drc20Script = [
      bitcoin.opcodes.OP_RETURN,
      Buffer.from("ord", "utf8"), // Protocole Ordinals
      Buffer.from([1]), // Envelope version
      Buffer.from("text/plain;charset=utf-8", "utf8"),
      inscriptionData
    ];

    // 4. Configuration PSBT
    const psbt = new Psbt({ network: network.dogecoin });
    const feePerByte = 1000; // 1000 satoshis/byte (ajustable)
    
    // Ajout des inputs
    utxoData.unspent_outputs.forEach(utxo => {
      psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n,
        witnessUtxo: {
          script: Buffer.from(utxo.script, "hex"),
          value: utxo.value
        }
      });
    });

    // Ajout des outputs
    psbt.addOutput({
      script: bitcoin.script.compile(drc20Script),
      value: 0
    });

    psbt.addOutput({
      address: recipientAddress,
      value: 1000 // Minimum 1 DOGE
    });

    // 5. Calcul des frais dynamiques
    const txVirtualSize = psbt.extractTransaction().virtualSize();
    const totalFee = txVirtualSize * feePerByte;
    const totalInput = utxoData.unspent_outputs.reduce((sum, utxo) => sum + utxo.value, 0);
    
    if (totalInput < totalFee + 1000) {
      throw new Error(`Fonds insuffisants. Nécessaire: ${totalFee + 1000} satoshis`);
    }

    psbt.addOutput({
      address: senderAddress, // Change
      value: totalInput - totalFee - 1000
    });

    // 6. Signature
    psbt.signAllInputs(keyPair);
    psbt.validateSignaturesOfAllInputs();
    psbt.finalizeAllInputs();

    // 7. Diffusion
    const { data } = await axios.post(
      `${network.apiEndpoints.dogechain}/send_tx`,
      { tx: psbt.extractTransaction().toHex() }
    );

    return {
      txid: data.txid,
      explorer: `https://dogechain.info/tx/${data.txid}`,
      inscriptionId: `${data.txid}i0`
    };
  }
};