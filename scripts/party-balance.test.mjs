/**
 * Fixture tests for the party balance shown on the billing pages.
 *
 *   node scripts/party-balance.test.mjs
 *
 * The thing worth guarding is that the balance resolves in BOTH shapes the
 * billing pages put in `selectedCustomer`: the full master document when the
 * party is picked from the dropdown, and the invoice's embedded
 * { name, phone, email, custId } snapshot when a saved invoice is reopened.
 * The snapshot carries no balance, so a naive `selectedCustomer.lastBal` shows
 * a figure while writing a bill and a blank while editing one.
 */

import assert from "node:assert/strict";
import { livePartyFor } from "../lib/partyBalance.mjs";
import { formatINR } from "../lib/currency.mjs";
import { toDisplay } from "../lib/balance.mjs";

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

// The master, in the shape /api/get-customer returns it.
const MASTER = [
  { _id: "aaa", name: "Ramesh Traders", lastBal: 1500, lastMode: "Dr" },
  { _id: "bbb", name: "Verma Textiles", lastBal: -2400.5, lastMode: "Cr" },
  { _id: "ccc", name: "Settled Party", lastBal: 0, lastMode: "Dr" },
  { _id: "ddd", name: "Never Traded" },
];

/** Exactly what <PartyBalance> ends up putting on screen. */
const shown = (selected, customers = MASTER) => {
  const live = livePartyFor(selected, customers);
  if (!live) return null;
  const { amount, mode } = toDisplay(live.lastBal);
  return amount === 0 ? "settled" : `${formatINR(amount)} ${mode}`;
};

console.log("\n--- picked from the dropdown: the full master document ---");

test("a party that owes us reads Dr", () => {
  assert.equal(shown(MASTER[0]), "₹1,500.00 Dr");
});

test("a party we owe reads Cr", () => {
  assert.equal(shown(MASTER[1]), "₹2,400.50 Cr");
});

test("a zero balance says settled, not Rs 0.00 Dr", () => {
  assert.equal(shown(MASTER[2]), "settled");
});

test("a party that has never traded says settled", () => {
  // No lastBal field at all, which is what a freshly seeded party looks like.
  assert.equal(shown(MASTER[3]), "settled");
});

console.log("\n--- reopened invoice: only the embedded snapshot ---");

test("the snapshot resolves by custId", () => {
  const snapshot = { name: "Ramesh Traders", phone: "9876543210", email: "", custId: "aaa" };
  assert.equal(shown(snapshot), "₹1,500.00 Dr");
});

test("a snapshot written before custId existed resolves by name", () => {
  assert.equal(shown({ name: "Verma Textiles" }), "₹2,400.50 Cr");
});

test("custId wins when the snapshot's name is stale", () => {
  // The party was renamed after this invoice was written.
  assert.equal(shown({ name: "Ramesh Trdrs", custId: "aaa" }), "₹1,500.00 Dr");
});

test("a stale custId falls back to a name that still matches", () => {
  assert.equal(shown({ name: "Ramesh Traders", custId: "zzz" }), "₹1,500.00 Dr");
});

test("custId beats a name that now belongs to somebody else", () => {
  // "Ramesh Traders" was renamed, and a DIFFERENT party later took that name.
  // Matching on the name first would put the new party's balance on the old
  // party's invoice -- the wrong figure, shown confidently.
  const master = [
    { _id: "aaa", name: "Ramesh Enterprises", lastBal: 1500 },
    { _id: "nnn", name: "Ramesh Traders", lastBal: -9999 },
  ];
  assert.equal(shown({ name: "Ramesh Traders", custId: "aaa" }, master), "\u20B91,500.00 Dr");
});

test("an id that is an ObjectId rather than a string still matches", () => {
  // Anything that did not come through JSON hands over an ObjectId, which is
  // never === a string.
  const objectId = { toString: () => "aaa" };
  const master = [{ _id: objectId, name: "Ramesh Traders", lastBal: 1500 }];
  assert.equal(shown({ name: "someone else", custId: "aaa" }, master), "\u20B91,500.00 Dr");
});

console.log("\n--- nothing to show beats a confident zero ---");

test("no party selected shows nothing", () => {
  assert.equal(shown({}), null);
  assert.equal(shown(undefined), null);
  assert.equal(shown({ name: "" }), null);
});

test("a party no longer in the master shows nothing", () => {
  assert.equal(shown({ name: "Deleted Party", custId: "xxx" }), null);
});

test("an empty or missing master shows nothing", () => {
  assert.equal(shown(MASTER[0], []), null);
  assert.equal(livePartyFor({ name: "Ramesh Traders" }), null);
});

console.log("\n--- Dr/Cr follows the sign, not the cache ---");

test("a drifted lastMode cache does not decide the label", () => {
  // lastBal says we owe them; the cache wrongly says Dr. The sign wins.
  const drifted = [{ _id: "eee", name: "Drifted", lastBal: -900, lastMode: "Dr" }];
  assert.equal(shown({ name: "Drifted" }, drifted), "₹900.00 Cr");
});

console.log("\n--- rupees are grouped the Indian way ---");

test("lakhs group as 12,34,567.50 and not 1,234,567.50", () => {
  const big = [{ _id: "fff", name: "Big Co", lastBal: 1234567.5 }];
  assert.equal(shown({ name: "Big Co" }, big), "₹12,34,567.50 Dr");
});

test("formatINR never prints NaN at a customer", () => {
  assert.equal(formatINR(undefined), "₹0.00");
  assert.equal(formatINR("abc"), "₹0.00");
  assert.equal(formatINR(null), "₹0.00");
});

console.log(`\n  ${passed} checks passed\n`);
