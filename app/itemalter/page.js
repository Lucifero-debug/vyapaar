'use client'
import React, { Suspense, useEffect, useState } from 'react'
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { useSearchParams } from 'next/navigation'

const PageContent = () => {
  const [hsn, setHsn] = useState('')
  const [name, setName] = useState('')
  const [short, setShort] = useState('')
  const [group, setGroup] = useState('')
  const [openBal, setOpenBal] = useState(0)
  const [lastBal, setLastBal] = useState(0)
  const [cost, setCost] = useState(0)
  const [unit, setUnit] = useState(0)
  const [salePrice, setSalePrice] = useState(0)
  const [itemType, setItemType] = useState('')
  const [weight, setWeight] = useState(0)
  const [mrp, setMrp] = useState(0)
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [gst, setGst] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [id,setId]=useState('')

  const searchParams = useSearchParams();
  const value = searchParams.get('value');

  useEffect(() => {
    if (value) {
      fetch('/api/item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      })
        .then(response => response.json())
        .then(res => {
            const data=res.final
          setHsn(data.hsn || '')
          setName(data.name || '')
          setShort(data.short || '')
          setGroup(data.group || '')
          setOpenBal(data.openBal || 0)
          setLastBal(data.lastBal || 0)
          setCost(data.cost || 0)
          setUnit(data.unit || 0)
          setSalePrice(data.salePrice || 0)
          setItemType(data.itemType || '')
          setWeight(data.weight || 0)
          setMrp(data.mrp || 0)
          setPurchasePrice(data.purchasePrice || 0)
          setGst(data.gst || 0)
          setDiscount(data.discount || 0)
          setId(data._id)
        })
        .catch(error => console.error('Error fetching item data:', error));
    }
  }, [value]);

  const handleSave = async () => {
    const itemData = {
      name,
      group,
      hsn,
      cost,
      unit,
      salePrice,
      itemType,
      weight,
      mrp,
      purchasePrice,
      gst,
      discount,
      id
    };

    try {
      const response = await fetch('/api/item-alter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        console.log(response)
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Item Data updated successfully:', result);
      alert('Item data updated successfully!');
    } catch (error) {
      console.error('Error updating item data:', error);
      alert('Failed to update item data.');
    }
  }

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Standard</TabsTrigger>
          <TabsTrigger value="password">Advance</TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Advance</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className='grid grid-cols-2 gap-2'>
                <div className="space-y-1">
                  <Label htmlFor="username">Opening Balance</Label>
                  <Input id="username" type='number' onChange={(e) => setOpenBal(parseFloat(e.target.value) || 0)} value={openBal} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Dr/Cr</Label>
                  <Input id="username" type='number' />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Last Year Balance</Label>
                  <Input id="username" type='number' onChange={(e) => setLastBal(parseFloat(e.target.value) || 0)} value={lastBal} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Dr/cr</Label>
                  <Input id="username" type='number' />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card className='w-[60vw] border-4 border-black'>
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className='grid grid-cols-3 gap-3'>
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" onChange={(e) => setName(e.target.value)} value={name} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="current">Cost Price</Label>
                  <Input id="current" type="number" onChange={(e) => setCost(parseFloat(e.target.value) || 0)} value={cost} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Short Name</Label>
                  <Input id="username" type='text' onChange={(e) => setShort(e.target.value)} value={short} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Group</Label>
                  <Input id="username" type='text' onChange={(e) => setGroup(e.target.value)} value={group} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">HSN-CODE</Label>
                  <Input id="new" type="text" onChange={(e) => setHsn(e.target.value)} value={hsn} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Unit</Label>
                  <Input id="new" type="text" onChange={(e) => setUnit(e.target.value)} value={unit} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Sale Price</Label>
                  <Input id="new" type="number" onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)} value={salePrice} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Item Type</Label>
                  <Input id="new" type="text" onChange={(e) => setItemType(e.target.value)} value={itemType} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">MRP</Label>
                  <Input id="new" type="number" onChange={(e) => setMrp(parseFloat(e.target.value) || 0)} value={mrp} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Weight Per Qty</Label>
                  <Input id="new" type="number" onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} value={weight} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Purchase Price</Label>
                  <Input id="new" type="number" onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)} value={purchasePrice} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Discount</Label>
                  <Input id="new" type="number" onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} value={discount} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">GST%</Label>
                  <Input id="new" type="number" onChange={(e) => setGst(parseFloat(e.target.value) || 0)} value={gst} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default page
