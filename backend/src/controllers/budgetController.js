const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const {
  calculateBudgetPeriod,
  calculateBudgetUtilization,
} = require("../utils/budgetHelper");
const moment = require("moment");

exports.getBudgets = async (req, res, next) => {
  try {
    console.log("🔍 Fetching budgets for user:", req.user.id);

    const budgets = await Budget.find({
      user: req.user.id,
      isActive: true,
    }).sort("-createdAt");

    console.log("📊 Found budgets:", budgets.length);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpent(req.user.id, budget);
        const utilization = calculateBudgetUtilization(spent, budget.limit);

        console.log(
          `💰 Budget "${budget.category}": spent=$${spent}, limit=$${budget.limit}, utilization=${utilization}%`
        );

        return {
          ...budget.toObject(),
          spent,
          remaining: budget.limit - spent,
          utilization,
        };
      })
    );

    res.json({
      success: true,
      count: budgetsWithSpending.length,
      data: budgetsWithSpending,
    });
  } catch (error) {
    console.error("❌ Budget fetch error:", error);
    next(error);
  }
};

exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const spent = await calculateSpent(req.user.id, budget);
    const utilization = calculateBudgetUtilization(spent, budget.limit);

    res.json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        remaining: budget.limit - spent,
        utilization,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { category, limit, period, alertThreshold } = req.body;

    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      period,
      isActive: true,
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this category and period",
      });
    }

    const { startDate, endDate } = calculateBudgetPeriod(period);

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      period,
      startDate,
      endDate,
      alertThreshold: alertThreshold || 80,
    });

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const { limit, alertThreshold, notificationsEnabled } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    if (limit) budget.limit = limit;
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
    if (notificationsEnabled !== undefined)
      budget.notificationsEnabled = notificationsEnabled;

    await budget.save();

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    budget.isActive = false;
    await budget.save();

    res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// NEW: Fix budget periods to start from beginning of month
exports.fixBudgetPeriods = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
      isActive: true,
    });

    console.log(`🔧 Fixing ${budgets.length} budgets...`);

    let fixed = 0;
    for (const budget of budgets) {
      const { startDate, endDate } = calculateBudgetPeriod(budget.period);

      console.log(`Budget "${budget.category}":`);
      console.log(`  Old period: ${budget.startDate} to ${budget.endDate}`);
      console.log(`  New period: ${startDate} to ${endDate}`);

      budget.startDate = startDate;
      budget.endDate = endDate;
      await budget.save();
      fixed++;
    }

    res.json({
      success: true,
      message: `Fixed ${fixed} budget periods`,
      data: budgets.map((b) => ({
        category: b.category,
        startDate: b.startDate,
        endDate: b.endDate,
      })),
    });
  } catch (error) {
    console.error("❌ Fix budgets error:", error);
    next(error);
  }
};

// CRITICAL FIX: Calculate spent amount correctly
async function calculateSpent(userId, budget) {
  try {
    console.log("\n=== BUDGET CALCULATION DEBUG ===");
    console.log("Budget Category:", budget.category);
    console.log(
      "Budget Period:",
      moment(budget.startDate).format("YYYY-MM-DD"),
      "to",
      moment(budget.endDate || new Date()).format("YYYY-MM-DD")
    );
    console.log("User ID:", userId);

    // Get all transactions in the period for this user
    const allTransactionsInPeriod = await Transaction.find({
      user: userId,
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate || new Date(),
      },
    }).select("name primaryCategory amount date");

    console.log(
      `\n📊 Total transactions in period: ${allTransactionsInPeriod.length}`
    );

    // Filter for expenses only (positive amounts) in this category
    const matchingTransactions = allTransactionsInPeriod.filter(
      (t) => t.primaryCategory === budget.category && t.amount > 0
    );

    console.log(
      `\n🎯 Matching "${budget.category}" expenses: ${matchingTransactions.length}`
    );
    matchingTransactions.forEach((t) => {
      console.log(
        `  - ${t.name}: $${t.amount} (category: ${t.primaryCategory})`
      );
    });

    // Calculate total
    const spent = matchingTransactions.reduce((sum, t) => sum + t.amount, 0);

    console.log(`\n💰 TOTAL SPENT: $${spent.toFixed(2)}`);
    console.log("================================\n");

    return spent;
  } catch (error) {
    console.error("❌ Error calculating spent:", error);
    return 0;
  }
}

module.exports = {
  getBudgets: exports.getBudgets,
  getBudget: exports.getBudget,
  createBudget: exports.createBudget,
  updateBudget: exports.updateBudget,
  deleteBudget: exports.deleteBudget,
};
