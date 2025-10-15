const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({
      user: req.user.id,
      isActive: true,
    }).select("-accessToken");

    res.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).select("-accessToken");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const { accountName } = req.body;

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { accountName },
      { new: true, runValidators: true }
    ).select("-accessToken");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAccountBalance = async (req, res, next) => {
  try {
    const accounts = await Account.find({
      user: req.user.id,
      isActive: true,
    }).select("accountName currentBalance availableBalance accountType");

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.currentBalance || 0),
      0
    );
    const totalAvailable = accounts.reduce(
      (sum, acc) => sum + (acc.availableBalance || 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalBalance,
        totalAvailable,
        accounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
