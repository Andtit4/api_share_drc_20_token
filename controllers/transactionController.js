// controllers/transactionController.js
const transactionService = require('../services/transactionService');
const { validateDRC20Transfer } = require('../middlewares/validation');

module.exports = {
  transferDRC20: [
    validateDRC20Transfer,
    async (req, res) => {
      try {
        const { sender, recipient, ticker, amount } = req.body;
        
        const result = await transactionService.transferDRC20({
          senderAddress: sender,
          recipientAddress: recipient,
          ticker: ticker.toUpperCase(),
          amount: Number(amount)
        });

        res.json({
          success: true,
          data: result
        });

      } catch (error) {
        console.error('[Transaction Error]', error);
        res.status(500).json({
          success: false,
          error: error.message,
          details: error.response?.data || null
        });
      }
    }
  ]
};