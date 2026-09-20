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

  // The server refuses anything that does not carry this exact phrase, so the
  // prompt is not decoration -- a mistyped answer is rejected there too.
  const CONFIRM_PHRASE = "DELETE ALL DATA";

  const handleClearData = async () => {
    const typed = window.prompt(
      `This permanently deletes every item, customer, invoice, voucher and ledger entry.\n\nType ${CONFIRM_PHRASE} to confirm.`
    );

    if (typed !== CONFIRM_PHRASE) {
      if (typed !== null) alert("Phrase did not match. Nothing was deleted.");
      return;
    }

    try {
      setLoadings(true);

      const res = await fetch("/api/clear-all-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: CONFIRM_PHRASE }),
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
    <div className="page-shell max-w-2xl">
      <header className="page-header">
        <div>
          <h1 className="page-title">Setup</h1>
          <p className="page-subtitle">Choose which fields appear while billing.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Invoice options</h2>
        </div>
        <div className="panel-body flex flex-col gap-2">
          {Object.keys(optionLabels).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="text-sm font-medium text-foreground">{optionLabels[key]}</span>
              <input
                type="checkbox"
                name={key}
                checked={options[key]}
                onChange={handleChange}
                className="field-check"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="panel mt-5 border-destructive/30">
        <div className="panel-head border-destructive/30">
          <h2 className="panel-title text-destructive">Danger zone</h2>
        </div>
        <div className="panel-body flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-sm text-sm text-muted-foreground">
            Permanently deletes every item, customer, invoice and HSN record. This cannot be undone.
          </p>
          <button
            onClick={handleClearData}
            disabled={loadings}
            className="btn btn-danger"
          >
            {loadings ? "Deleting..." : "Clear All Data"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Page;
