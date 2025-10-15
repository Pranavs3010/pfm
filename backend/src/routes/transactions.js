const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const { validate, transactionValidation } = require("../middleware/validator");

router.get("/", protect, getTransactions);
router.get("/:id", protect, getTransaction);
router.post("/", protect, validate(transactionValidation), createTransaction);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

module.exports = router;
