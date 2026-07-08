import React, { useState } from 'react';
import { Target, Trophy, Sparkles, AlertCircle, Plus, Edit2 } from 'lucide-react';

const SavingsGoals = () => {
  // Set future dates for all goals
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Emergency Fund",
      target: 10000,
      current: 3500,
      deadline: nextYear.toISOString().split('T')[0],
      priority: "high",
      milestones: [2500, 5000, 7500, 10000],
      icon: "🛡️"
    },
    {
      id: 2,
      name: "Vacation Fund",
      target: 5000,
      current: 2000,
      deadline: sixMonthsLater.toISOString().split('T')[0],
      priority: "medium",
      milestones: [1000, 2500, 3750, 5000],
      icon: "✈️"
    },
    {
      id: 3,
      name: "New Car",
      target: 25000,
      current: 5000,
      deadline: threeMonthsLater.toISOString().split('T')[0],
      priority: "low",
      milestones: [5000, 10000, 15000, 25000],
      icon: "🚗"
    },
    {
      id: 4,
      name: "New house",
      target: 22222222,
      current: 0,
      deadline: oneMonthLater.toISOString().split('T')[0],
      priority: "high",
      milestones: [5555555.5, 11111111, 16666666.5, 22222222],
      icon: "🏠"
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState({
    id: null,
    name: '',
    target: '',
    deadline: '',
    priority: 'medium',
    icon: '🎯',
    current: 0
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Return 0 if the deadline has passed (negative days)
    return days > 0 ? days : 0;
  };

  const calculateNextMilestone = (current, milestones) => {
    return milestones.find(milestone => milestone > current) || milestones[milestones.length - 1];
  };

  const handleContribution = (id, amount) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        return {
          ...goal,
          current: Math.min(goal.current + parseFloat(amount || 0), goal.target)
        };
      }
      return goal;
    }));
  };

  const handleEditGoal = (goal) => {
    setIsEditing(true);
    setNewGoal({
      ...goal,
      target: goal.target.toString(),
      deadline: goal.deadline
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = parseFloat(newGoal.target);
    const milestones = [
      target * 0.25,
      target * 0.5,
      target * 0.75,
      target
    ];

    if (isEditing) {
      setGoals(goals.map(goal => 
        goal.id === newGoal.id 
          ? { 
              ...newGoal, 
              target,
              milestones,
              current: Math.min(newGoal.current, target) // Ensure current doesn't exceed new target
            }
          : goal
      ));
    } else {
      const goal = {
        id: Date.now(),
        ...newGoal,
        target,
        current: 0,
        milestones,
      };
      setGoals([...goals, goal]);
    }

    setNewGoal({
      id: null,
      name: '',
      target: '',
      deadline: '',
      priority: 'medium',
      icon: '🎯',
      current: 0
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const iconOptions = ['🎯', '🛡️', '🏠', '✈️', '🚗', '💍', '📚', '💼', '🏗️', '💰', '🎓', '🏦'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Savings Goals</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Track your progress</span>
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setNewGoal({
                id: null,
                name: '',
                target: '',
                deadline: '',
                priority: 'medium',
                icon: '🎯',
                current: 0
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No savings goals yet</p>
          <p className="text-sm text-gray-500">Click the "Add Goal" button to create your first goal</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const daysLeft = calculateDaysLeft(goal.deadline);
            const nextMilestone = calculateNextMilestone(goal.current, goal.milestones);

            return (
              <div key={goal.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                        {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-2 text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Target: ${goal.target.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{daysLeft} days left</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-teal-600">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 mb-4 overflow-hidden bg-teal-200 rounded">
                    <div
                      style={{ width: `${progress}%` }}
                      className="flex flex-col justify-center overflow-hidden bg-teal-500 shadow-none transition-all duration-500"
                    ></div>
                  </div>
                  {/* Milestone Markers */}
                  <div className="flex justify-between px-1">
                    {goal.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full -mt-3 ${
                          goal.current >= milestone ? 'bg-teal-500' : 'bg-gray-300'
                        }`}
                        style={{ marginLeft: `${(milestone / goal.target) * 100 - 2}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Current Amount and Quick Add */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current: ${goal.current.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      Next milestone: ${nextMilestone.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleContribution(goal.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(event) => {
                        const input = event.target.previousSibling;
                        handleContribution(goal.id, input.value);
                        input.value = '';
                      }}
                      className="px-3 py-1 text-sm text-white bg-teal-500 rounded hover:bg-teal-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Savings Goal' : 'Add New Savings Goal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Amount ($)</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <div className="mt-1 grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, icon })}
                      className={`text-2xl p-2 rounded-lg ${
                        newGoal.icon === icon ? 'bg-teal-100 border-2 border-teal-500' : 'hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setNewGoal({
                      id: null,
                      name: '',
                      target: '',
                      deadline: '',
                      priority: 'medium',
                      icon: '🎯',
                      current: 0
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  {isEditing ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals; 