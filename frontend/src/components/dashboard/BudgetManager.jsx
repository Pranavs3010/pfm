import React, { useState, useEffect } from "react";
import { budgetsAPI } from "../../services/api";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
    alertThreshold: 80,
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetsAPI.getBudgets();
      setBudgets(response.data.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetsAPI.createBudget({
        ...formData,
        limit: parseFloat(formData.limit),
      });
      setShowForm(false);
      setFormData({
        category: "",
        limit: "",
        period: "monthly",
        alertThreshold: 80,
      });
      fetchBudgets();
    } catch (error) {
      console.error("Error creating budget:", error);
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    try {
      await budgetsAPI.deleteBudget(id);
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const categories = [
    "Food and Drink",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Travel",
    "Personal",
    "Education",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Your Budgets</h3>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h4 className="text-lg font-medium mb-4">Create New Budget</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="input"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, limit: e.target.value }))
                  }
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, period: e.target.value }))
                  }
                  className="input"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      alertThreshold: parseInt(e.target.value),
                    }))
                  }
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Create Budget
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget._id}
            budget={budget}
            onDelete={deleteBudget}
          />
        ))}
      </div>

      {budgets.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4">No budgets created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 btn btn-primary"
          >
            Create your first budget
          </button>
        </div>
      )}
    </div>
  );
};

const BudgetCard = ({ budget, onDelete }) => {
  const { utilization, spent, limit, category, period } = budget;

  const getProgressColor = () => {
    if (utilization >= 100) return "bg-red-600";
    if (utilization >= budget.alertThreshold) return "bg-yellow-500";
    return "bg-green-600";
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{category}</h4>
          <p className="text-sm text-gray-500 capitalize">{period}</p>
        </div>
        <button
          onClick={() => onDelete(budget._id)}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Spent: ${spent?.toFixed(2) || "0.00"}</span>
          <span>Limit: ${limit?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(utilization || 0, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span
          className={`font-medium ${
            utilization >= 100
              ? "text-red-600"
              : utilization >= budget.alertThreshold
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {utilization?.toFixed(1) || "0"}% utilized
        </span>
        <span className="text-gray-500">
          ${((limit || 0) - (spent || 0)).toFixed(2)} remaining
        </span>
      </div>
    </div>
  );
};

export default BudgetManager;

/*
  This commit is done from Akmain branch
*/