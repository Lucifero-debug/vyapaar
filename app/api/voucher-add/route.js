import { connect } from '../../../lib/mongodb';
import Voucher from '../../../models/voucherModel';

export const GET = async () => {
  await connect();

  const vouchers = await Voucher.find().sort({ date: 1 });

  const ledgerMap = {};

  for (const v of vouchers) {
    const { date, acName, customers, paymentType } = v;

    // Add entry for the main account (cash or bank)
    if (!ledgerMap[acName]) ledgerMap[acName] = [];

    for (const c of customers) {
      const debit = c.debit || 0;
      const credit = c.credit || 0;

      // Add entry for each customer
      if (!ledgerMap[c.name]) ledgerMap[c.name] = [];

      ledgerMap[c.name].push({
        date,
        type: paymentType,   // cash or bank
        account: acName,
        debit,
        credit,
      });
    }

    // <-- Removed reverse entry code here -->
  }

  // Calculate running balance for each account
  const finalLedger = {};
  for (const [accountName, entries] of Object.entries(ledgerMap)) {
    let balance = 0;
    finalLedger[accountName] = entries.map((entry) => {
      balance += entry.debit - entry.credit;
      return {
        ...entry,
        balance,
      };
    });
  }

  return Response.json(finalLedger);
};
