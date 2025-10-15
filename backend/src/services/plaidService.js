const plaidClient = require("../config/plaid");
const { CountryCode, Products } = require("plaid");
const logger = require("../utils/logger");

exports.createLinkToken = async (userId) => {
  try {
    const request = {
      user: {
        client_user_id: userId.toString(),
      },
      client_name: "PFM Dashboard",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    };

    const response = await plaidClient.linkTokenCreate(request);
    return response.data.link_token;
  } catch (error) {
    logger.error(`Error creating link token: ${error.message}`);
    throw error;
  }
};

exports.exchangePublicToken = async (publicToken) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  } catch (error) {
    logger.error(`Error exchanging public token: ${error.message}`);
    throw error;
  }
};

exports.getAccounts = async (accessToken) => {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    return response.data.accounts;
  } catch (error) {
    logger.error(`Error fetching accounts: ${error.message}`);
    throw error;
  }
};

exports.getTransactions = async (accessToken, startDate, endDate) => {
  try {
    const request = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 500,
        offset: 0,
      },
    };

    const response = await plaidClient.transactionsGet(request);
    let transactions = response.data.transactions;

    // Handle pagination
    const totalTransactions = response.data.total_transactions;
    while (transactions.length < totalTransactions) {
      const paginatedRequest = {
        ...request,
        options: {
          count: 500,
          offset: transactions.length,
        },
      };
      const paginatedResponse = await plaidClient.transactionsGet(
        paginatedRequest
      );
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    return transactions;
  } catch (error) {
    logger.error(`Error fetching transactions: ${error.message}`);
    throw error;
  }
};

exports.getInstitution = async (institutionId) => {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });
    return response.data.institution;
  } catch (error) {
    logger.error(`Error fetching institution: ${error.message}`);
    throw error;
  }
};

exports.removeItem = async (accessToken) => {
  try {
    await plaidClient.itemRemove({
      access_token: accessToken,
    });
    return true;
  } catch (error) {
    logger.error(`Error removing item: ${error.message}`);
    throw error;
  }
};
