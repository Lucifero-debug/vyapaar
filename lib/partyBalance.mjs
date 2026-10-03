/**
 * Finding the live master record for whoever is selected on an invoice.
 *
 * Pure and dependency-free, like the rest of lib/*.mjs, so `node` can run the
 * test directly. Never import Mongoose or React in here.
 *
 * WHY THIS EXISTS
 * ---------------
 * The billing pages keep the chosen party in `selectedCustomer`, but that is
 * two different shapes depending on how you got there:
 *
 *   picking from the dropdown  ->  the full customer document, balance and all
 *   editing a saved invoice    ->  the invoice's embedded snapshot, which is
 *                                  only { name, phone, email, custId }
 *
 * So reading `selectedCustomer.lastBal` straight off would show a balance when
 * writing a new bill and nothing at all when opening an old one -- which reads
 * as data loss rather than as a missing join.
 */

/**
 * The party's master record, or null when there isn't one to show.
 *
 * Matches on `custId` first, because a name can have been corrected since the
 * invoice was written, then falls back to the name, because parties are joined
 * BY NAME everywhere else in this app and older snapshots predate `custId`.
 */
export const livePartyFor = (selected, customers = []) => {
  const name = selected?.name;
  if (!name) return null;

  const id = selected.custId || selected._id;
  const byId = id
    ? customers.find((c) => c?._id && String(c._id) === String(id))
    : null;

  return byId || customers.find((c) => c?.name === name) || null;
};
