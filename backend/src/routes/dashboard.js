const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getSpendingAnalytics,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.get("/summary", protect, getDashboardSummary);
router.get("/analytics", protect, getSpendingAnalytics);

module.exports = router;
