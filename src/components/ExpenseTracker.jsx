import React, { useState } from 'react';

const ExpenseTracker = () => {
  const [budgetItems, setBudgetItems] = useState([
    { category: 'Housing', planned: 0, actual: 0 },
    { category: 'Transportation', planned: 0, actual: 0 },
    { category: 'Food', planned: 0, actual: 0 },
    { category: 'Utilities', planned: 0, actual: 0 },
    { category: 'Entertainment', planned: 0, actual: 0 }
  ]);

  const [totalBudget, setTotalBudget] = useState(0);

  const handlePlannedChange = (index, value) => {
    const newBudgetItems = [...budgetItems];
    newBudgetItems[index].planned = parseFloat(value) || 0;
    setBudgetItems(newBudgetItems);
    calculateTotal(newBudgetItems);
  };

  const handleActualChange = (index, value) => {
    const newBudgetItems = [...budgetItems];
    newBudgetItems[index].actual = parseFloat(value) || 0;
    setBudgetItems(newBudgetItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.planned, 0);
    setTotalBudget(total);
  };

  const getProgressColor = (planned, actual) => {
    if (actual === 0) return 'bg-gray-200';
    const ratio = actual / planned;
    if (ratio > 1) return 'bg-red-500';
    if (ratio > 0.9) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Expense Tracker</h3>
      <div className="space-y-6">
        {budgetItems.map((item, index) => (
          <div key={item.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{item.category}</span>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm text-gray-500">Planned</label>
                  <input
                    type="number"
                    value={item.planned}
                    onChange={(e) => handlePlannedChange(index, e.target.value)}
                    className="w-24 p-1 border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Actual</label>
                  <input
                    type="number"
                    value={item.actual}
                    onChange={(e) => handleActualChange(index, e.target.value)}
                    className="w-24 p-1 border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(item.planned, item.actual)} transition-all duration-300`}
                style={{
                  width: `${Math.min((item.actual / item.planned) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Budget:</span>
            <span className="text-xl font-bold text-indigo-600">
              ${totalBudget.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker; 