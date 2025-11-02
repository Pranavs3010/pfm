import React from "react";
import SpendingChart from "../components/SpendingChart";
import GoalProgress from "../components/GoalProgress";
import InvestmentChart from "../components/InvestmentChart";

const Dashboard = () => {
  const spendingData = [
    { _id: "Food & Drink", total: 1200 },
    { _id: "Transportation", total: 800 },
    { _id: "Shopping", total: 600 },
  ];

  const goals = [
    { name: "Vacation Fund", target: 5000, current: 3200 },
    { name: "Emergency Savings", target: 10000, current: 8500 },
  ];

  const investments = [
    { name: "Stocks", value: 12000 },
    { name: "Bonds", value: 4000 },
    { name: "Crypto", value: 2000 },
 ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Personal Finance Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <SpendingChart data={spendingData} />
        </div>
        <InvestmentChart investments={investments} />
      </div>

      <GoalProgress goals={goals} />
    </div>
  );
};

export default Dashboard;

