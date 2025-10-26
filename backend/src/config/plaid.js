const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET; 


const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

module.exports = plaidClient;
