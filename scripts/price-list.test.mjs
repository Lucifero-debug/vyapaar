/**
 * Fixture tests for party price lists.
 *
 *   node scripts/price-list.test.mjs
 *
 * A row carries ONE discount, like an invoice line. Lists saved when the
 * screen had three successive discounts must keep billing what they billed,
 * so their chain is collapsed -- not added up. Everything else here guards
 * the fallback rules -- which figure wins when the list has one and the item
 * master has another.
 */

import assert from "node:assert/strict";
import {
  cleanPriceListItems,
  netRate,
  priceListLabel,
  resolveItemPricing,
  resolveItemRate,
  rowDiscount,
  latestPriceListFor,
} from "../lib/priceList.mjs";

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  ok    ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}\n        ${err.message}`);
    process.exitCode = 1;
  }
};

const ITEM = { _id: "item1", name: "Angle Valve", unit: "PCS", salePrice: 100, mrp: 150, discount: 4 };
const listWith = (row) => ({ items: [{ itemId: "item1", ...row }] });

console.log("\n--- the discount ---");

test("the discount comes off the rate", () => {
  assert.equal(netRate(100, 10), 90);
  assert.equal(netRate(250.75, 0), 250.75);
  assert.equal(netRate(100, ""), 100);
});

test("the discount can never take more than the whole amount", () => {
  assert.equal(netRate(100, 100), 0);
  assert.equal(netRate(100, 150), 0, "over 100% is capped");
  assert.equal(netRate(100, -10), 100, "a negative discount must not inflate the rate");
});

test("a row's discount is read as one figure", () => {
  assert.equal(rowDiscount({ discount: 12.5 }), 12.5);
  assert.equal(rowDiscount({ discount: "" }), 0);
  assert.equal(rowDiscount(null), 0);
});

test("an old three-discount row collapses into one, not added up", () => {
  // 100 -> 90 -> 85.50 -> 83.79, an effective 16.21%. Added up it would be 17%.
  assert.equal(rowDiscount({ dis1: 10, dis2: 5, dis3: 2 }), 16.21);
  assert.equal(rowDiscount({ dis1: 10, dis2: 0, dis3: 0 }), 10);
  assert.equal(rowDiscount({ dis1: 100, dis2: 50, dis3: 50 }), 100);
});

test("a row's own discount wins over any leftover old chain", () => {
  assert.equal(rowDiscount({ discount: 5, dis1: 10, dis2: 5, dis3: 2 }), 5);
});

console.log("\n--- which figure wins ---");

test("a listed rate beats the item master", () => {
  const p = resolveItemPricing(ITEM, listWith({ salePrice: 88 }));
  assert.equal(p.rate, 88);
  assert.equal(p.source, "list");
});

test("a blank listed rate falls back to the master, and 0 does not", () => {
  assert.equal(resolveItemPricing(ITEM, listWith({ salePrice: null })).rate, 100);
  assert.equal(resolveItemPricing(ITEM, listWith({ salePrice: 0 })).rate, 0,
    "an item priced at zero is free, not unpriced");
});

test("a row with only a discount still bills at the master rate", () => {
  const p = resolveItemPricing(ITEM, listWith({ salePrice: null, discount: 10 }));
  assert.equal(p.rate, 100);
  assert.equal(p.discount, 10);
});

test("an old three-discount row still bills its collapsed discount", () => {
  const p = resolveItemPricing(ITEM, listWith({ salePrice: 100, dis1: 10, dis2: 5, dis3: 2 }));
  assert.equal(p.discount, 16.21);
});

test("a row with no discount keeps the master's discount", () => {
  const p = resolveItemPricing(ITEM, listWith({ salePrice: 88 }));
  assert.equal(p.discount, 4, "the item master's own discount should carry through");
});

test("an item absent from the list bills entirely from the master", () => {
  const p = resolveItemPricing(ITEM, { items: [{ itemId: "somethingElse", salePrice: 1 }] });
  assert.deepEqual(
    { rate: p.rate, discount: p.discount, source: p.source },
    { rate: 100, discount: 4, source: "master" }
  );
});

test("no price list at all bills from the master", () => {
  const p = resolveItemPricing(ITEM, null);
  assert.equal(p.rate, 100);
  assert.equal(p.discount, 4);
});

test("lists saved before the discount columns existed still bill correctly", () => {
  // Those rows called the rate `price`.
  assert.equal(resolveItemRate(ITEM, { items: [{ itemId: "item1", price: 77 }] }), 77);
});

console.log("\n--- what gets stored ---");

test("blank rows and rows with no item are dropped", () => {
  const rows = cleanPriceListItems([
    { itemId: "a", name: "A", salePrice: 10 },
    { itemId: "", name: "typed but never picked", salePrice: 99 },
    { itemId: "b", name: "B", salePrice: "", mrp: "", discount: "", unit: "" },
    null,
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].itemId, "a");
});

test("a row carrying only a discount is kept", () => {
  const rows = cleanPriceListItems([{ itemId: "a", name: "A", salePrice: "", discount: 5 }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].salePrice, null, "blank stays blank, meaning 'use the master'");
  assert.equal(rows[0].discount, 5);
});

test("the same item twice keeps only the first row", () => {
  const rows = cleanPriceListItems([
    { itemId: "a", name: "A", salePrice: 10 },
    { itemId: "a", name: "A again", salePrice: 20 },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].salePrice, 10);
});

test("the stored discount is clamped to something sane", () => {
  const rows = cleanPriceListItems([
    { itemId: "a", salePrice: 10, discount: -5 },
    { itemId: "b", salePrice: 10, discount: 150 },
    { itemId: "c", salePrice: 10, discount: "x" },
  ]);
  assert.deepEqual(rows.map((r) => r.discount), [0, 100, 0]);
});

test("only the single discount is stored; an old chain sent in is collapsed", () => {
  const [row] = cleanPriceListItems([{ itemId: "a", salePrice: 10, dis1: 10, dis2: 5, dis3: 2 }]);
  assert.equal(row.discount, 16.21);
  assert.equal("dis1" in row || "dis2" in row || "dis3" in row, false);
});

test("negative and non-numeric rates are not stored", () => {
  const rows = cleanPriceListItems([
    { itemId: "a", salePrice: -1 },
    { itemId: "b", salePrice: "abc" },
    { itemId: "c", salePrice: "8" },
  ]);
  assert.deepEqual(rows.map((r) => [r.itemId, r.salePrice]), [["a", 0], ["b", 0], ["c", 8]]);
});

test("a row still using the old `price` name is carried over", () => {
  const [row] = cleanPriceListItems([{ itemId: "a", name: "Pen", price: 8 }]);
  assert.equal(row.salePrice, 8);
});

console.log("\n--- picking a list ---");

test("a list is labelled by party and date", () => {
  assert.equal(
    priceListLabel({ partyName: "Sharma Traders", date: "2026-09-25" }),
    "Sharma Traders \u00b7 25-09-2026"
  );
});

test("a party gets their most recent list", () => {
  const lists = [
    { _id: "old", party: "p1", date: "2026-01-01" },
    { _id: "new", party: "p1", date: "2026-09-01" },
    { _id: "other", party: "p2", date: "2026-12-01" },
  ];
  assert.equal(latestPriceListFor(lists, "p1")._id, "new");
  assert.equal(latestPriceListFor(lists, "nobody"), null);
  assert.equal(latestPriceListFor(lists, undefined), null);
});

console.log(`\n  ${passed} checks passed\n`);
