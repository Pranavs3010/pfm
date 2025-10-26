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

const SpendingChart = ({ data }) => {
  // Transform data for bar chart (more reliable than pie chart)
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data
          .filter((item) => item && item._id && item.total > 0)
          .map((item) => ({
            name:
              item._id.length > 15
                ? item._id.substring(0, 15) + "..."
                : item._id,
            amount: Math.round(item.total),
            fullName: item._id,
          }))
          .slice(0, 8) // Limit to top 8 categories
      : [
          { name: "Food & Drink", amount: 1200, fullName: "Food and Drink" },
          { name: "Transportation", amount: 800, fullName: "Transportation" },
          { name: "Shopping", amount: 600, fullName: "Shopping" },
          {
            name: "Bills & Utilities",
            amount: 1500,
            fullName: "Bills & Utilities",
          },
        ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          formatter={(value, name) => [`$${value.toLocaleString()}`, "Spent"]}
          labelFormatter={(label, payload) =>
            payload && payload[0] ? payload[0].payload.fullName : label
          }
        />
        <Bar
          dataKey="amount"
          fill="#3b82f6"
          name="Spending"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SpendingChart;

/*
  This commit is done from Akmain branch
*/