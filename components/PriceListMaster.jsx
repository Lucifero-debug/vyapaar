'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { netRate, rowDiscount } from '@/lib/priceList.mjs';

const today = () => new Date().toISOString().substring(0, 10);

const newKey = () => Math.random().toString(36).slice(2);

/**
 * A party's price list: one row per item, with the unit, the rate, the MRP
 * and the discount side by side. Items are added one at a time from the
 * picker above the grid and removed with the × on their row.
 *
 * A blank Sale Price means "bill at the item master's rate" -- which is not
 * the same as entering 0.
 */
const PriceListMaster = ({ open, onClose, selected }) => {
  const [party, setParty] = useState('');
  const [date, setDate] = useState(today());
  const [remark, setRemark] = useState('');
  const [parties, setParties] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [pick, setPick] = useState('');
  const [activeRow, setActiveRow] = useState(-1);
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(selected?._id);
  const gridRef = useRef(null);
  const pickRef = useRef(null);

  const itemsByName = useMemo(() => {
    const map = new Map();
    items.forEach((it) => map.set((it.name || '').toLowerCase(), it));
    return map;
  }, [items]);

  // Items already on the list are left out of the picker.
  const pickable = useMemo(() => {
    const listed = new Set(rows.map((r) => String(r.itemId)));
    return items.filter((it) => !listed.has(String(it._id)));
  }, [items, rows]);

  useEffect(() => {
    if (!open) return;
    Promise.all([fetch('/api/get-item'), fetch('/api/get-customer')])
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .then(([itemData, custData]) => {
        setItems(itemData.item || []);
        setParties(custData.customer || []);
      })
      .catch((err) => {
        console.error('Error fetching items or parties:', err);
        alert('Failed to fetch items or parties.');
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPick('');
    setActiveRow(-1);

    if (!selected) {
      setParty('');
      setDate(today());
      setRemark('');
      setRows([]);
      return;
    }

    setParty(selected.party ? String(selected.party) : '');
    setDate(selected.date ? new Date(selected.date).toISOString().substring(0, 10) : today());
    setRemark(selected.remark || '');
    setRows((selected.items || []).map((row) => ({
      key: newKey(),
      itemId: String(row.itemId || ''),
      name: row.name || '',
      unit: row.unit || '',
      // `price` is what the rate was called before the discount columns existed.
      salePrice: row.salePrice ?? row.price ?? '',
      mrp: row.mrp ?? '',
      // Lists saved with the old Dis 1/2/3 chain open with it merged into one.
      discount: rowDiscount(row) || '',
    })));
  }, [open, selected]);

  const setCell = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  /** Adds the picked item, seeded from the item master; the user overrides. */
  const addItem = useCallback(() => {
    const name = pick.trim();
    if (!name) {
      pickRef.current?.focus();
      return;
    }
    const match = itemsByName.get(name.toLowerCase());
    if (!match) {
      alert(`"${name}" is not in the item master. Pick it from the list, or add it under Items first.`);
      return;
    }
    if (rows.some((r) => String(r.itemId) === String(match._id))) {
      alert(`${match.name} is already on this price list.`);
      return;
    }

    const index = rows.length;
    setRows((prev) => [
      ...prev,
      {
        key: newKey(),
        itemId: String(match._id),
        name: match.name,
        unit: match.unit || '',
        salePrice: match.salePrice ?? '',
        mrp: match.mrp ?? '',
        discount: match.discount ? String(match.discount) : '',
      },
    ]);
    setPick('');
    setActiveRow(index);
    // Straight into the new row's Sale Price, ready to type over.
    requestAnimationFrame(() => {
      gridRef.current?.querySelector(`[data-cell="${index}:salePrice"]`)?.select();
    });
  }, [pick, itemsByName, rows]);

  const deleteRow = useCallback((index) => {
    if (index < 0) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
    setActiveRow(-1);
  }, []);

  const handleSave = useCallback(async () => {
    if (!party || !date) {
      alert('Please select a party and a date');
      return;
    }

    if (!rows.length) {
      alert('Add at least one item.');
      return;
    }

    const payload = {
      id: selected?._id,
      party,
      date,
      remark: remark.trim(),
      items: rows.map((r) => ({
        itemId: r.itemId,
        name: r.name,
        unit: r.unit,
        salePrice: r.salePrice,
        mrp: r.mrp,
        discount: r.discount,
      })),
    };

    setSaving(true);
    try {
      const res = await fetch(isEditing ? '/api/price-list-update' : '/api/price-list-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        onClose(true);
      } else {
        alert(`Failed to save price list: ${result.error}`);
      }
    } catch (err) {
      console.error('Error saving price list:', err);
      alert('Error saving price list');
    } finally {
      setSaving(false);
    }
  }, [party, date, remark, rows, isEditing, selected, onClose]);

  // Alt+A jumps to the item picker, Alt+S saves, Alt+E removes the row in focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'a') { e.preventDefault(); pickRef.current?.focus(); }
      if (key === 's') { e.preventDefault(); handleSave(); }
      if (key === 'e') { e.preventDefault(); deleteRow(activeRow); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, deleteRow, handleSave, activeRow]);

  /** Enter moves down the same column; off the last row it returns to the picker. */
  const onCellKeyDown = (e, index, field) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const below = gridRef.current?.querySelector(`[data-cell="${index + 1}:${field}"]`);
    if (below) below.focus();
    else pickRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit Price List' : 'Price List'}
          </DialogTitle>
        </DialogHeader>

        {/* Party / date / remarks */}
        <div className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-3">
          <div className="field sm:col-span-2">
            <label className="field-label mb-1.5 block">Party</label>
            <select
              className="field-select w-full"
              value={party}
              onChange={(e) => setParty(e.target.value)}
            >
              <option value="">Select Party</option>
              {parties.map((p) => (
                <option value={p._id} key={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label mb-1.5 block">Entry Date</label>
            <input
              type="date"
              className="field-input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field sm:col-span-3">
            <label className="field-label mb-1.5 block">Remarks</label>
            <input
              className="field-input w-full"
              placeholder="Optional note"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        {/* Item picker */}
        <datalist id="price-list-items">
          {pickable.map((it) => (
            <option value={it.name} key={it._id} />
          ))}
        </datalist>
        <div className="flex items-end gap-2">
          <div className="field flex-1">
            <label className="field-label mb-1.5 block">Add Item</label>
            <input
              ref={pickRef}
              list="price-list-items"
              className="field-input w-full"
              placeholder="Type or pick an item, then press Enter"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addItem(); }
              }}
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={addItem}>
            Add <span className="ml-1 opacity-60">Alt+A</span>
          </button>
        </div>

        {/* The grid */}
        <div className="table-wrap max-h-[48vh] overflow-auto" ref={gridRef}>
          <table className="data-table text-sm">
            <thead>
              <tr>
                <th className="w-12 text-center">S.No.</th>
                <th className="min-w-[14rem]">Item Name</th>
                <th className="w-24">Unit</th>
                <th className="w-28 text-right">Sale Price</th>
                <th className="w-28 text-right">MRP</th>
                <th className="w-24 text-right">Discount %</th>
                <th className="w-28 text-right">Net Rate</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    No items yet. Add one from the picker above.
                  </td>
                </tr>
              )}
              {rows.map((row, i) => {
                const net = netRate(row.salePrice, row.discount);
                const priced = row.salePrice !== '';
                return (
                  <tr
                    key={row.key}
                    onFocus={() => setActiveRow(i)}
                    className={i === activeRow ? 'bg-accent/40' : undefined}
                  >
                    <td className="num text-center text-muted-foreground">{i + 1}</td>
                    <td className="font-medium">{row.name}</td>
                    <td>
                      <input
                        data-cell={`${i}:unit`}
                        className="field-input field-input-sm w-full"
                        value={row.unit}
                        onChange={(e) => setCell(i, 'unit', e.target.value)}
                        onKeyDown={(e) => onCellKeyDown(e, i, 'unit')}
                      />
                    </td>
                    {['salePrice', 'mrp', 'discount'].map((field) => (
                      <td key={field}>
                        <input
                          type="number"
                          min="0"
                          max={field === 'discount' ? '100' : undefined}
                          step="0.01"
                          data-cell={`${i}:${field}`}
                          className="field-input field-input-sm num w-full text-right"
                          placeholder={field === 'salePrice' ? 'master' : '—'}
                          value={row[field]}
                          onChange={(e) => setCell(i, field, e.target.value)}
                          onKeyDown={(e) => onCellKeyDown(e, i, field)}
                        />
                      </td>
                    ))}
                    <td className="num text-right font-medium">
                      {priced ? net.toFixed(2) : ''}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        title="Remove item (Alt+E)"
                        aria-label={`Remove ${row.name}`}
                        className="text-destructive hover:opacity-70"
                        onClick={() => deleteRow(i)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            {rows.length} item{rows.length === 1 ? '' : 's'}. A blank Sale Price
            bills at the item master rate.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => onClose(false)}>
              Exit
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'} <span className="ml-1 opacity-60">Alt+S</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceListMaster;
