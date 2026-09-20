/**
 * Where money taken at the counter lands.
 *
 * An invoice can be part- or fully paid on the spot. That payment needs a real
 * account to sit in, or the cash leg has nowhere to go and the entry is
 * half-written. Vouchers already treat cash and bank as ordinary Customer docs
 * grouped under 'cash' / 'bank' (see the account pickers in /voucheradd), so
 * invoices use the same accounts rather than inventing a parallel notion.
 *
 * Resolution order, deliberately boring:
 *   1. the business's own cash account (group 'cash'), oldest first so the
 *      choice is stable across calls
 *   2. an account literally named 'Cash'
 *   3. create one
 *
 * `findCashAccount` never creates. Reversal paths use it: if no cash account
 * exists then no invoice can ever have posted cash, and conjuring one during a
 * delete would be surprising.
 */

import Customer from "../models/custModel";

export const CASH_ACCOUNT_NAME = "Cash";

export async function findCashAccount(session) {
  const byGroup = await Customer.findOne({ group: /^cash$/i }, null, { session })
    .sort({ _id: 1 })
    .exec();
  if (byGroup) return byGroup;

  return Customer.findOne({ name: CASH_ACCOUNT_NAME }, null, { session }).exec();
}

export async function resolveCashAccount(session) {
  const existing = await findCashAccount(session);
  if (existing) return existing;

  const [created] = await Customer.create(
    [
      {
        name: CASH_ACCOUNT_NAME,
        group: "Cash",
        openingBal: 0,
        openingMode: "Dr",
        lastBal: 0,
        lastMode: "Dr",
      },
    ],
    { session }
  );

  return created;
}
