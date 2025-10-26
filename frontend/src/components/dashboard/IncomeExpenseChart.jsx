import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const IncomeExpenseChart = ({ data }) => {
  console.log("📊 Chart received data:", data);

  // Transform MongoDB aggregation data to chart format
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data.map((item) => {
          const year = item._id?.year || new Date().getFullYear();
          const month = item._id?.month || new Date().getMonth() + 1;

          return {
            name: `${year}-${String(month).padStart(2, "0")}`,
            month: new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "short",
            }),
            income: Math.round(item.income || 0),
            expenses: Math.round(item.expenses || 0),
          };
        })
      : [];

  console.log("📈 Transformed chart data:", chartData);

  // If no data, show message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p>No transaction data available</p>
          <p className="text-sm mt-2">
            Connect an account and sync transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          stroke="#9ca3af"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
          stroke="#9ca3af"
        />
        <Tooltip
          formatter={(value, name) => [
            `$${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            name === "income" ? "Income" : "Expenses",
          ]}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return `Period: ${payload[0].payload.name}`;
            }
            return label;
          }}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "0.75rem",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: "1rem" }} iconType="line" />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={2}
          name="Income"
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          name="Expenses"
          dot={{ fill: "#ef4444", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;

/*
  This commit is done from Akmain branch
*/