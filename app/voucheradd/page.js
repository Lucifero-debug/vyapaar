"use client";

import React, { Suspense, useEffect, useState } from "react";
import VoucherSearchParams from "@/components/VoucherSearchparams";

const AddVoucher = () => {
  const [voucherParams, setVoucherParams] = useState({ type: "", value: "" });

  const [form, setForm] = useState({
    acName: "",
    date: new Date().toISOString().slice(0, 10),
    againstBill: false,
    acType: "",
  });

  const [entries, setEntries] = useState([
    { name: "", debit: "", credit: "", custId: "" },
  ]);

  const [customers, setCustomers] = useState([]);

  // Fetch all customers
  useEffect(() => {
    const fetchCust = async () => {
      try {
        const response = await fetch("/api/get-customer");
        const result = await response.json();
        setCustomers(result.customer || []);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        alert("Failed to fetch customer.");
      }
    };

    fetchCust();
  }, []);

  // Fetch existing voucher when editing
  useEffect(() => {
    if (voucherParams.value && customers.length > 0) {
      const fetchVoucher = async () => {
        try {
          const res = await fetch("/api/voucher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: voucherParams.value }),
          });

          const result = await res.json();
          const voucher = result.final;
          if (!voucher) throw new Error("Voucher not found");

          setForm({
            acName: voucher.acName || "",
            date:
              voucher.date?.slice(0, 10) ||
              new Date().toISOString().slice(0, 10),
            againstBill: voucher.againstBill || false,
            acType: voucher.acType || "",
          });

          setEntries(
            voucher.customers?.map((custEntry) => {
              const found = customers.find(
                (c) => c.name === custEntry.name
              );
              return {
                name: custEntry.name || "",
                debit: custEntry.debit?.toString() || "",
                credit: custEntry.credit?.toString() || "",
                custId: found?._id || "",
              };
            }) || [{ name: "", debit: "", credit: "", custId: "" }]
          );
        } catch (err) {
          console.error("Failed to fetch voucher:", err);
          alert("Failed to load voucher.");
        }
      };

      fetchVoucher();
    }
  }, [voucherParams.value, customers]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle entry changes
  const handleEntryChange = (index, e) => {
    const { name, value } = e.target;
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== index) return entry;

        if (name === "name") {
          const selectedCust = customers.find((c) => c.name === value);
          return {
            ...entry,
            name: value,
            custId: selectedCust?._id || "",
          };
        }

        return { ...entry, [name]: value };
      })
    );
  };

  // Add and remove entry rows
  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { name: "", debit: "", credit: "", custId: "" },
    ]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();



    try {
      const endpoint = voucherParams.value
        ? "/api/voucher-alter"
        : "/api/voucher-add";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acName: form.acName,
          date: form.date,
          againstBill: form.againstBill,
          acType: form.acType,
          paymentType: voucherParams.type,
          customers: entries.map((entry) => ({
            name: entry.name,
            debit: parseFloat(entry.debit) || 0,
            credit: parseFloat(entry.credit) || 0,
            custId: entry.custId,
          })),
          ...(voucherParams.value && { id: voucherParams.value }),
        }),
      });

      if (!res.ok) throw new Error("Failed to save voucher");

      alert(
        voucherParams.value
          ? "Voucher updated successfully!"
          : "Voucher added successfully!"
      );

      setForm({
        acName: "",
        date: new Date().toISOString().slice(0, 10),
        againstBill: false,
        acType: "",
      });

      setEntries([{ name: "", debit: "", credit: "", custId: "" }]);
      setVoucherParams({ type: "", value: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <VoucherSearchParams onParams={setVoucherParams} />
      </Suspense>

      <div className="max-w-6xl mx-auto p-8 bg-white border shadow-md mt-12 font-mono text-gray-800 rounded-lg">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {voucherParams.type === "Cash"
                ? "Cash Voucher"
                : "Bank Voucher"}
            </h1>
            <p className="text-sm text-gray-600">Date: {form.date}</p>
          </div>
          <div className="text-right space-y-1">
            <p>
              {voucherParams.type === "Cash" ? "Cash" : "Bank"} A/c:{" "}
              <span className="font-semibold">
                {form.acName || "Select Account"}
              </span>
            </p>
            <p>
              Type: <span className="font-semibold">{form.acType || "None"}</span>
            </p>
            <p>
              Against Bill:{" "}
              <span className="font-semibold">
                {form.againstBill ? "Yes" : "No"}
              </span>
            </p>
          </div>
        </div>

        {/* --- VOUCHER FORM --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Account Name</th>
                  <th className="border px-3 py-2 text-right">Debit</th>
                  <th className="border px-3 py-2 text-right">Credit</th>
                  <th className="border px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-t">
                    <td className="border px-2 py-1">
                      <select
                        name="name"
                        value={entry.name}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full bg-transparent outline-none"
                        required
                      >
                        <option value="" disabled>
                          Select Customer
                        </option>
                        {customers.map((cust, i) => (
                          <option key={i} value={cust.name}>
                            {cust.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-2 py-1 text-right">
                      <input
                        type="number"
                        name="debit"
                        value={entry.debit}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full bg-transparent text-right outline-none"
                      />
                    </td>
                    <td className="border px-2 py-1 text-right">
                      <input
                        type="number"
                        name="credit"
                        value={entry.credit}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full bg-transparent text-right outline-none"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-3 py-2">
                    <button
                      type="button"
                      onClick={addEntry}
                      className="text-blue-600 hover:underline"
                    >
                      + Add Customer Row
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm font-medium">
                {voucherParams.type === "Cash" ? "Cash A/c" : "Bank A/c"}
              </label>
              <select
                name="acName"
                value={form.acName}
                onChange={handleFormChange}
                required
                className="w-full border px-3 py-1 rounded-md"
              >
                <option value="" disabled>
                  Select {voucherParams.type === "Cash" ? "Cash" : "Bank"} Account
                </option>
                {customers
                  .filter((cust) =>
                    voucherParams.type === "Cash"
                      ? cust.group?.toLowerCase() === "cash"
                      : cust.group?.toLowerCase() === "bank"
                  )
                  .map((cust, i) => (
                    <option key={i} value={cust.name}>
                      {cust.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Account Type</label>
              <input
                type="text"
                name="acType"
                value={form.acType}
                onChange={handleFormChange}
                placeholder="e.g. Cash, Bank"
                className="w-full border px-3 py-1 rounded-md"
              />
            </div>

            <label className="text-sm font-medium flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                name="againstBill"
                checked={form.againstBill}
                onChange={handleFormChange}
                className="form-checkbox"
              />
              Against Bill
            </label>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            {voucherParams.value ? "Update Voucher" : "Add Voucher"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddVoucher;
