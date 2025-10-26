import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const SpendingChart = ({ data }) => {
  console.log("🥧 Spending chart received data:", data);

  // Transform MongoDB aggregation data to chart format
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data
          .filter((item) => item && item._id && item.total > 0)
          .map((item) => ({
            name: item._id || "Uncategorized",
            value: Math.round(item.total * 100) / 100, // Round to 2 decimals
            displayValue: `$${item.total.toFixed(2)}`,
          }))
          .sort((a, b) => b.value - a.value) // Sort by value descending
          .slice(0, 8) // Top 8 categories
      : [];

  console.log("📊 Transformed spending data:", chartData);

  // If no data, show message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p>No spending data available</p>
          <p className="text-sm mt-2">
            Make some transactions to see categories
          </p>
        </div>
      </div>
    );
  }

  // Color palette for categories
  const COLORS = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label with percentage
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    // Only show label if percentage is > 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              props.payload.name,
            ]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "0.75rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Legend with amounts */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium text-gray-900">
                {item.name}
              </div>
              <div className="text-gray-600">
                $
                {item.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-gray-400 ml-1">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total spending */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between items-center font-semibold">
          <span className="text-gray-700">Total Spending:</span>
          <span className="text-gray-900">
            $
            {total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;

/*
  This commit is done from Akmain branch
*/