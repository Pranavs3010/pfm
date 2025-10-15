const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Budget = require("../models/Budget");
const moment = require("moment");

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentMonth = moment().startOf("month");
    const nextMonth = moment().add(1, "month").startOf("month");

    // Get total balance
    const accounts = await Account.find({ user: userId, isActive: true });
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.currentBalance || 0),
      0
    );

    // Get monthly transactions
    const monthlyTransactions = await Transaction.find({
      user: userId,
      date: { $gte: currentMonth.toDate(), $lt: nextMonth.toDate() },
    });

    console.log("Monthly transactions count:", monthlyTransactions.length);
    console.log("Sample transactions:", monthlyTransactions.slice(0, 3));

    // FIXED: Correct income/expense calculation
    const monthlyIncome = monthlyTransactions
      .filter((t) => t.amount < 0) // Income is negative in Plaid
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.amount > 0) // Expenses are positive in Plaid
      .reduce((sum, t) => sum + t.amount, 0);

    console.log("Monthly income calculation:", monthlyIncome);
    console.log("Monthly expenses calculation:", monthlyExpenses);

    const savingsRate =
      monthlyIncome > 0
        ? (((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1)
        : 0;

    // Spending by category
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
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

    console.log("Category spending result:", categorySpending);

    // Income vs Expenses (last 6 months)
    const sixMonthsAgo = moment().subtract(6, "months").startOf("month");
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
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

    console.log("Monthly trends result:", monthlyTrends);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort("-date")
      .limit(10)
      .populate("account", "accountName institutionName");

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
    console.error("Dashboard error:", error);
    next(error);
  }
};

exports.getSpendingAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = "category" } = req.query;

    const query = { user: req.user.id, amount: { $gt: 0 } };

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
