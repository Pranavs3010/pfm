import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const IncomeExpenseChart = ({ data }) => {
  // Transform data for chart with better error handling
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data.map((item) => ({
          name: `${item._id?.year || new Date().getFullYear()}-${String(
            item._id?.month || new Date().getMonth() + 1
          ).padStart(2, "0")}`,
          Income: Math.round(item.income || 0),
          Expenses: Math.round(item.expenses || 0),
        }))
      : [
          { name: "2024-01", Income: 5000, Expenses: 3500 },
          { name: "2024-02", Income: 5200, Expenses: 3800 },
          { name: "2024-03", Income: 4800, Expenses: 3200 },
        ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
          formatter={(value) => [`$${value.toLocaleString()}`, ""]}
          labelFormatter={(label) => `Period: ${label}`}
        />
        <Legend />
        <Bar dataKey="Income" fill="#10b981" name="Income" />
        <Bar dataKey="Expenses" fill="#ef4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;

/*
  This commit is done from Akmain branch
*/