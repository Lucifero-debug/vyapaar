/**
 * The business's own details, in ONE place.
 *
 * These used to be typed into five different files, and they disagreed: the
 * invoice printed "Prashant Enterprise" with a placeholder GSTIN, while the
 * ledger, stock report and voucher register printed "SURYAVANSH TEXTILES".
 * A customer receiving a bill and a statement got two different companies.
 *
 * Everything that puts the firm's name on a document reads it from here.
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  FILL IN `gstin` AND `phone` BEFORE SHOWING THIS TO ANYONE.
 *  Blank fields are simply not printed, so nothing false goes out — but a
 *  GST invoice without a GSTIN is not a valid tax invoice.
 * ──────────────────────────────────────────────────────────────────────────
 */

export const COMPANY = {
  name: "SURYAVANSH TEXTILES",

  addressLines: [
    "LIG FLATS NO.68, IIIRD FLOOR",
    "SARITA VIHAR, NEW DELHI-110076",
  ],

  // Your 15-character GSTIN, e.g. "07ABCDE1234F1Z5". Left blank on purpose:
  // the placeholder that used to sit here was not a real number.
  gstin: "",

  // e.g. "+91 98111 22233"
  phone: "",

  // Shown on the invoice header. Replace public/logo.jpg with your own.
  logo: "/logo.jpg",
};

/** The address as one line, for report headers. */
export const companyAddress = () => COMPANY.addressLines.join(", ");

/** True when a detail is worth printing. Keeps blanks off the document. */
export const has = (value) => Boolean(value && String(value).trim());
