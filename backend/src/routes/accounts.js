const express = require("express");
const router = express.Router();
const {
  getAccounts,
  getAccount,
  updateAccount,
  getAccountBalance,
} = require("../controllers/accountController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getAccounts);
router.get("/balance", protect, getAccountBalance);
router.get("/:id", protect, getAccount);
router.put("/:id", protect, updateAccount);

module.exports = router;
