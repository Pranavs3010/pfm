import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const InvestmentChart = ({ investments }) => {
  if (!investments || investments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No investment data available</p>
      </div>
    );
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const total = investments.reduce((sum, inv) => sum + inv.value, 0);

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">📈 Investments</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={investments}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={(entry) => `${((entry.value / total) * 100).toFixed(0)}%`}
          >
            {investments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {investments.map((inv, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-gray-700">
              {inv.name}: ${inv.value.toLocaleString()}
            </span>
          </div>
))}
      </div>
    </div>
  );
};

export default InvestmentChart;

