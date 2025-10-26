import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../../services/api";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import IncomeExpenseChart from "./IncomeExpenseChart";
import SpendingChart from "./SpendingChart";
import BudgetManager from "./BudgetManager";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary();
      setDashboardData(response.data.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-gray-900">{error}</p>
          <button onClick={fetchDashboardData} className="mt-4 btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Balance",
      value: dashboardData?.summary?.totalBalance || 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      format: (val) => `$${val?.toLocaleString() || "0"}`,
    },
    {
      title: "Monthly Income",
      value: dashboardData?.summary?.monthlyIncome || 0,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      format: (val) => `$${val?.toLocaleString() || "0"}`,
    },
    {
      title: "Monthly Expenses",
      value: dashboardData?.summary?.monthlyExpenses || 0,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      format: (val) => `$${val?.toLocaleString() || "0"}`,
    },
    {
      title: "Savings Rate",
      value: dashboardData?.summary?.savingsRate || 0,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      format: (val) => `${val}%`,
    },
  ];
  // Add this right after your summary cards section:
  <div className="card p-4 mb-6 bg-yellow-50">
    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Data Debug</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <p>
          <strong>Monthly Trends:</strong>{" "}
          {dashboardData?.monthlyTrends?.length || 0} items
        </p>
        <p>
          <strong>Category Spending:</strong>{" "}
          {dashboardData?.categorySpending?.length || 0} items
        </p>
      </div>
      <div>
        <p>
          <strong>Income:</strong> ${dashboardData?.summary?.monthlyIncome}
        </p>
        <p>
          <strong>Expenses:</strong> ${dashboardData?.summary?.monthlyExpenses}
        </p>
      </div>
    </div>
  </div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button onClick={fetchDashboardData} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {card.format(card.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Budgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Income vs Expenses
          </h2>
          <IncomeExpenseChart data={dashboardData?.monthlyTrends || []} />
        </div>

        {/* Spending by Category */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category
          </h2>
          <SpendingChart data={dashboardData?.categorySpending || []} />
        </div>
      </div>

      {/* Budget Manager */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Budget Management
        </h2>
        <BudgetManager />
      </div>

      {/* Recent Transactions */}
      {dashboardData?.recentTransactions &&
        dashboardData.recentTransactions.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Transactions
            </h2>
            <div className="space-y-3">
              {dashboardData.recentTransactions
                .slice(0, 5)
                .map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.account?.institutionName} •{" "}
                        {transaction.primaryCategory}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          transaction.amount < 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount < 0 ? "+" : "-"}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;

/*
  This commit is done from Akmain branch
*/