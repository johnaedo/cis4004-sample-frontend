import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../api";
import { getCategories } from "../api";
import Spinner from "./Spinner";
import BudgetDetailsModal from "./BudgetDetailsModal";
import { formatToInputDate, formatToUIDate } from "../utils/dateHelpers";

const BudgetManager = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    startDate: "",
    endDate: "",
  });

  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const resetForm = () => {
    setFormData({
      category_id: "",
      amount: "",
      startDate: "",
      endDate: "",
    });
    setSelectedBudget(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const budgetData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (selectedBudget) {
      updateMutation.mutate([selectedBudget._id, budgetData]);
    } else {
      createMutation.mutate(budgetData);
    }
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      startDate: formatToInputDate(budget.startDate),
      endDate: formatToInputDate(budget.endDate),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (budget) => {
    setSelectedBudget(budget);
    setIsDetailsModalOpen(true);
  };

  if (isLoadingBudgets || isLoadingCategories) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Budget Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Budget
        </button>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgets?.map((budget) => (
              <tr key={budget._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {categories?.find((c) => c._id === budget.category_id)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  ${Number(budget.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  From {formatToUIDate(budget.startDate)} to {formatToUIDate(budget.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <button
                    onClick={() => handleViewDetails(budget)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Budget Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedBudget ? "Edit Budget" : "Create Budget"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Details Modal */}
      {isDetailsModalOpen && selectedBudget && (
        <BudgetDetailsModal
          budget={selectedBudget}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
};

export default BudgetManager;
