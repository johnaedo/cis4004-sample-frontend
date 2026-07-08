import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBudgetTransactions } from '../api';
import Spinner from './Spinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BudgetDetailsModal = ({ budget, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['budgetTransactions', budget.id],
    queryFn: () => getBudgetTransactions(budget.id)
  });

  if (isLoading) {
    return <Spinner />;
  }

  const { transactions } = data;

  // Format the month for display
  const formatMonth = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {budget.category_name} Budget Details
              </h3>
              <p className="text-gray-600">
                Period: {new Date(budget.start_date).toLocaleDateString()} to {new Date(budget.end_date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Budget Amount</h4>
            <p className="text-2xl font-bold text-indigo-600">
              ${Number(budget.amount).toFixed(2)}
            </p>
          </div>

          <div className="h-[400px] mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Monthly Transactions</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={transactions}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={formatMonth}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#2ecc71"
                  name="Income"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e74c3c"
                  name="Expenses"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3498db"
                  name="Savings"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetailsModal; 