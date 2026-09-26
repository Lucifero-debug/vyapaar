'use client'
import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toDisplay } from '@/lib/balance.mjs'
import { normalizeStateCode } from '@/lib/gst.mjs'
import { Button } from "../../components/ui/button"
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../../components/ui/tabs"

const PageContent = () => {
  const searchParams = useSearchParams();
  const value = searchParams.get('value');

  const [tab, setTab] = useState('account');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [group, setGroup] = useState('');
  const [openBal, setOpenBal] = useState(0);
  const [openingMode,setOpeningMode] = useState('')
  const [lastMode,setLastMode] = useState('')
  // Display only: what the books currently say this party owes.
  const [running, setRunning] = useState(null)
  const [lastBal, setLastBal] = useState(0);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState(0);
  const [phone, setPhone] = useState(0);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstIn, setGstIn] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [email, setEmail] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [pan, setPan] = useState('');
  const [dealerType,setDealerType] =useState("")
  const [bank, setBank] = useState('');
  const [interest, setInterest] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (value) {
      fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
        .then(res => res.json())
        .then(data => {
          const d = data.final;
          setId(d._id || '');
          setName(d.name || '');
          setShort(d.short || '');
          setGroup(d.group || '');
          // Stored balances are signed; the form edits magnitude + Dr/Cr.
          const opening  = toDisplay(d.openingBal);
          // The editable field is last year's closing balance (master data),
          // NOT the live running balance -- loading the latter here is what
          // let an unrelated edit write it straight back and clobber it.
          const lastYear = toDisplay(d.lastYearBal);
          setOpenBal(opening.amount);
          setLastBal(lastYear.amount);
          setRunning(toDisplay(d.lastBal));
          setAddress(d.address || '');
          setPincode(d.pincode || 0);
          setPhone(d.phone ?? null);
          setCity(d.city || '');
          setState(d.state || '');
          setGstIn(d.gstIn || '');
          setStateCode(normalizeStateCode(d.stateCode));
          setEmail(d.email || '');
          setAadhar(d.aadhar || '');
          setPan(d.pan || '');
          setBank(d.bank || 0);
          setInterest(d.interest || 0);
          setDiscount(d.discount || 0);
          setDealerType(d.dealerType || '')
          setOpeningMode(opening.mode);
          setLastMode(lastYear.mode)
        })
        .catch(error => console.error('Error fetching customer data:', error));
    }
  }, [value]);

  const handleSave = async () => {
    const customerData = {
      id: id || undefined,
      name, short, group, openBal, lastBal, address, pincode, phone,
      city, state, gstIn, stateCode, email, aadhar, pan, bank, interest, discount,openingMode,lastMode,dealerType
    };

    const endpoint = value ? '/api/customer-alter' : '/api/customer-add';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        // e.g. renaming onto a customer that already exists
        alert(result.error || result.message || 'Failed to save customer data.');
        return;
      }

      alert(`Customer data ${value ? 'updated' : 'saved'} successfully!`);
      console.log(result);
    } catch (error) {
      console.error('Error saving customer data:', error);
      alert('Failed to save customer data.');
    }
  }

  return (
<div className="page-shell">
  <header className="page-header">
    <div>
      <h1 className="page-title">Customer</h1>
      <p className="page-subtitle">Name, balances and address.</p>
    </div>
  </header>
  <Tabs value={tab} onValueChange={setTab} className="panel flex w-full flex-col overflow-hidden md:flex-row">
    {/* Tabs List */}
    <TabsList className="flex h-auto w-full shrink-0 flex-row gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-2 md:w-[210px] md:flex-col md:border-b-0 md:border-r">
      <TabsTrigger
        value="account"
        className="flex-1 justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none md:w-full md:flex-none md:justify-start"
      >
        Standard
      </TabsTrigger>
      <TabsTrigger
        value="password"
        className="flex-1 justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none md:w-full md:flex-none md:justify-start"
      >
        Address
      </TabsTrigger>
    </TabsList>

    {/* Tab Content */}
    <div className="flex-1 overflow-auto p-4 md:p-6">
      {/* Standard Tab */}
      <TabsContent value="account" className="h-full">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Standard</CardTitle>
            <CardDescription>
              {value ? "Update customer details" : "Add new customer"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="short">Short Name</Label>
              <Input id="short" value={short} onChange={e => setShort(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="group">Group</Label>
              <Input id="group" value={group} onChange={e => setGroup(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Opening Balance</Label>
                <Input type='number' value={openBal} onChange={e => setOpenBal(+e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Dr/Cr</Label>
                    <select
      value={openingMode}
      onChange={(e) => setOpeningMode(e.target.value)}
      className="field-select"
    >
      <option value="">Select</option>
      <option value="Dr">Debit</option>
      <option value="Cr">Credit</option>
    </select>
              </div>
              <div className="space-y-1">
                <Label>Last Year Balance</Label>
                <Input type='number' value={lastBal} onChange={e => setLastBal(+e.target.value)} />
                <p className="field-hint">Reference only. Does not affect the running balance.</p>
              </div>
              <div className="space-y-1">
                <Label>Dr/Cr</Label>
                    <select
      value={lastMode}
      onChange={(e) => setLastMode(e.target.value)}
      className="field-select"
    >
      <option value="">Select</option>
      <option value="Dr">Debit</option>
      <option value="Cr">Credit</option>
    </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-3 px-0 pb-0">
            {running ? (
              <div className="text-sm">
                <span className="field-label">Current balance</span>
                <p className="font-semibold tabular-nums text-foreground">
                  {running.amount.toFixed(2)} {running.mode}
                </p>
                <p className="field-hint">Maintained by invoices and vouchers.</p>
              </div>
            ) : (
              <span />
            )}
            <Button onClick={() => setTab('password')}>Next</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Address Tab */}
      <TabsContent value="password" className="h-full">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Address</CardTitle>
            <CardDescription>
              {value ? "Edit address and contact" : "Enter address details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Address', val: address, fn: setAddress, type: 'text' },
                { label: 'Pincode', val: pincode, fn: setPincode, type: 'number' },
                { label: 'City', val: city, fn: setCity, type: 'text' },
                { label: 'Phone', val: phone, fn: setPhone, type: 'number' },
                { label: 'GSTIN', val: gstIn, fn: setGstIn, type: 'text' },
                { label: 'State', val: state, fn: setState, type: 'text' },
                { label: 'State Code', val: stateCode, fn: (v) => setStateCode(v.replace(/\D/g, '').slice(0, 2)), type: 'text', inputMode: 'numeric', placeholder: 'e.g. 07' },
                { label: 'Email', val: email, fn: setEmail, type: 'text' },
                { label: 'PAN', val: pan, fn: setPan, type: 'text' },
                { label: 'Aadhar', val: aadhar, fn: setAadhar, type: 'text' },
                { label: 'Bank', val: bank, fn: setBank, type: 'text' },
                { label: 'Discount', val: discount, fn: setDiscount, type: 'number' },
                { label: 'Interest', val: interest, fn: setInterest, type: 'number' },
                { label: 'Dealer Type', val: dealerType, fn: setDealerType, type: 'text' },
              ].map((field, idx) => (
                <div className="space-y-1" key={idx}>
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type}
                    inputMode={field.inputMode}
                    placeholder={field.placeholder}
                    value={field.val}
                    onChange={e => field.fn(field.type === 'number' ? +e.target.value : e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end px-0 pb-0">
            <Button onClick={handleSave}>Save</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </div>
  </Tabs>
</div>



  );
};

const Page = () => (
  <Suspense fallback={<div className="page-shell text-sm text-muted-foreground">Loading...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
