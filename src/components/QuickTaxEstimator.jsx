import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator } from 'lucide-react';

const QuickTaxEstimator = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Tax Estimator</h3>
        <Calculator className="w-6 h-6 text-gray-500" />
      </div>
      <Link 
        to="/tax-estimator"
        className="text-blue-600 hover:text-blue-800 text-lg font-semibold"
      >
        Go to Calculator →
      </Link>
      <p className="text-sm text-gray-500 mt-2">Estimate your taxes</p>
    </>
  );
};

export default QuickTaxEstimator; 