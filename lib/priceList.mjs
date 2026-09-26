/**
 * Party price lists: what an item costs THIS customer, and the discount chain
 * that goes with it.
 *
 * A row mirrors the price-list screen the shop already knows:
 *
 *   Item Name | Unit | Sale Price | MRP | Dis 1 % | Dis 2 % | Dis 3 %
 *
 * THE DISCOUNT CHAIN IS SUCCESSIVE, NOT ADDED UP
 * ----------------------------------------------
 * Each percentage comes off what is left after the one before it, which is how
 * a trade discount chain works: 10 / 5 / 2 on a rate of 100 is
 *
 *     100 -> 90.00 -> 85.50 -> 83.79
 *
 * not 100 - 17% = 83.00. The two differ by more the bigger the discounts get,
 * so the rule lives here on its own and is read by the billing pages rather
 * than reimplemented beside each of them.
 *
 * An invoice line carries ONE discount percentage, so the chain is collapsed
 * into a single effective percentage before it is billed -- 16.21 in the
 * example above. That percentage is rounded to 2dp and the line's amount is
 * then derived FROM the rounded figure, so the discount printed on the invoice
 * always reconciles with the money beside it.
 *
 * Kept free of Mongoose: the billing pages are client components and import
 * this directly.
 */

import { round2 } from "./balance.mjs";

/** A percentage that cannot be negative or take more than the whole amount. */
const pct = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, 100);
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const blank = (value) => value === "" || value === null || value === undefined;

/**
 * The three percentages as one.
 *
 *   cascadeDiscount(10, 5, 2) === 16.21
 *
 * Rounded to 2dp because that is what ends up on the invoice line.
 */
export function cascadeDiscount(dis1, dis2, dis3) {
  const remaining = [dis1, dis2, dis3].reduce(
    (factor, d) => factor * (1 - pct(d) / 100),
    1
  );
  return round2((1 - remaining) * 100);
}

/** The same chain, as a rate. Derived from the rounded percentage so the
 *  invoice's discount column and its amount column agree. */
export function netRate(salePrice, dis1, dis2, dis3) {
  const gross = num(salePrice);
  return round2(gross - (gross * cascadeDiscount(dis1, dis2, dis3)) / 100);
}

/** A row is worth storing once it names an item and carries any figure.
 *  `price` is the old name for the rate and is still accepted on the way in. */
const rowHasContent = (row) =>
  !blank(row.salePrice) ||
  !blank(row.price) ||
  !blank(row.mrp) ||
  !blank(row.dis1) ||
  !blank(row.dis2) ||
  !blank(row.dis3) ||
  !blank(row.unit);

/**
 * Normalise what the form sends: drop empty and duplicate rows, coerce the
 * numbers, and keep nothing that does not name an item.
 *
 * A row with an item but a blank Sale Price is still kept -- it may carry only
 * a discount, and the rate then comes from the item master.
 */
export function cleanPriceListItems(items) {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const out = [];

  for (const row of items) {
    if (!row || !row.itemId) continue;
    if (!rowHasContent(row)) continue;

    const key = String(row.itemId);
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      itemId: row.itemId,
      name: row.name,
      unit: row.unit || "",
      // Blank stays blank: it means "bill at the item master's rate". A row
      // still using the old `price` name is carried over to `salePrice`.
      salePrice: !blank(row.salePrice)
        ? num(row.salePrice)
        : !blank(row.price)
          ? num(row.price)
          : null,
      mrp: blank(row.mrp) ? null : num(row.mrp),
      dis1: pct(row.dis1),
      dis2: pct(row.dis2),
      dis3: pct(row.dis3),
    });
  }

  return out;
}

/** This party's row for an item, or null. */
export function findPriceListRow(item, priceList) {
  if (!item || !priceList) return null;
  return (
    (priceList.items || []).find(
      (row) => String(row.itemId) === String(item._id)
    ) || null
  );
}

/**
 * Everything a billing line needs for one item.
 *
 * Falls back to the item master field by field, so a row that sets only a
 * discount still bills at the master rate, and a row that sets only a rate
 * still picks up the master's discount.
 */
export function resolveItemPricing(item, priceList) {
  const masterRate = num(item?.salePrice);
  const masterDiscount = pct(item?.discount);
  const row = findPriceListRow(item, priceList);

  if (!row) {
    return {
      rate: masterRate,
      discount: masterDiscount,
      mrp: num(item?.mrp),
      unit: item?.unit || "",
      source: "master",
    };
  }

  // `price` is what rows were called before the screen grew its discount
  // columns; read it so lists saved then still bill correctly.
  const listed = row.salePrice ?? row.price;
  const hasChain = pct(row.dis1) || pct(row.dis2) || pct(row.dis3);

  return {
    rate: blank(listed) ? masterRate : num(listed),
    discount: hasChain
      ? cascadeDiscount(row.dis1, row.dis2, row.dis3)
      : masterDiscount,
    mrp: blank(row.mrp) ? num(item?.mrp) : num(row.mrp),
    unit: row.unit || item?.unit || "",
    source: "list",
  };
}

/**
 * The rate alone. Kept because the billing pages called this before pricing
 * grew into an object; `resolveItemPricing` is what new code should use.
 */
export function resolveItemRate(item, priceList) {
  return resolveItemPricing(item, priceList).rate;
}

/** "Party · 25-09-2026", used wherever a price list is picked from a list. */
export function priceListLabel(priceList) {
  const d = priceList?.date ? new Date(priceList.date) : null;
  const date = d && !Number.isNaN(d.getTime())
    ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`
    : "";
  return [priceList?.partyName || "Unknown party", date].filter(Boolean).join(" · ");
}

/** The party's most recent price list, or null. */
export function latestPriceListFor(priceLists, partyId) {
  if (!partyId) return null;
  return (priceLists || [])
    .filter((pl) => String(pl.party) === String(partyId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}
