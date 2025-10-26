const Account = require("../models/Account");
const plaidService = require("../services/plaidService");
const transactionService = require("../services/transactionService");
const logger = require("../utils/logger");
const moment = require("moment");
 
exports.createLinkToken = async (req, res, next) => {
  try {
    console.log("=== PLAID DEBUG ===");
    console.log("User ID:", req.user.id);
    console.log(
      "Plaid Client ID:",
      process.env.PLAID_CLIENT_ID ? "Set" : "Missing"
    );
    console.log("Plaid Secret:", process.env.PLAID_SECRET ? "Set" : "Missing");
    console.log("Plaid Env:", process.env.PLAID_ENV);

    const linkToken = await plaidService.createLinkToken(req.user.id);

    console.log("Link Token Created:", linkToken ? "YES" : "NO");
    console.log("Link Token Value:", linkToken);
    console.log("=== END DEBUG ===");

    res.json({
      success: true,
      linkToken: linkToken, // Add this for compatibility
      data: {
        linkToken: linkToken,
      },
    });
  } catch (error) {
    console.error(" Plaid Controller Error:", error.message);
    console.error("Full error:", error);

    // Return a more detailed error
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create link token",
      error:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
};

exports.exchangePublicToken = async (req, res, next) => {
  try {
    const { publicToken, institutionId, institutionName } = req.body;

    console.log(" Exchanging public token...");
    console.log("Institution:", institutionName);

    const { accessToken, itemId } = await plaidService.exchangePublicToken(
      publicToken
    );

    console.log(" Access token received");

    const plaidAccounts = await plaidService.getAccounts(accessToken);
    console.log(` Found ${plaidAccounts.length} accounts`);

    const accounts = [];
    for (const plaidAccount of plaidAccounts) {
      const account = await Account.create({
        user: req.user.id,
        plaidAccountId: plaidAccount.account_id,
        plaidItemId: itemId,
        accessToken: accessToken,
        institutionId: institutionId,
        institutionName: institutionName,
        accountName: plaidAccount.name,
        officialName: plaidAccount.official_name,
        accountType: plaidAccount.type,
        accountSubtype: plaidAccount.subtype,
        currentBalance: plaidAccount.balances.current,
        availableBalance: plaidAccount.balances.available,
        limit: plaidAccount.balances.limit,
        currency: plaidAccount.balances.iso_currency_code || "USD",
        mask: plaidAccount.mask,
      });

      accounts.push(account);
    }

    // Sync initial transactions (last 30 days)
    const endDate = moment().format("YYYY-MM-DD");
    const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");

    console.log(` Syncing transactions from ${startDate} to ${endDate}`);

    for (const account of accounts) {
      try {
        const plaidTransactions = await plaidService.getTransactions(
          accessToken,
          startDate,
          endDate
        );

        const accountTransactions = plaidTransactions.filter(
          (txn) => txn.account_id === account.plaidAccountId
        );

        await transactionService.syncTransactions(
          req.user.id,
          account._id,
          accountTransactions
        );

        console.log(
          ` Synced ${accountTransactions.length} transactions for ${account.accountName}`
        );
      } catch (syncError) {
        console.error(
          ` Failed to sync transactions for account ${account.accountName}:`,
          syncError.message
        );
        // Continue with other accounts even if one fails
      }
    }

    logger.info(
      `Connected ${accounts.length} accounts for user ${req.user.email}`
    );

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error(" Exchange token error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to exchange token",
    });
  }
};

exports.syncTransactions = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id,
    }).select("+accessToken");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const endDate = moment().format("YYYY-MM-DD");
    const startDate = moment(account.lastSynced).format("YYYY-MM-DD");

    console.log(` Syncing account ${account.accountName}`);

    const plaidTransactions = await plaidService.getTransactions(
      account.accessToken,
      startDate,
      endDate
    );

    const accountTransactions = plaidTransactions.filter(
      (txn) => txn.account_id === account.plaidAccountId
    );

    const syncedIds = await transactionService.syncTransactions(
      req.user.id,
      account._id,
      accountTransactions
    );

    account.lastSynced = new Date();
    await account.save();

    console.log(` Synced ${syncedIds.length} transactions`);

    res.json({
      success: true,
      data: {
        synced: syncedIds.length,
        lastSynced: account.lastSynced,
      },
    });
  } catch (error) {
    console.error(" Sync error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sync transactions",
    });
  }
};

exports.removeAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id,
    }).select("+accessToken");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    await plaidService.removeItem(account.accessToken);

    account.isActive = false;
    await account.save();

    logger.info(`Removed account ${accountId} for user ${req.user.email}`);

    res.json({
      success: true,
      message: "Account removed successfully",
    });
  } catch (error) {
    console.error(" Remove account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove account",
    });
  }
};
