const Transaction = require("../models/Transaction");
const { categorizeTransaction } = require("../utils/categoryHelper");
const logger = require("../utils/logger");

exports.syncTransactions = async (userId, accountId, plaidTransactions) => {
  try {
    const syncedTransactions = [];

    for (const plaidTxn of plaidTransactions) {
      const category = categorizeTransaction(plaidTxn.name, plaidTxn.category);

      const transactionData = {
        user: userId,
        account: accountId,
        plaidTransactionId: plaidTxn.transaction_id,
        amount: plaidTxn.amount,
        date: new Date(plaidTxn.date),
        authorizedDate: plaidTxn.authorized_date
          ? new Date(plaidTxn.authorized_date)
          : null,
        name: plaidTxn.name,
        merchantName: plaidTxn.merchant_name,
        category: plaidTxn.category || ["Uncategorized"],
        primaryCategory: category,
        pending: plaidTxn.pending,
        paymentChannel: plaidTxn.payment_channel,
        transactionType: plaidTxn.transaction_type,
        location: plaidTxn.location,
      };

      const existingTransaction = await Transaction.findOne({
        plaidTransactionId: plaidTxn.transaction_id,
      });

      if (existingTransaction) {
        await Transaction.findByIdAndUpdate(
          existingTransaction._id,
          transactionData
        );
        syncedTransactions.push(existingTransaction._id);
      } else {
        const newTransaction = await Transaction.create(transactionData);
        syncedTransactions.push(newTransaction._id);
      }
    }

    logger.info(
      `Synced ${syncedTransactions.length} transactions for user ${userId}`
    );
    return syncedTransactions;
  } catch (error) {
    logger.error(`Error syncing transactions: ${error.message}`);
    throw error;
  }
};

exports.categorizeExistingTransactions = async (userId) => {
  try {
    const transactions = await Transaction.find({ user: userId });
    let updated = 0;

    for (const transaction of transactions) {
      const newCategory = categorizeTransaction(
        transaction.name,
        transaction.category
      );
      if (newCategory !== transaction.primaryCategory) {
        transaction.primaryCategory = newCategory;
        await transaction.save();
        updated++;
      }
    }

    logger.info(`Recategorized ${updated} transactions for user ${userId}`);
    return updated;
  } catch (error) {
    logger.error(`Error categorizing transactions: ${error.message}`);
    throw error;
  }
};
