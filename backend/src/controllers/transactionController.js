const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const { categorizeTransaction } = require("../utils/categoryHelper");
const moment = require("moment");

exports.getTransactions = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      category,
      accountId,
      page = 1,
      limit = 50,
      sort = "-date",
    } = req.query;

    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (category) {
      query.primaryCategory = category;
    }

    if (accountId) {
      query.account = accountId;
    }

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate("account", "accountName institutionName");

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("account", "accountName institutionName");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { accountId, amount, date, name, category, notes } = req.body;

    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const primaryCategory = categorizeTransaction(name, [category]);

    const transaction = await Transaction.create({
      user: req.user.id,
      account: accountId,
      amount,
      date,
      name,
      primaryCategory,
      category: [category],
      notes,
      isManual: true,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { amount, date, name, category, notes } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (amount) transaction.amount = amount;
    if (date) transaction.date = date;
    if (name) transaction.name = name;
    if (category) {
      transaction.category = [category];
      transaction.primaryCategory = categorizeTransaction(
        name || transaction.name,
        [category]
      );
    }
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (!transaction.isManual) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete synced transactions",
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
