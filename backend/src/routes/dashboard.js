const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getSpendingAnalytics,
  getCategories, // Add this to the imports
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.get("/summary", protect, getDashboardSummary);
router.get("/analytics", protect, getSpendingAnalytics);
router.get("/categories", protect, getCategories); // Add this route

module.exports = router;
