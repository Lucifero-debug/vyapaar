// components/PurchaseReturnSearchParams.jsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function InvoiceSearchParams({ onValue }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const value = searchParams.get('value');
    if (value && onValue) onValue(value);
    console.log("value",value)
  }, [searchParams, onValue]);

  return null;
}
