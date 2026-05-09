'use client'
import React, { useState } from 'react';
import { useSaleOptions } from '@/context/SaleOptionContext';

const Page = () => {
  const { options, setOptions } = useSaleOptions();
   const [loadings, setLoadings] = useState(false);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

     const handleClearData = async () => {
    const confirmed = window.confirm(
      "Are you sure? This will delete ALL Items, Customers, Invoices, and HSN data permanently."
    );

    if (!confirmed) return;

    try {
      setLoadings(true);

      const res = await fetch("/api/clear-all-data", {
        method: "DELETE",
      });

      const data = await res.json();

      alert(data.message);
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoadings(false);
    }
  };

  const optionLabels = {
    description: 'Description for Products',
    shipped: 'Shipped To',
    dispatch: 'Dispatch From',
    calculateByPack: 'Enable Quantity = Per Pack × No. of Packs', 
     rollStationary: 'Use Roll Stationary Invoice Format',
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
       <button
      onClick={handleClearData}
      disabled={loadings}
      className="px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 disabled:opacity-50"
    >
      {loadings ? "Deleting..." : "Clear All Data"}
    </button>
      </div>
    </div>
  );
};

export default Page;
