'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
  

const page = () => {
    const router=useRouter()

    const [invoiceNo, setInvoiceNo] = useState(4)
    const [date, setDate] = useState('')
    const [customer, setCustomer] = useState([])
    const [selectedCustomer,setSelectedCustomer]=useState({})
    const [phone, setPhone] = useState('')
    const [totalAmount, setTotalAmount] = useState(0)
    const [received, setReceived] = useState('')
    const [balanceDue, setBalanceDue] = useState('')
    const [paymentType, setPaymentType] = useState('Cash')
    const [stateOfSupply, setStateOfSupply] = useState('Delhi')
    const [url,setUrl]=useState('')
    const [item,setItem]=useState([])
    const [gst,setGst]=useState(0)
const [selectedItem,setSelectedItem]=useState([])
    const [itemName, setItemName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [rate, setRate] = useState('')
    const [discount, setDiscount] = useState('')
    const [taxType, setTaxType] = useState('local');

    const handleRemove=(indexToRemove)=>{
      const updatedItems = selectedItem.filter((_, index) => index !== indexToRemove);
      setSelectedItem(updatedItems);
      localStorage.setItem('invoiceItems', JSON.stringify(updatedItems)); 
      const newTotal = updatedItems.reduce((acc, curr) => acc + curr.total, 0);
      setTotalAmount(newTotal.toFixed(2));
    }

    useEffect(()=>{
      const fetchItem=async()=>{
      try {
        const response=await fetch('/api/get-item')
        const result=await response.json()
        setItem(result.item)
      } catch (error) {
        console.error('Error fetching Item data:', error);
        alert('Failed to fetch item.');
      }
      }
      const fetchCust=async()=>{
        try {
          const response=await fetch('/api/get-customer')
          const result=await response.json()
          setCustomer(result.customer)
        } catch (error) {
          console.error('Error fetching Customer data:', error);
          alert('Failed to fetch customer.');
        }
      }
      fetchCust()
 fetchItem()
},[])

console.log("intelligence",customer)

    // Save and navigate to invoice page
    const handleSave = () => {
      const encodedItems = encodeURIComponent(JSON.stringify(selectedItem));
const phone=selectedCustomer.phone

      const query = new URLSearchParams({
        invoiceNo,
        date,
        customer:selectedCustomer.name,
        phone,
        totalAmount,
        received,
        balanceDue,
        paymentType,
        stateOfSupply,
        taxType,
        gst,
        items: encodedItems,
      }).toString()

     
      localStorage.removeItem('invoiceItems');
      setSelectedItem([]);
      router.push(`/invoice?${query}`);
    }
    useEffect(() => {
      const calculateTotal = () => {
          const total = selectedItem.reduce((acc, curr) => acc + (curr.total || 0), 0);
          console.log("Calculated Total Amount:", total);
          setTotalAmount(total.toFixed(2));
      };
  
      calculateTotal();
  }, [selectedItem]);
    
    useEffect(() => {
      // Load saved items from localStorage
      const savedItems = localStorage.getItem('invoiceItems');
      if (savedItems) {
        setSelectedItem(JSON.parse(savedItems));
      }
    }, []);
    const handleTaxTypeChange = (e) => {
      setTaxType(e.target.value);
    };

    useEffect(() => {
        const calculatedBalance = totalAmount - received;
        setBalanceDue(isNaN(calculatedBalance) ? '' : calculatedBalance);
      }, [totalAmount, received]);

      const saveItem = (e) => {
    
        const selectedName = e.target.value;
        const selectedItems = item.find((i) => i.name === selectedName);
      
        if (selectedItems) {
            const rateValue = rate || selectedItems.cost;
            const quantityValue = quantity || 1;
      
            const newItem = {
              ...selectedItems,
              quantity: quantityValue,
              cost: rateValue ||2,
              discount: discount || 0,
              total: (rateValue * quantityValue) - ((rateValue * quantityValue) * (discount || 0) / 100),
            };
      
            const updatedItems = [...selectedItem, newItem];
            setSelectedItem(updatedItems);
            localStorage.setItem('invoiceItems', JSON.stringify(updatedItems));
          
        }
      
        setItemName('');
        setQuantity('');
        setRate('');
        setDiscount('');
      };

  return (
    <div className='flex flex-col gap-4' id='invoice'>
<div className='flex bg white w-full h-[12vh] mt-4 justify-between'>
    <div className='flex flex-col'>
        <label className='bg-white text-gray-400'>Invoice No:</label>
<input type='number' className='h-7 bg-white p-3 border-2 border-black' onChange={(e)=>setInvoiceNo(e.target.value)}/>
    </div>
    <div className='flex flex-col'>
        <label className='bg-white text-gray-400'>Date</label>
<input type='date' className='h-7 bg-white' onChange={(e)=>setDate(e.target.value)}/>
    </div>
</div>
<div className='w-full h-[24vh] bg-white p-3 gap-3 grid grid-cols-2'>
<select value={selectedCustomer.name} onChange={(e) => {
    const selectedName = e.target.value;
    const customers = customer.find(cust => cust.name === selectedName);
    setSelectedCustomer(customers); // Set the full customer object
    console.log("pout",selectedCustomer)
}}>
  {customer.map((cust) => (
    <option value={cust.name} key={cust.id}>{cust.name}</option>
  ))}
</select>
    <input className='w-full border-2 border-black bg-white' placeholder='Phone Number' value={selectedCustomer.phone ||'erie'} readOnly/>
    <input className='w-full border-2 border-black bg-white' placeholder='Email' value={selectedCustomer.email} readOnly/>
   <select  value={itemName}
    onChange={(e) => {
        setItemName(e.target.value);
        saveItem(e);
    }}>
       <option value="">Select an Item</option>
    {item.map((items)=>(
      <option value={items.name} key={items.id}>
      {items.name}</option>
    ))}
   </select>
</div>
<div className='w-full flex gap-3 h-[22vh]'>
<div className='bg-gray-400 w-[50%] h-[20vh] flex flex-col gap-3 p-3'>
    <div className='flex justify-between bg-gray-400'>
        <h2 className='bg-gray-400'>Total Amount</h2>
        <input type='number' className='bg-gray-400 text-white border-2 border-black' value={totalAmount}/>
    </div>
    <div className='flex justify-between bg-gray-400'>
        <h2 className='bg-gray-400'>Received</h2>
        <input type='number' className='bg-gray-400 text-white border-2 border-black' onChange={(e)=>setReceived(e.target.value)}/>
    </div>
    <div className='flex justify-between bg-gray-400'>
        <h2 className='bg-gray-400'>Balance Due</h2>
        <input type='number' className='bg-gray-400 text-white border-2 border-black'  value={balanceDue}
          readOnly/>
    </div>
</div>
<div className='bg-white w-[50%] h-[20vh] p-3 flex flex-col gap-4'>
<div className='flex justify-between bg-white'>
        <h2 className='bg-white'>Payment Type</h2>
        <select className='bg-white' value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}>
            <option value='Cash' className='bg-white'>Cash</option>
            <option value='Cheque' className='bg-white'>Cheque</option>
        </select>
    </div>
    <div className='flex justify-between bg-white'>
    <h2 className='bg-white'>State Of Supply</h2>
        <select className='bg-white' value={paymentType}
            onChange={(e) => setStateOfSupply(e.target.value)}>
            <option value='delhi' className='bg-white'>Delhi</option>
            <option value='mumbai'>Mumbai</option>
            <option value='jaipur'>Jaipur</option>
        </select>
    </div>
    <div className='flex justify-between h-full'>
        <div className='flex gap-2 items-center'>
    <label htmlFor='local'>Local</label>
    <input type='radio' id='local' name='location' className='w-5 h-5' checked={taxType === 'local'}
      onChange={handleTaxTypeChange}/>
        </div>
        <input type='number' placeholder='GST' className='pl-2 border-2 border-black' onChange={(e)=>setGst(e.target.value)}/>
        <div className='flex gap-2 items-center'>
    <label htmlFor='central'>Central</label>
    <input type='radio' id='central' name='location' className='w-5 h-5' checked={taxType === 'central'}
      onChange={handleTaxTypeChange}/>
        </div>
    </div>
</div>
</div>
<div className='flex flex-col gap-3 items' style={{ flexGrow: 1, flexShrink: 0 }}>
    <h1 className='font-bold text-2xl'>Selected Items</h1>
    <div className='flex flex-col'>
        {selectedItem && selectedItem.length > 0?(
          selectedItem.map((items,index)=>(
            <div className='flex gap-4 items-center ml-3' key={index}>
            <h1 className='font-semibold text-lg'>{items.name}</h1>
            <h1 className='font-semibold text-lg'>Quantity:{items.quantity}</h1>
            <input
  className='w-12 font-semibold text-lg'
  type="number"
  value={items.cost || ''}
  onChange={(e) => {
    const newValue = e.target.value;
    setSelectedItem(prev => 
      prev.map((item, idx) => 
        idx === index ? { ...item, cost: newValue } : item
      )
    );
  }}
/>
            <h1 className='font-semibold text-lg'>Discount:{items.discount}%</h1>
            <h1 className='font-semibold text-lg'>Total:{items.cost*items.quantity}</h1>
            <button className='border-2 border-black rounded-4xl active:scale-125' onClick={()=>handleRemove(index)}>X</button>
                    </div>
          ))
        ):(<h1>No Items Selected</h1>)}
    </div>
</div>
<button className='bg-blue-600 text-white w-24 m-auto' onClick={handleSave}>Save</button>
    </div>
  )
}

export default page