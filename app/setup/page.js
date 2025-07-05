'use client'
import React from 'react';
import { useSaleOptions } from '@/context/SaleOptionContext';

const Page = () => {
  const { options, setOptions } = useSaleOptions();

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const optionLabels = {
    description: 'Description for Products',
    shipped: 'Shipped To',
    dispatch: 'Dispatch From',
    calculateByPack: 'Enable Quantity = Per Pack × No. of Packs', // ✅ NEW LABEL
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Invoice Option Toggles</h2>
      <div className="flex flex-col gap-4">
        {Object.keys(optionLabels).map((key) => (
          <label
            key={key}
            className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md border hover:shadow transition-all"
          >
            <span className="text-gray-700 text-base font-medium">{optionLabels[key]}</span>
            <input
              type="checkbox"
              name={key}
              checked={options[key]}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default Page;
