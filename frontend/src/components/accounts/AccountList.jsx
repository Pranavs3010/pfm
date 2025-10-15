import React, { useState, useEffect } from "react";
import { accountsAPI } from "../../services/api";
import {
  CreditCard,
  Building,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import PlaidLink from "./PlaidLink"; // Add this import

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await accountsAPI.getAccounts();
      setAccounts(response.data.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const syncAccount = async (accountId) => {
    try {
      setSyncing(accountId);
      await accountsAPI.syncTransactions(accountId);
      await fetchAccounts(); // Refresh to get updated balances
    } catch (error) {
      console.error("Error syncing account:", error);
      alert(
        `Sync failed: ${error.response?.data?.message || "Please try again"}`
      );
    } finally {
      setSyncing(null);
    }
  };

  const removeAccount = async (accountId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this account? This will disconnect it from Plaid."
      )
    ) {
      return;
    }

    try {
      await accountsAPI.removeAccount(accountId);
      setAccounts(accounts.filter((acc) => acc._id !== accountId));
      alert("Account removed successfully");
    } catch (error) {
      console.error("Error removing account:", error);
      alert(
        `Failed to remove account: ${
          error.response?.data?.message || "Please try again"
        }`
      );
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case "credit":
        return <CreditCard className="w-6 h-6 text-blue-600" />;
      case "depository":
        return <Building className="w-6 h-6 text-green-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(balance || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <PlaidLink onAccountAdded={fetchAccounts} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card p-8 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No accounts connected
          </h3>
          <p className="mt-2 text-gray-500">
            Connect your bank accounts to start tracking your finances.
          </p>
          <div className="mt-6">
            <PlaidLink onAccountAdded={fetchAccounts} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getAccountIcon(account.accountType)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {account.accountName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {account.institutionName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeAccount(account._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-medium text-gray-900">
                    {formatBalance(account.currentBalance)}
                  </span>
                </div>

                {account.availableBalance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Balance:</span>
                    <span className="font-medium text-gray-900">
                      {formatBalance(account.availableBalance)}
                    </span>
                  </div>
                )}

                {account.limit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="font-medium text-gray-900">
                      {formatBalance(account.limit)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {account.accountType}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Synced:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(account.lastSynced).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => syncAccount(account._id)}
                  disabled={syncing === account._id}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  {syncing === account._id ? (
                    <>
                      <div className="loading-spinner"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync Transactions
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountList;
