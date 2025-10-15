const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const {
  calculateBudgetPeriod,
  calculateBudgetUtilization,
} = require("../utils/budgetHelper");
const moment = require("moment");

exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
      isActive: true,
    }).sort("-createdAt");

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpent(req.user.id, budget);
        const utilization = calculateBudgetUtilization(spent, budget.limit);

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

async function calculateSpent(userId, budget) {
  const query = {
    user: userId,
    primaryCategory: budget.category,
    amount: { $gt: 0 },
    date: {
      $gte: budget.startDate,
      $lte: budget.endDate || new Date(),
    },
  };

  const result = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
}
