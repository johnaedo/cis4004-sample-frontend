import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [error, setError] = useState(null);

  // Common currencies - you can expand this list
  const currencies = [
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CNY', name: 'Chinese Yuan' },
  ];

  const { data: exchangeData, isLoading, isError } = useQuery({
    queryKey: ['exchangeRate', selectedCurrency],
    queryFn: async () => {
      try {
        console.log('API Key:', import.meta.env.VITE_EXCHANGE_RATE_API_KEY); // This will help debug if the env var is loaded
        const apiUrl = `https://v6.exchangerate-api.com/v6/${import.meta.env.VITE_EXCHANGE_RATE_API_KEY}/latest/USD`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.result === 'error') {
          throw new Error(data['error-type'] || 'API Error');
        }
        return data;
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError(err.message);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const convertedAmount = exchangeData?.conversion_rates?.[selectedCurrency] * amount;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Currency Converter</h3>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          Error: {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Converted Amount</div>
          {isLoading ? (
            <div className="text-lg font-semibold">Loading...</div>
          ) : isError ? (
            <div className="text-red-600">Failed to load exchange rate</div>
          ) : (
            <div className="text-lg font-semibold">
              {convertedAmount?.toFixed(2)} {selectedCurrency}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            1 USD = {exchangeData?.conversion_rates?.[selectedCurrency]} {selectedCurrency}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter; 