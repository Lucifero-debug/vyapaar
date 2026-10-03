'use client'

import { toDisplay } from '@/lib/balance.mjs'
import { formatINR } from '@/lib/currency.mjs'
import { livePartyFor } from '@/lib/partyBalance.mjs'

/**
 * The selected party's running balance, shown under the customer picker on the
 * billing pages so whoever is writing the bill can see what is already
 * outstanding without leaving the screen for the ledger.
 *
 * This is the party's CURRENT balance: on a new invoice that is the amount
 * outstanding BEFORE this bill, and on an invoice being edited it already
 * includes that invoice's own posting.
 *
 * Dr/Cr is read off the SIGN of `lastBal` via toDisplay(), never off the
 * `lastMode` cache, which is the field that drifts.
 */
export default function PartyBalance({ selected, customers = [] }) {
  const live = livePartyFor(selected, customers)

  // Nothing selected, or a party that is on an old invoice but no longer in
  // the master. Show nothing rather than a confident zero.
  if (!live) return null

  const { amount, mode } = toDisplay(live.lastBal)

  if (amount === 0) {
    return <p className='field-hint mt-1'>Current balance: settled</p>
  }

  return (
    <p className='field-hint mt-1'>
      Current balance:{' '}
      <span
        className={
          mode === 'Dr'
            ? 'font-medium tabular-nums text-success'
            : 'font-medium tabular-nums text-destructive'
        }
      >
        {formatINR(amount)} {mode}
      </span>{' '}
      {mode === 'Dr' ? '(owes you)' : '(you owe)'}
    </p>
  )
}
