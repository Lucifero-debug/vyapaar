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
const [customer,setCustomer]=useState([])
const [name,setName]=useState('')
const [short,setShort]=useState('')
const [group,setGroup]=useState('')
const [openBal,setOpenBal]=useState(0)
const [lastBal,setLastBal]=useState(0)
const [address,setAddress]=useState('')
const [pincode,setPincode]=useState(0)
const [phone,setPhone]=useState(0)
const [city,setCity]=useState('')
const [state,setState]=useState('')
const [gstIn,setGstIn]=useState('')
const [stateCode,setStateCode]=useState(0)
const [email,setEmail]=useState('')
const [aadhar,setAadhar]=useState('')
const [pan,setPan]=useState('')
const [bank,setBank]=useState(0)
const [interest,setInterest]=useState(0)
const [discount,setDiscount]=useState(0)

const handleSave=async()=>{
  const customerData = {
    name,
    group,
    openBal,
    lastBal,
    address,
    pincode,
    phone,
    city,
    state,
    gstIn,
    stateCode,
    email,
    aadhar,
    pan,
    bank,
    interest,
    discount,
    short,
  };

  try {
    const response = await fetch('/api/customer-add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      console.log(response)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Data saved successfully:', result);
    alert('Customer data saved successfully!');
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
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Standard</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" onChange={(e)=>setName(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Short Name</Label>
              <Input id="username" onChange={(e)=>setShort(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Group</Label>
              <Input id="username" onChange={(e)=>setGroup(e.target.value)}/>
            </div>
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
      <TabsContent value="password">
        <Card className='w-[60vw] border-4 border-black '>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className='grid grid-cols-3 gap-3'>
            <div className="space-y-1">
              <Label htmlFor="current">Address</Label>
              <Input id="current" type="text" onChange={(e)=>setAddress(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Pincode</Label>
              <Input id="new" type="number" onChange={(e)=>setPincode(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">City</Label>
              <Input id="new" type="text" onChange={(e)=>setCity(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Phone</Label>
              <Input id="new" type="phone" onChange={(e)=>setPhone(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">GSTIN</Label>
              <Input id="new" type="text" onChange={(e)=>setGstIn(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">State</Label>
              <Input id="new" type="text" onChange={(e)=>setState(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">State Code</Label>
              <Input id="new" type="number" onChange={(e)=>setStateCode(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Email</Label>
              <Input id="new" type="text" onChange={(e)=>setEmail(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">PAN</Label>
              <Input id="new" type="text" onChange={(e)=>setPan(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Aadhar</Label>
              <Input id="new" type="number" onChange={(e)=>setAadhar(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Bank</Label>
              <Input id="new" type="number" onChange={(e)=>setBank(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Discount</Label>
              <Input id="new" type="number" onChange={(e)=>setDiscount(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Interest</Label>
              <Input id="new" type="number" onChange={(e)=>setInterest(e.target.value)}/>
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