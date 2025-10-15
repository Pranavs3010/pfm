const express = require("express");
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken,
  syncTransactions,
  removeAccount,
} = require("../controllers/plaidController");
const { protect } = require("../middleware/auth");

router.post("/create_link_token", protect, createLinkToken);
router.post("/exchange_public_token", protect, exchangePublicToken);
router.post("/sync/:accountId", protect, syncTransactions);
router.delete("/remove/:accountId", protect, removeAccount);

module.exports = router;
