'use client'
import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [group, setGroup] = useState('');
  const [openBal, setOpenBal] = useState(0);
  const [lastBal, setLastBal] = useState(0);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState(0);
  const [phone, setPhone] = useState(0);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstIn, setGstIn] = useState('');
  const [stateCode, setStateCode] = useState(0);
  const [email, setEmail] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [pan, setPan] = useState('');
  const [bank, setBank] = useState(0);
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
          setOpenBal(d.openingBal || 0);
          setLastBal(d.lastBal || 0);
          setAddress(d.address || '');
          setPincode(d.pincode || 0);
          setPhone(d.phone || 0);
          setCity(d.city || '');
          setState(d.state || '');
          setGstIn(d.gstIn || '');
          setStateCode(d.stateCode || 0);
          setEmail(d.email || '');
          setAadhar(d.aadhar || '');
          setPan(d.pan || '');
          setBank(d.bank || 0);
          setInterest(d.interest || 0);
          setDiscount(d.discount || 0);
        })
        .catch(error => console.error('Error fetching customer data:', error));
    }
  }, [value]);

  const handleSave = async () => {
    const customerData = {
      id: id || undefined,
      name, short, group, openBal, lastBal, address, pincode, phone,
      city, state, gstIn, stateCode, email, aadhar, pan, bank, interest, discount
    };

    const endpoint = value ? '/api/customer-alter' : '/api/customer-add';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      alert(`Customer data ${value ? 'updated' : 'saved'} successfully!`);
      console.log(result);
    } catch (error) {
      console.error('Error saving customer data:', error);
      alert('Failed to save customer data.');
    }
  }

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Standard</TabsTrigger>
          <TabsTrigger value="password">Address</TabsTrigger>
        </TabsList>

        {/* Standard Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription>
                {value ? "Update customer details" : "Add new customer"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
              <div className='grid grid-cols-2 gap-2'>
                <div className="space-y-1">
                  <Label>Opening Balance</Label>
                  <Input type='number' value={openBal} onChange={e => setOpenBal(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Dr/Cr</Label>
                  <Input type='number' />
                </div>
                <div className="space-y-1">
                  <Label>Last Year Balance</Label>
                  <Input type='number' value={lastBal} onChange={e => setLastBal(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Dr/Cr</Label>
                  <Input type='number' />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="password">
          <Card className='w-[60vw] border-4 border-black'>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>
                {value ? "Edit address and contact" : "Enter address details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className='grid grid-cols-3 gap-3'>
                {[
                  { label: 'Address', val: address, fn: setAddress, type: 'text' },
                  { label: 'Pincode', val: pincode, fn: setPincode, type: 'number' },
                  { label: 'City', val: city, fn: setCity, type: 'text' },
                  { label: 'Phone', val: phone, fn: setPhone, type: 'number' },
                  { label: 'GSTIN', val: gstIn, fn: setGstIn, type: 'text' },
                  { label: 'State', val: state, fn: setState, type: 'text' },
                  { label: 'State Code', val: stateCode, fn: setStateCode, type: 'number' },
                  { label: 'Email', val: email, fn: setEmail, type: 'text' },
                  { label: 'PAN', val: pan, fn: setPan, type: 'text' },
                  { label: 'Aadhar', val: aadhar, fn: setAadhar, type: 'number' },
                  { label: 'Bank', val: bank, fn: setBank, type: 'number' },
                  { label: 'Discount', val: discount, fn: setDiscount, type: 'number' },
                  { label: 'Interest', val: interest, fn: setInterest, type: 'number' },
                ].map((field, idx) => (
                  <div className="space-y-1" key={idx}>
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type}
                      value={field.val}
                      onChange={e => field.fn(field.type === 'number' ? +e.target.value : e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
