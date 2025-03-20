const { AddressService } = require('../services/AddressService');

class AddressController {
  constructor() {
    this.addressService = new AddressService();
  }

  async createAddress(req, res) {
    const addressData = await this.addressService.createAddress();
    res.status(201).json(addressData);
  }

  async getAddresses(req, res) {
    const addresses = await this.addressService.getAddresses();
    res.json(addresses);
  }

  async getTransactions(req, res) {
    const transactions = await this.addressService.getTransactions(req.params.address);
    res.json(transactions);
  }
}

module.exports = { AddressController }; 