import React from "react";

const GoalProgress = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>No financial goals set</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">🎯 Goals</h2>
{goals.map((goal, index) => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        return (
          <div key={index}>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium text-gray-700">{goal.name}</span>
              <span className="text-gray-600">
                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  progress >= 100 ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
 </div>
        );
      })}
    </div>
  );
};

export default GoalProgress;


