'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'

const PageContent = () => {
  const searchParams = useSearchParams();
  const value = searchParams.get('value'); // `value` = item ID for edit mode

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
  const [id, setId] = useState('')
  const [hsnList, setHsnList] = useState([])

  // 🔄 Fetch HSN list
  useEffect(() => {
    const fetchHsn = async () => {
      try {
        const res = await fetch('/api/get-hsn');
        const data = await res.json();
        setHsnList(data.hsn || []);
      } catch (error) {
        console.error('Failed to fetch HSN:', error);
      }
    }
    fetchHsn();
  }, []);

  // ✏️ If editing existing item
  useEffect(() => {
    if (value) {
      fetch('/api/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
        .then(response => response.json())
        .then(res => {
          const data = res.final;
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

  // 💾 Save (add or alter)
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
      openBal,
      lastBal,
      id,
    };

    const endpoint = value ? '/api/item-alter' : '/api/item-add';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      console.log('Success:', result);
      alert(`Item ${value ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save item data.');
    }
  };

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Tabs defaultValue='account' className='w-[400px]'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='account'>Standard</TabsTrigger>
          <TabsTrigger value='password'>Advance</TabsTrigger>
        </TabsList>

        {/* Advance */}
        <TabsContent value='password'>
          <Card>
            <CardHeader>
              <CardTitle>Advance</CardTitle>
              <CardDescription>Financial details of the item.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='grid grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label>Opening Balance</Label>
                  <Input type='number' onChange={e => setOpenBal(+e.target.value || 0)} value={openBal} />
                </div>
                <div className='space-y-1'>
                  <Label>Dr/Cr</Label>
                  <Input type='number' />
                </div>
                <div className='space-y-1'>
                  <Label>Last Year Balance</Label>
                  <Input type='number' onChange={e => setLastBal(+e.target.value || 0)} value={lastBal} />
                </div>
                <div className='space-y-1'>
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

        {/* Standard */}
        <TabsContent value='account'>
          <Card className='w-[60vw] border-4 border-black -translate-x-10'>
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription>Basic details of the item.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='grid grid-cols-3 gap-3'>
                <InputField label="Name" value={name} onChange={setName} />
                <InputField label="Cost Price" type="number" value={cost} onChange={setCost} />
                <InputField label="Short Name" value={short} onChange={setShort} />
                <InputField label="Group" value={group} onChange={setGroup} />
                <div className='space-y-1'>
                  <Label htmlFor="hsn">HSN Code</Label>
                  <select
                    id="hsn"
                    className="w-full border border-gray-300 rounded px-2 py-2"
                    value={hsn}
                    onChange={(e) => {
                      const selectedHsn = hsnList.find(h => h.hsncode === e.target.value);
                      setHsn(selectedHsn?.hsncode || '');
                      setGst(selectedHsn?.gst || 0);
                    }}
                  >
                    <option value="">Select HSN</option>
                    {hsnList.map((item) => (
                      <option key={item._id} value={item.hsncode}>{item.hsncode}</option>
                    ))}
                  </select>
                </div>
                <InputField label="Unit" value={unit} onChange={setUnit} />
                <InputField label="Sale Price" type="number" value={salePrice} onChange={setSalePrice} />
                <InputField label="Item Type" value={itemType} onChange={setItemType} />
                <InputField label="MRP" type="number" value={mrp} onChange={setMrp} />
                <InputField label="Weight Per Qty" type="number" value={weight} onChange={setWeight} />
                <InputField label="Purchase Price" type="number" value={purchasePrice} onChange={setPurchasePrice} />
                <InputField label="Discount" type="number" value={discount} onChange={setDiscount} />
                <InputField label="GST%" type="number" value={gst} readOnly />
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

// 🔧 Reusable input field component
const InputField = ({ label, value, onChange, type = "text", readOnly = false }) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <Input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
    />
  </div>
);

const page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PageContent />
  </Suspense>
);

export default page;
