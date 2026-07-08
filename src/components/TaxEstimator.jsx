import React, { useState } from 'react';
import { calculateTotalTax, STATE_TAX_RATES } from '../utils/taxCalculator';
import { ArrowDownCircle, Download, Calculator } from 'lucide-react';

const TaxEstimator = () => {
  const [formData, setFormData] = useState({
    income: '',
    filingStatus: 'single',
    state: '',
    selfEmploymentIncome: '',
    deductions: [],
    credits: [],
    previousYearIncome: null,
    payPeriods: 26, // Bi-weekly by default
  });

  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [estimatedTax, setEstimatedTax] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addDeduction = (deduction) => {
    const updatedFormData = {
      ...formData,
      deductions: [...formData.deductions, deduction]
    };
    setFormData(updatedFormData);
    setShowDeductionModal(false);
    
    // Automatically recalculate tax
    const taxResults = calculateTotalTax({
      income: Number(updatedFormData.income),
      filingStatus: updatedFormData.filingStatus,
      state: updatedFormData.state,
      selfEmploymentIncome: Number(updatedFormData.selfEmploymentIncome),
      deductions: updatedFormData.deductions,
      credits: updatedFormData.credits,
      previousYearIncome: updatedFormData.previousYearIncome
    });
    setEstimatedTax(taxResults);
  };

  const addCredit = (credit) => {
    const updatedFormData = {
      ...formData,
      credits: [...formData.credits, credit]
    };
    setFormData(updatedFormData);
    setShowCreditModal(false);
    
    // Automatically recalculate tax
    const taxResults = calculateTotalTax({
      income: Number(updatedFormData.income),
      filingStatus: updatedFormData.filingStatus,
      state: updatedFormData.state,
      selfEmploymentIncome: Number(updatedFormData.selfEmploymentIncome),
      deductions: updatedFormData.deductions,
      credits: updatedFormData.credits,
      previousYearIncome: updatedFormData.previousYearIncome
    });
    setEstimatedTax(taxResults);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const taxResults = calculateTotalTax({
      income: Number(formData.income),
      filingStatus: formData.filingStatus,
      state: formData.state,
      selfEmploymentIncome: Number(formData.selfEmploymentIncome),
      deductions: formData.deductions,
      credits: formData.credits,
      previousYearIncome: formData.previousYearIncome
    });
    setEstimatedTax(taxResults);
  };

  const exportToCSV = () => {
    if (!estimatedTax) return;

    const rows = [
      ['Tax Estimation Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [],
      ['Income Details'],
      ['Annual Income', `$${formData.income}`],
      ['Filing Status', formData.filingStatus],
      ['Self-Employment Income', `$${formData.selfEmploymentIncome || 0}`],
      [],
      ['Tax Breakdown'],
      ['Federal Tax', `$${estimatedTax.federalTax.toFixed(2)}`],
      ['State Tax', `$${estimatedTax.stateTax.toFixed(2)}`],
      ['Self-Employment Tax', `$${estimatedTax.selfEmploymentTax.total.toFixed(2)}`],
      ['Total Tax', `$${estimatedTax.totalTax.toFixed(2)}`],
      ['Effective Tax Rate', `${estimatedTax.effectiveRate.toFixed(1)}%`],
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax-estimate.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateWithholding = () => {
    if (!estimatedTax) return null;
    const annualTax = estimatedTax.totalTax;
    return {
      perPaycheck: annualTax / formData.payPeriods,
      current: annualTax / 12 // Monthly withholding
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tax Estimator</h2>
        <div className="flex gap-2">
          {estimatedTax && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['basic', 'deductions', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {activeTab === 'basic' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Annual Income
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="income"
                      value={formData.income}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Filing Status
                  </label>
                  <select
                    name="filingStatus"
                    value={formData.filingStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                    <option value="headOfHousehold">Head of Household</option>
                    <option value="marriedSeparate">Married Filing Separately</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select State</option>
                    {Object.entries(STATE_TAX_RATES).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Self-Employment Income
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="selfEmploymentIncome"
                      value={formData.selfEmploymentIncome}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'deductions' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Deductions</h3>
                  <button
                    type="button"
                    onClick={() => setShowDeductionModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Deduction
                  </button>
                </div>
                {formData.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span>{deduction.name}</span>
                    <span>${deduction.amount}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Credits</h3>
                  <button
                    type="button"
                    onClick={() => setShowCreditModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Credit
                  </button>
                </div>
                {formData.credits.map((credit, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span>{credit.name}</span>
                    <span>${credit.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pay Periods Per Year
                </label>
                <select
                  name="payPeriods"
                  value={formData.payPeriods}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="12">Monthly (12)</option>
                  <option value="24">Semi-monthly (24)</option>
                  <option value="26">Bi-weekly (26)</option>
                  <option value="52">Weekly (52)</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-5">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Calculate Tax
            </button>
          </div>
        </form>
      </div>

      {estimatedTax && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Tax Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Adjusted Gross Income</h4>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${estimatedTax.adjustedGrossIncome.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Deductions Applied</h4>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ${estimatedTax.deductions.effective.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Using {estimatedTax.deductions.effective === estimatedTax.deductions.standard ? 'standard' : 'itemized'} deduction
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Taxable Income</h4>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${estimatedTax.taxableIncome.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Federal Tax</h4>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${estimatedTax.federalTax.toFixed(2)}
                </p>
              </div>

              {estimatedTax.stateTax > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">State Tax</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    ${estimatedTax.stateTax.toFixed(2)}
                  </p>
                </div>
              )}

              {estimatedTax.selfEmploymentTax.total > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Self-Employment Tax</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    ${estimatedTax.selfEmploymentTax.total.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Tax</h4>
                <p className="mt-1 text-3xl font-bold text-blue-600">
                  ${estimatedTax.totalTax.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Effective Tax Rate</h4>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {estimatedTax.effectiveRate.toFixed(1)}%
                </p>
              </div>

              {calculateWithholding() && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Suggested Monthly Withholding</h4>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    ${calculateWithholding().current.toFixed(2)}
                  </p>
                </div>
              )}

              {estimatedTax.deductions.breakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Itemized Deductions</h4>
                  <div className="space-y-1">
                    {estimatedTax.deductions.breakdown.map((deduction, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{deduction.name}</span>
                        <span className="text-gray-900">${deduction.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-medium">
                      <span>Total Itemized</span>
                      <span>${estimatedTax.deductions.itemized.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {estimatedTax.credits.breakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Tax Credits</h4>
                  <div className="space-y-1">
                    {estimatedTax.credits.breakdown.map((credit, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{credit.name}</span>
                        <span className="text-gray-900">${credit.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-medium">
                      <span>Total Credits</span>
                      <span>${estimatedTax.credits.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Tax Bracket Breakdown</h4>
            <div className="space-y-2">
              {estimatedTax.federalBreakdown.map((bracket, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {(bracket.rate * 100).toFixed(0)}% Bracket
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${bracket.tax.toFixed(2)} on ${bracket.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deduction Modal */}
      {showDeductionModal && (
        <DeductionModal
          onClose={() => setShowDeductionModal(false)}
          onAdd={addDeduction}
        />
      )}

      {/* Credit Modal */}
      {showCreditModal && (
        <CreditModal
          onClose={() => setShowCreditModal(false)}
          onAdd={addCredit}
        />
      )}
    </div>
  );
};

const DeductionModal = ({ onClose, onAdd }) => {
  const [deduction, setDeduction] = useState({ name: '', amount: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...deduction, amount: Number(deduction.amount) });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Deduction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deduction Name
            </label>
            <input
              type="text"
              value={deduction.name}
              onChange={(e) => setDeduction({ ...deduction, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              value={deduction.amount}
              onChange={(e) => setDeduction({ ...deduction, amount: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreditModal = ({ onClose, onAdd }) => {
  const [credit, setCredit] = useState({ name: '', amount: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...credit, amount: Number(credit.amount) });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Tax Credit</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Name
            </label>
            <input
              type="text"
              value={credit.name}
              onChange={(e) => setCredit({ ...credit, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              value={credit.amount}
              onChange={(e) => setCredit({ ...credit, amount: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxEstimator; 