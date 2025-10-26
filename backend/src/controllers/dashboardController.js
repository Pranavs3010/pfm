const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const moment = require("moment");
const mongoose = require("mongoose");

exports.getDashboardSummary = async (req, res, next) => {
  try {
    // Convert userId to ObjectId for aggregation queries
    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log("🔍 User ID:", userId);

    const currentMonth = moment().startOf("month");
    const nextMonth = moment().add(1, "month").startOf("month");
    const sixMonthsAgo = moment().subtract(6, "months").startOf("month");

    console.log("📅 Date ranges:", {
      currentMonth: currentMonth.format("YYYY-MM-DD"),
      sixMonthsAgo: sixMonthsAgo.format("YYYY-MM-DD"),
    });

    // Get total balance
    const accounts = await Account.find({ user: req.user.id, isActive: true });
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.currentBalance || 0),
      0
    );

    // Get monthly transactions (using string ID - works with find())
    const monthlyTransactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: currentMonth.toDate(), $lt: nextMonth.toDate() },
    });

    console.log("📊 Monthly transactions count:", monthlyTransactions.length);

    // CRITICAL: In Plaid, NEGATIVE amounts are income/deposits, POSITIVE amounts are expenses
    const monthlyIncome = monthlyTransactions
      .filter((t) => t.amount < 0) // Income is NEGATIVE
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.amount > 0) // Expenses are POSITIVE
      .reduce((sum, t) => sum + t.amount, 0);

    console.log("💰 Monthly income:", monthlyIncome);
    console.log("💸 Monthly expenses:", monthlyExpenses);

    const savingsRate =
      monthlyIncome > 0
        ? (((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1)
        : 0;

    // Category spending - using ObjectId for aggregation
    console.log("🔍 Running category spending aggregation...");
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId, // Use ObjectId here
          date: { $gte: currentMonth.toDate(), $lt: nextMonth.toDate() },
          amount: { $gt: 0 }, // Only expenses (positive amounts)
        },
      },
      {
        $group: {
          _id: "$primaryCategory",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    console.log("📈 Category spending:", categorySpending.length, "categories");

    // Monthly trends - using ObjectId for aggregation
    console.log("🔍 Running monthly trends aggregation...");
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: userId, // Use ObjectId here
          date: { $gte: sixMonthsAgo.toDate() },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    console.log("📅 Monthly trends:", monthlyTrends.length, "months");

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort("-date")
      .limit(10)
      .populate("account", "accountName institutionName");

    console.log("📝 Recent transactions:", recentTransactions.length);

    res.json({
      success: true,
      data: {
        summary: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          savingsRate: parseFloat(savingsRate),
        },
        categorySpending,
        monthlyTrends,
        recentTransactions,
        accounts: accounts.length,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    console.error("Stack trace:", error.stack);
    next(error);
  }
};

exports.getSpendingAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate, groupBy = "category" } = req.query;

    const query = { user: userId, amount: { $gt: 0 } }; // Only expenses

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let groupByField = "$primaryCategory";
    if (groupBy === "merchant") groupByField = "$merchantName";
    if (groupBy === "account") groupByField = "$account";

    const analytics = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupByField,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all unique categories with transaction counts and amounts
    const categories = await Transaction.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: "$primaryCategory",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          expenseAmount: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
            },
          },
          incomeAmount: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get sample transactions for each category
    const categoriesWithSamples = await Promise.all(
      categories.map(async (cat) => {
        const samples = await Transaction.find({
          user: req.user.id,
          primaryCategory: cat._id,
        })
          .limit(3)
          .select("name amount date")
          .sort("-date");

        return {
          category: cat._id,
          transactionCount: cat.count,
          totalExpenses: cat.expenseAmount,
          totalIncome: cat.incomeAmount,
          samples: samples.map((s) => ({
            name: s.name,
            amount: s.amount,
            date: s.date,
          })),
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithSamples,
    });
  } catch (error) {
    console.error("❌ Categories error:", error);
    next(error);
  }
};
