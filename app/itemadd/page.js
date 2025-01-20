'use client'
import React, { useState } from 'react'
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

const page = () => {
const [hsn,setHsn]=useState('')
const [name,setName]=useState('')
const [short,setShort]=useState('')
const [group,setGroup]=useState('')
const [openBal,setOpenBal]=useState(0)
const [lastBal,setLastBal]=useState(0)
const [cost,setCost]=useState(0)
const [unit,setUnit]=useState(0)
const [salePrice,setSalePrice]=useState(0)
const [itemType,setItemType]=useState('')
const [weight,setWeight]=useState(0)
const [mrp,setMrp]=useState(0)
const [purchasePrice,setPurchasePrice]=useState(0)
const [gst,setGst]=useState(0)
const [discount,setDiscount]=useState(0)

const handleSave=async()=>{
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
  };

  try {
    const response = await fetch('/api/item-add', {
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
    console.log('Item Data saved successfully:', result);
    alert('Item data saved successfully!');
  } catch (error) {
    console.error('Error saving item data:', error);
    alert('Failed to save item data.');
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
              <Input id="username" type='number' onChange={(e)=>setOpenBal(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Dr/Cr</Label>
              <Input id="username" type='number'/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Last Year Balance</Label>
              <Input id="username" type='number' onChange={(e)=>setLastBal(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Dr/cr</Label>
              <Input id="username" type='number'/>
            </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Next</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="account">
        <Card className='w-[60vw] border-4 border-black '>
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
              <Input id="name" onChange={(e)=>setName(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="current">Cost Price</Label>
              <Input id="current" type="number" onChange={(e)=>setCost(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Short Name</Label>
              <Input id="username" type='text' onChange={(e)=>setShort(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Group</Label>
              <Input id="username" type='text' onChange={(e)=>setGroup(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">HSN-CODE</Label>
              <Input id="new" type="text" onChange={(e)=>setHsn(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Unit</Label>
              <Input id="new" type="text" onChange={(e)=>setUnit(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Sale Price</Label>
              <Input id="new" type="number" onChange={(e)=>setSalePrice(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Item Type</Label>
              <Input id="new" type="text" onChange={(e)=>setItemType(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">MRP</Label>
              <Input id="new" type="number" onChange={(e)=>setMrp(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Weight Per Qty</Label>
              <Input id="new" type="number" onChange={(e)=>setWeight(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Purchase Price</Label>
              <Input id="new" type="number" onChange={(e)=>setPurchasePrice(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Discount</Label>
              <Input id="new" type="number" onChange={(e)=>setDiscount(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">GST%</Label>
              <Input id="new" type="number" onChange={(e)=>setGst(e.target.value)}/>
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

export default page