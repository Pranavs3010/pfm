const express = require("express");
const router = express.Router();
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  fixBudgetPeriods,
} = require("../controllers/budgetController");
const { protect } = require("../middleware/auth");
const { validate, budgetValidation } = require("../middleware/validator");

// @route   GET api/v1/budgets
// @desc    Get all budgets for a user
// @access  Private
router.get("/", protect, getBudgets);

// @route   GET api/v1/budgets/:id
// @desc    Get a single budget by ID
// @access  Private
router.get("/:id", protect, getBudget);

// @route   POST api/v1/budgets
// @desc    Create a new budget
// @access  Private
router.post("/", protect, validate(budgetValidation), createBudget);

// @route   PUT api/v1/budgets/:id
// @desc    Update a budget
// @access  Private
router.put("/:id", protect, updateBudget);

// @route   DELETE api/v1/budgets/:id
// @desc    Delete a budget (soft delete)
// @access  Private
router.delete("/:id", protect, deleteBudget);

module.exports = router;
