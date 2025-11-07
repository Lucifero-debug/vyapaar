'use client'
import { useRouter} from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
// import TotalSale from '@/models/totalSales';
import { saveToLocal, getFromLocal, clearInvoiceDraft } from '@/lib/localStorageHelper'
import InvoiceSearchParams from '@/components/suspense';
import { useSaleOptions } from '@/context/SaleOptionContext';

export const dynamic = 'force-dynamic';

const page = () => {
    const router = useRouter()
   const [value, setValue] = useState('');
   const [hsnTotals, setHsnTotals] = useState({});
   const [isValueReady,setIsValueReady]=useState(false)
     const { options } = useSaleOptions();
     const [showShippedPopup, setShowShippedPopup] = useState(false);
const [shippedTo, setShippedTo] = useState('');
const [hsn,setHsn]=useState('')
const [transport, setTransport] = useState('');
const [grNo, setGrNo] = useState('');
const [orderNo, setOrderNo] = useState('');
const [orderDate, setOrderDate] = useState('');
const [grDate, setGrDate] = useState('');
const [pvtMark, setPvtMark] = useState('');
const [caseDetails, setCaseDetails] = useState('');
const [freight, setFreight] = useState('');
const [weight, setWeight] = useState(0);
const [ewayBillNo, setEwayBillNo] = useState('');
const [ewayBillDate, setEwayBillDate] = useState('');
const [showDispatchPopup, setShowDispatchPopup] = useState(false);
const [dispatchFrom, setDispatchFrom] = useState('');
const [quantityPerPack, setQuantityPerPack] = useState(0);
const [noOfPack, setNoOfPack] = useState(0);
      const [showDescPopup, setShowDescPopup] = useState(false);
      const [showQuantityPack, setShowQuantityPack] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
    // Initialize states with proper default values
    const [invoiceNo, setInvoiceNo] = useState(4)
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [customer, setCustomer] = useState([])
    const [customerLoaded, setCustomerLoaded] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState({})
    const [phone, setPhone] = useState('')
    const [totalAmount, setTotalAmount] = useState(0)
    const [finalAmount, setFinalAmount] = useState(0)
    const [received, setReceived] = useState(0)
    const [balanceDue, setBalanceDue] = useState(0)
    const [paymentType, setPaymentType] = useState('Cash')
    const [newTaxAmount, setNewTaxAmount] = useState('')
    const [stateOfSupply, setStateOfSupply] = useState('Delhi')
    const [item, setItem] = useState([])
    const [gst, setGst] = useState(0)
    const [selectedItem, setSelectedItem] = useState([])
    const [itemName, setItemName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [rate, setRate] = useState('')
    const [discount, setDiscount] = useState('')
    const [taxType, setTaxType] = useState('local')
    const [id, setId] = useState('')
    
    const [partyTaxes, setPartyTaxes] = useState([])
    const [newTaxName, setNewTaxName] = useState('')
    const [newTaxRate, setNewTaxRate] = useState('')


    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().substring(0, 10)
    }

useEffect(() => {
  const fetchInvoiceNo = async () => {
    if (!value) { // Only fetch if not editing an existing invoice
      try {
        const response = await fetch('/api/next-invoice-no');
        const data = await response.json();
        if (data.invoiceNo) {
          setInvoiceNo(data.invoiceNo);
          localStorage.setItem('invoiceNo', data.invoiceNo);
        }
      } catch (err) {
        console.error('Failed to fetch invoice number:', err);
      }
    }
  };

  fetchInvoiceNo();
}, [value]);

    // Load existing invoice data if value parameter exists
    useEffect(() => {
        if (value) {
            fetch('/api/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            })
            .then(res => res.json())
            .then(res => {
                const data = res.final;
                console.log("transformer",data)
  setGst(data.gst || normalizedItems.reduce((sum, i) => sum + (i.gstAmount || 0), 0));
                setInvoiceNo(data.invoiceNo || 4);
                setDate(data.date ? formatDate(data.date) : new Date().toISOString().substring(0, 10));
                setId(data._id);
                setSelectedCustomer(data.customer || {});
                setPhone(data.customer?.phone || '');
                setTotalAmount(data.totalAmount || 0);
                setReceived(data.received || 0);
                setBalanceDue(data.balanceDue || '');
                setPaymentType(data.paymentType || 'Cash');
                setStateOfSupply(data.stateOfSupply || 'Delhi');
                setGst(data.gst || 0);
                setSelectedItem(data.items || []);
                setItemName(data.items?.name || '');
                setQuantity(data.items?.quantity || '');
                setRate(data.rate || '');
                setDiscount(data.items?.discount || '');
                setTaxType(data.taxType || 'local');
                setPartyTaxes(data.partyTaxes || []);
                const hsnTotalsObject = data.hsnTotals.reduce((acc, { hsn, amount }) => {
  acc[hsn] = amount;
  return acc;
}, {});
                setHsnTotals(hsnTotalsObject || {});
setHsn(data.items?.hsn || '')
                    setTransport(data.transport || '');
    setGrNo(data.grNo || '');
    setGrDate(data.grDate ? formatDate(data.grDate) : '');
    setPvtMark(data.pvtMark || '');
    setCaseDetails(data.caseDetails || '');
    setFreight(data.freight || '');
    setOrderNo(data.orderNo || '')
      setOrderDate(data.orderDate ? formatDate(data.orderDate) : '');
    setWeight(data.weight || '');
    setEwayBillNo(data.ewayBillNo || '');
    setEwayBillDate(data.ewayBillDate ? formatDate(data.ewayBillDate) : '');
            })
            .catch(err => console.error('Error:', err));
        }
    }, [value]);

    // Load customer data from localStorage after customers are loaded
    useEffect(() => {
        if (customerLoaded && customer.length > 0) {
            const savedCustomer = getFromLocal('selectedCustomer');
            if (savedCustomer && savedCustomer.id) {
                const match = customer.find((c) => c.id === savedCustomer.id);
                if (match) {
                    setSelectedCustomer(match);
                }
            }
        }
    }, [customerLoaded, customer]);

const addPartyTax = () => {
  if (!newTaxName || (!newTaxRate && !newTaxAmount)) {
    alert('Enter Tax Name and either Rate or Amount');
    return;
  }

  if (newTaxRate && newTaxAmount) {
    alert('Use either Rate or Amount, not both');
    return;
  }

  const taxTotal = newTaxRate
    ? (1000 * parseFloat(newTaxRate)) / 100 // assuming baseAmount = 1000
    : parseFloat(newTaxAmount);

  const newTax = {
    name: newTaxName,
    rate: newTaxRate || '',
    amount: newTaxAmount || '',
    total: taxTotal.toFixed(2),
  };


  setPartyTaxes(prev => {
    const updated = [...prev, newTax];
    return updated;
  });

  setNewTaxName('');
  setNewTaxRate('');
  setNewTaxAmount('');
};


    // Handle remove item
    const handleRemove = (indexToRemove) => {
        const updatedItems = selectedItem.filter((_, index) => index !== indexToRemove);
        setSelectedItem(updatedItems);
        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.total, 0);
        setTotalAmount(newTotal.toFixed(2));

        // Recalculate HSN Totals
const groupedByHSN = {};
updatedItems.forEach(item => {
  const hsn = item.hsn || 'N/A';
  groupedByHSN[hsn] = (groupedByHSN[hsn] || 0) + item.total;
});
setHsnTotals(groupedByHSN);
    }

    // Fetch items and customers
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await fetch('/api/get-item')
                const result = await response.json()
                setItem(result.item)
            } catch (error) {
                console.error('Error fetching Item data:', error);
                alert('Failed to fetch item.');
            }
        }
        
        const fetchCust = async () => {
            try {
                const response = await fetch('/api/get-customer')
                const result = await response.json()
                setCustomer(result.customer)
                setCustomerLoaded(true);
            } catch (error) {
                console.error('Error fetching Customer data:', error);
                alert('Failed to fetch customer.');
            }
        }
        
        fetchCust()
        fetchItem()
    }, [])

useEffect(() => {
const groupedByHSN = {};

selectedItem.forEach(item => {
  const hsn = item.hsn || "N/A";
  const cost = Number(item.cost) || 0;
  const qty = Number(item.quantity) || 0;
  const discount = Number(item.discount) || 0;
  const gstRate = Number(item.gst || item.gstRate || 0);

  const baseAmount = cost * qty;
  const discountAmount = (baseAmount * discount) / 100;
  const taxableBase = baseAmount - discountAmount;
  const gstAmount = (taxableBase * gstRate) / 100;
  const total = taxableBase + gstAmount;

  if (!groupedByHSN[hsn]) {
    groupedByHSN[hsn] = {
      gstRate,
      gstAmount: 0,   // total GST on that HSN
      total: 0        // total final amount on that HSN
    };
  }

  groupedByHSN[hsn].gstAmount += gstAmount;
  groupedByHSN[hsn].total += total;
});

setHsnTotals(groupedByHSN);

}, [selectedItem]); 

    // Save invoice function
    const submitInvoice = async () => {
        const encodedItems = encodeURIComponent(JSON.stringify(selectedItem));
        const encodedParty = encodeURIComponent(JSON.stringify(partyTaxes));
       const encodedHsnTotals = encodeURIComponent(JSON.stringify(hsnTotals));
        const phone = selectedCustomer.phone;
const hsnTotalsArray = Object.entries(hsnTotals).map(([hsn, data]) => ({
  hsn,
  gstRate: data.gstRate,
  amount: data.gstAmount,
  total: data.total
}));

        const invoiceData = {
            invoiceNo,
            date,
            customer: {
                name: selectedCustomer.name,
                phone: phone,
                email: selectedCustomer.email,
                custId:selectedCustomer._id
            },
return: false, 
            paymentType,
            balanceDue,
            stateOfSupply,
            taxType,
            gst,
            totalAmount: Number(totalAmount),
            finalAmount: Number(finalAmount),
            received: Number(received) || 0,
            items: selectedItem,
            partyTaxes: partyTaxes,
             shippedTo,
  dispatchFrom,
            type: "Purchase",
              transport,
  grNo,
  grDate,
  pvtMark,
  hsnTotals:hsnTotalsArray,
  caseDetails,
  freight,
  weight,
  ewayBillNo,
  ewayBillDate,
  orderDate,
  orderNo
        };

        try {
            const apiRoute = value ? '/api/sale-alter' : '/api/save-invoice';
            const response = await fetch(apiRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoiceData),
            });

            const result = await response.json();

            if (result.success) {
                // Reset state
                setSelectedItem([]);
                setPartyTaxes([]);
                // Navigate to Invoice view page
                const query = new URLSearchParams({
                    invoiceNo,
                    date,
                    customer: selectedCustomer.name,
                    phone,
                    totalAmount,
                    finalAmount,
                    received:received || 0,
                    balanceDue,
                    paymentType,
                    stateOfSupply,
                    taxType,
                    gst,
                    items: encodedItems,
                    partyTaxes:encodedParty,
                     shippedTo,
  dispatchFrom,
    transport,
  grNo,
  grDate,
  pvtMark,
  caseDetails,
  freight,
  weight,
  ewayBillNo,
  ewayBillDate,
  orderNo,
  orderDate,
  hsnTotals:encodedHsnTotals
                }).toString();

                router.push(`/invoice?${query}`);
            } else {
                alert('Failed to save invoice: ' + result.error);
            }
        } catch (err) {
            console.error('Error saving invoice:', err);
            alert('Error saving invoice');
        }
    };

    const handleSave = () => {
  if (options.shipped) {
    setShowShippedPopup(true);
    return;
  }

  if (options.dispatch) {
    setShowDispatchPopup(true);
    return;
  }

  // If neither option is ON, submit directly
  submitInvoice();
};

const handleShippedSave = () => {
  setShowShippedPopup(false);
  if (options.dispatch) {
    setShowDispatchPopup(true);
  } else {
    submitInvoice();
  }
};

const handleDispatchSave = () => {
  setShowDispatchPopup(false);
  submitInvoice();
};



    // Calculate totals
    useEffect(() => {
        const newTotal = selectedItem.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);
        setTotalAmount(newTotal.toFixed(2));
    }, [selectedItem]);

// GST and Final Amount
useEffect(() => {
    const baseAmount = parseFloat(totalAmount) || 0;
    const partyTaxTotal = partyTaxes.reduce((acc, tax) => acc + parseFloat(tax.total || 0), 0);

    const finalAmt = baseAmount  + partyTaxTotal;
    setFinalAmount(finalAmt.toFixed(2));

    const receivedAmt = parseFloat(received) || 0;
    const balance = parseFloat((finalAmt - receivedAmt).toFixed(2));
    setBalanceDue(balance); // ✅ number not string
}, [totalAmount, gst, partyTaxes, received]);


    // Handle tax type change
    const handleTaxTypeChange = (e) => {
        setTaxType(e.target.value);
    };

const saveItem = (e) => {
  const selectedName = e.target.value;
  const selectedItems = item.find((i) => i.name === selectedName);
  if (!selectedItems) return;

  if (options.description) {
    setShowDescPopup(true);
    return;
  }

  if (options.calculateByPack) {
    setShowQuantityPack(true);
    return;
  }

  const rateValue = Number(rate || selectedItems.cost);
  const quantityValue = Number(quantity || 1);
  const discountValue = Number(discount || 0);
  const gstRate = Number(selectedItems.gst || selectedItems.gstRate || 0);

  const baseAmount = rateValue * quantityValue;
  const discountAmount = (baseAmount * discountValue) / 100;
  const taxableAmount = baseAmount - discountAmount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const total = taxableAmount + gstAmount;

  const newItem = {
    ...selectedItems,
    quantity: quantityValue,
    cost: rateValue,
    discount: discountValue,
    gstRate,               // ✅ store GST Rate
    taxableAmount,         // ✅ store Taxable (pre-GST)
    gstAmount,             // ✅ store GST value
    total,                 // ✅ store Total (taxable + GST)
  };

  const updatedItems = [...selectedItem, newItem];
  setSelectedItem(updatedItems);

  // Update GST and HSN totals
  let totalGst = 0;
  const groupedByHSN = {};
  updatedItems.forEach(item => {
    const hsn = item.hsn || 'N/A';
    totalGst += item.gstAmount || 0;

    if (!groupedByHSN[hsn]) {
      groupedByHSN[hsn] = { gstRate: item.gstRate, gstAmount: 0, total: 0 };
    }
    groupedByHSN[hsn].gstAmount += item.gstAmount || 0;
    groupedByHSN[hsn].total += item.total || 0;
  });

  setHsnTotals(groupedByHSN);
  setGst(totalGst);

  // Reset fields
  setItemName('');
  setQuantity('');
  setRate('');
  setDiscount('');
};

   const handleSaveDescription = () => {
  const selectedItems = item.find((i) => i.name === itemName);
  if (!selectedItems) return;

  const rateValue = rate || selectedItems.cost;
  const quantityValue = quantity || 1;

  const subtotal = rateValue * quantityValue;
  const gstRate = selectedItems.hsn?.gst || 0;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  const discountValue = Number(discount || 0);
    const baseAmount = rateValue * quantityValue;
    const discountAmount = (baseAmount * discountValue) / 100;
  const taxableAmount = subtotal - discountAmount;

  const newItem = {
    ...selectedItems,
    description: descriptionText,
    quantity: quantityValue,
    cost: rateValue,
    discount: discount || 0,
    gstRate,
    taxableAmount,
    gstAmount,
    total,
  };

const updatedItems = [...selectedItem, newItem];
setSelectedItem(updatedItems);
   let totalGst = 0;
            const groupedByHSN = {};
updatedItems.forEach(item => {
  const hsn = item.hsn || 'N/A';
   const gstAmount = item.gstAmount || 0;
    totalGst += gstAmount;
      const baseAmount = item.cost * item.quantity;
  const discountAmount = (baseAmount * (item.discount || 0)) / 100;
  const hsnTaxAmount = (baseAmount * (item.gst || 0)) / 100;
  const taxableAmount = baseAmount - discountAmount+hsnTaxAmount;

  groupedByHSN[hsn] = (groupedByHSN[hsn] || 0) + taxableAmount;

});
setHsnTotals(groupedByHSN);
setGst(totalGst);
  // Reset all
  setShowDescPopup(false);
  setItemName('');
  setQuantity('');
  setRate('');
  setDiscount('');
  setDescriptionText('');
};

   const handleQuantityPackSave = () => {
  const selectedItems = item.find((i) => i.name === itemName);
  if (!selectedItems) return;

  const rateValue = rate || selectedItems.cost;
  const quantityValue = noOfPack * quantityPerPack;

  const subtotal = rateValue * quantityValue;
  const gstRate = selectedItems.hsn?.gst || 0;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  const discountValue = Number(discount || 0);
    const baseAmount = rateValue * quantityValue;
    const discountAmount = (baseAmount * discountValue) / 100;
  const taxableAmount = subtotal - discountAmount;

  const newItem = {
    ...selectedItems,
    description: descriptionText,
    quantity: quantityValue,
    cost: rateValue,
    discount: discount || 0,
    gstRate,
    taxableAmount,
    gstAmount,
    total:total,
  };
const updatedItems = [...selectedItem, newItem];
setSelectedItem(updatedItems);
  let totalGst = 0;
            const groupedByHSN = {};
updatedItems.forEach(item => {
  const hsn = item.hsn || 'N/A';
   const gstAmount = item.gstAmount || 0;
    totalGst += gstAmount;
  groupedByHSN[hsn] = (groupedByHSN[hsn] || 0) + item.total;
});
setHsnTotals(groupedByHSN);
setGst(totalGst);

  // Reset all
  setShowQuantityPack(false);
  setNoOfPack(0);
  setQuantityPerPack(0);
};


    return (
        <>
                    <Suspense fallback={null}>
                <InvoiceSearchParams onValue={setValue} onReady={setIsValueReady} />
              </Suspense>
        <div className='flex flex-col gap-6 p-6 bg-gray-50 min-h-screen'>
            {/* Invoice & Date */}
            <div className='flex gap-6'>
                <div className='flex flex-col'>
                    <label className='text-gray-600 font-medium mb-1'>Invoice No:</label>
                    <input 
                        type='number' 
                        className='h-10 px-3 border rounded-lg shadow-sm' 
                        value={invoiceNo} 
                        onChange={(e) => setInvoiceNo(e.target.value)} 
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='text-gray-600 font-medium mb-1'>Date</label>
                    <input 
                        type='date' 
                        className='h-10 px-3 border rounded-lg shadow-sm' 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                    />
                </div>
            </div>


            {/* Customer & Item Selection */}
            <div className='grid grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md'>
                {/* Customer Dropdown */}
                <div className='flex flex-col'>
                    <label className='text-gray-600 font-medium mb-1'>Customer</label>
                    <select 
                        value={selectedCustomer.name || ''} 
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const customers = customer.find(cust => cust.name === selectedName);
                            setSelectedCustomer(customers || {});
                        }} 
                        className='h-10 px-3 border rounded-lg shadow-sm'
                    >
                        <option value=''>Select Customer</option>
                        {customer.map((cust) => (
                            <option value={cust.name} key={cust.id}>{cust.name}</option>
                        ))}
                    </select>
                </div>

                {/* Phone (read only) */}
                <div className='flex flex-col'>
                    <label className='text-gray-600 font-medium mb-1'>Phone</label>
                    <input 
                        className='h-10 px-3 border rounded-lg shadow-sm bg-gray-100' 
                        value={selectedCustomer.phone || ''} 
                        readOnly 
                    />
                </div>

                {/* Email (read only) */}
                <div className='flex flex-col'>
                    <label className='text-gray-600 font-medium mb-1'>Email</label>
                    <input 
                        className='h-10 px-3 border rounded-lg shadow-sm bg-gray-100' 
                        value={selectedCustomer.email || ''} 
                        readOnly 
                    />
                </div>

                {/* Item Dropdown */}
                <div className='flex flex-col'>
                    <label className='text-gray-600 font-medium mb-1'>Add Item</label>
                    <select 
                        value={itemName} 
                        onChange={(e) => { 
                            setItemName(e.target.value); 
                            saveItem(e); 
                        }} 
                        className='h-10 px-3 border rounded-lg shadow-sm'
                    >
                        <option value=''>Select an Item</option>
                        {item.map((items) => (
                            <option value={items.name} key={items.id}>{items.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            {showDescPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Add Product Description</h2>
      <textarea
        value={descriptionText}
        onChange={(e) => setDescriptionText(e.target.value)}
        rows={4}
        className="w-full border px-3 py-2 rounded-lg mb-4"
        placeholder="Enter description here..."
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowDescPopup(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
           onClick={handleSaveDescription}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{showQuantityPack && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
        <div className='flex'>
      <h2 className="text-lg font-semibold mb-4">Enter Quantity Per Pack</h2>
      <input
        type="number"
        value={quantityPerPack}
        onChange={(e) => setQuantityPerPack(e.target.value)}
        placeholder="Dispatch location"
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
        </div>
        <div className='flex'>
      <h2 className="text-lg font-semibold mb-4">Enter No Of Packs</h2>
      <input
        type="number"
        value={noOfPack}
        onChange={(e) => setNoOfPack(e.target.value)}
        placeholder="Dispatch location"
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
        </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowQuantityPack(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        <button onClick={handleQuantityPackSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </div>
  </div>
)}

            <div className='flex flex-col gap-3'>
                <h1 className='text-2xl font-bold text-gray-700'>Selected Items</h1>

                {selectedItem && selectedItem.length > 0 ? (
                    <div className='overflow-x-auto'>
                        <table className='min-w-full table-auto border-collapse border border-gray-300 text-left'>
                            <thead>
                                <tr className='bg-blue-100 text-gray-700 uppercase text-sm leading-normal'>
                                    <th className='py-2 px-4 border border-gray-300'>Name</th>
                                    <th className='py-2 px-4 border border-gray-300'>Quantity</th>
                                    <th className='py-2 px-4 border border-gray-300'>Rate</th>
                                    <th className='py-2 px-4 border border-gray-300'>Discount (%)</th>
                                    <th className='py-2 px-4 border border-gray-300'>HSN Code</th>
                                    <th className='py-2 px-4 border border-gray-300'>GST</th>
                                    <th className='py-2 px-4 border border-gray-300'>Total</th>
                                    <th className='py-2 px-4 border border-gray-300'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItem.map((items, index) => (
                                    <tr key={index} className='even:bg-gray-50 odd:bg-white'>
                                        <td className='py-2 px-4 border border-gray-300'>{items.name}</td>
                                        <td className='py-2 px-4 border border-gray-300'>
<input 
    type='number' 
    min='1' 
    className='w-16 px-2 border rounded' 
    value={items.quantity} 
    onChange={(e) => {
        const newQuantity = parseFloat(e.target.value) || 0;
        setSelectedItem(prev =>
            prev.map((item, idx) => {
                if (idx === index) {
                    const subtotal = item.cost * newQuantity;
                    const discountAmount = (subtotal * (item.discount || 0)) / 100;
                    const taxableAmount = subtotal - discountAmount;
                    const gstAmount = (taxableAmount * (item.gst || 0)) / 100;
                    const newTotal = taxableAmount + gstAmount;
                    
                    return { 
                        ...item, 
                        quantity: newQuantity,
                        gstAmount: gstAmount,
                        total: newTotal,
                        taxableAmount:taxableAmount
                    };
                }
                return item;
            })
        );
    }} 
/>
                                        </td>
                                        <td className='py-2 px-4 border border-gray-300'>
<input 
    type='number' 
    min='0' 
    className='w-16 px-2 border rounded' 
    value={items.cost} 
    onChange={(e) => {
        const newCost = parseFloat(e.target.value) || 0;
        setSelectedItem(prev =>
            prev.map((item, idx) => {
                if (idx === index) {
                    const subtotal = newCost * item.quantity;
                    const discountAmount = (subtotal * (item.discount || 0)) / 100;
                    const taxableAmount = subtotal - discountAmount;
                    const gstAmount = (taxableAmount * (item.gst || 0)) / 100;
                    const newTotal = taxableAmount + gstAmount;
                    
                    return { 
                        ...item, 
                        cost: newCost,
                        gstAmount: gstAmount,
                        total: newTotal,
                        taxableAmount:taxableAmount
                    };
                }
                return item;
            })
        );
    }} 
/>
                                        </td>
                                        <td className='py-2 px-4 border border-gray-300'>
<input
    type='number'
    min='0'
    max='100'
    className='w-16 px-2 border rounded'
    value={items.discount}
    onChange={(e) => {
        const newDiscount = parseFloat(e.target.value) || 0;
        setSelectedItem(prev =>
            prev.map((item, idx) => {
                if (idx === index) {
                    const subtotal = item.cost * item.quantity;
                    const discountAmount = (subtotal * newDiscount) / 100;
                    const taxableAmount = subtotal - discountAmount;
                    const gstAmount = (taxableAmount * (item.gst || 0)) / 100;
                    const newTotal = taxableAmount + gstAmount;
                    
                    return {
                        ...item,
                        discount: newDiscount,
                        gstAmount: gstAmount,
                        total: newTotal,
                        taxableAmount:taxableAmount
                    };
                }
                return item;
            })
        );
    }}
/>
                                        </td>
                                        <td className='py-2 px-4 border border-gray-300'>{items.hsn}</td>
                                        <td className='py-2 px-4 border border-gray-300'>{items.gstRate || 0}</td>
                                        <td className='py-2 px-4 border border-gray-300'>{items.total.toFixed(2)}</td>
                                        <td className='py-2 px-4 border border-gray-300'>
                                            <button 
                                                className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600' 
                                                onClick={() => handleRemove(index)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h1 className='text-gray-500'>No Items Selected</h1>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
 <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">GR Date</label>
    <input
      type="date"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={grDate}
      onChange={(e) => setGrDate(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">GR No</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={grNo}
      onChange={(e) => setGrNo(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Transport</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={transport}
      onChange={(e) => setTransport(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Pvt Mark</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={pvtMark}
      onChange={(e) => setPvtMark(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Case</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={caseDetails}
      onChange={(e) => setCaseDetails(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Freight</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={freight}
      onChange={(e) => setFreight(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">E-Way Bill Date</label>
    <input
      type="date"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={ewayBillDate}
      onChange={(e) => setEwayBillDate(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">E-Way Bill No</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={ewayBillNo}
      onChange={(e) => setEwayBillNo(e.target.value)}
    />
  </div>
    <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Order Date</label>
    <input
      type="date"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={orderDate}
      onChange={(e) => setOrderDate(e.target.value)}
    />
  </div>
    <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Order No</label>
    <input
      type="text"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={orderNo}
      onChange={(e) => setOrderNo(e.target.value)}
    />
  </div>
  <div className="flex flex-col">
    <label className="text-gray-600 font-medium mb-1">Weight (kg)</label>
    <input
      type="number"
      className="h-10 px-3 border rounded-lg shadow-sm"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
    />
  </div>
</div>

            {/* Payment & Supply Section */}
 <div className="flex gap-6 flex-wrap">
  {/* Total Summary Card */}
  <div className="flex-1 bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 min-w-[300px]">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium text-gray-700">Total Amount</h2>
      <div className="w-32 h-10 px-2 border rounded-lg text-right bg-gray-100 flex items-center justify-end font-medium">
        ₹{finalAmount}
      </div>
    </div>
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium text-gray-700">Received</h2>
      <input
        type="number"
        className="w-32 h-10 px-2 border rounded-lg text-right"
        value={received || ''}
        onChange={(e) => setReceived(parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
    <div className="flex justify-between items-center border-t pt-2">
      <h2 className="text-lg font-semibold text-gray-800">Balance Due</h2>
      <div className="w-32 h-10 px-2 border rounded-lg text-right bg-red-50 border-red-200 flex items-center justify-end font-semibold text-red-600">
        ₹{balanceDue}
      </div>
    </div>
  </div>

  {/* Tax Type + GST Card */}
  <div className='flex-1 bg-white p-6 rounded-xl shadow-md flex flex-col gap-4'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-lg font-medium text-gray-700'>Payment Type</h2>
                        <select 
                            className='w-32 h-10 px-2 border rounded-lg' 
                            value={paymentType} 
                            onChange={(e) => setPaymentType(e.target.value)}
                        >
                            <option value='Cash'>Cash</option>
                            <option value='Cheque'>Cheque</option>
                        </select>
                    </div>

                    <div className='flex justify-between items-center'>
                        <h2 className='text-lg font-medium text-gray-700'>State Of Supply</h2>
                        <select 
                            className='w-32 h-10 px-2 border rounded-lg' 
                            value={stateOfSupply} 
                            onChange={(e) => setStateOfSupply(e.target.value)}
                        >
                            <option value='Delhi'>Delhi</option>
                            <option value='Mumbai'>Mumbai</option>
                            <option value='Jaipur'>Jaipur</option>
                        </select>
                    </div>

                    <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='local' className='text-gray-700'>Local</label>
                            <input 
                                type='radio' 
                                id='local' 
                                name='location' 
                                value='local'
                                className='w-5 h-5' 
                                checked={taxType === 'local'} 
                                onChange={handleTaxTypeChange} 
                            />
                        </div>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='central' className='text-gray-700'>Central</label>
                            <input 
                                type='radio' 
                                id='central' 
                                name='location' 
                                value='central'
                                className='w-5 h-5' 
                                checked={taxType === 'central'} 
                                onChange={handleTaxTypeChange} 
                            />
                        </div>
                    </div>
                </div>
</div>


<div className='mt-6'>
  <h2 className='font-bold text-xl mb-2'>HSN Code-wise Totals</h2>
  <div className='border border-gray-300 rounded-md overflow-hidden'>
    <table className='w-full text-left border-collapse'>
      <thead className='bg-gray-100'>
        <tr>
          <th className='py-2 px-4 border-b border-gray-300'>HSN Code</th>
          <th className='py-2 px-4 border-b border-gray-300 text-right'>GST Rate (%)</th>
          <th className='py-2 px-4 border-b border-gray-300 text-right'>Taxable Amount (₹)</th>
          <th className='py-2 px-4 border-b border-gray-300 text-right'>Total Amount (₹)</th>
        </tr>
      </thead>

      <tbody>
        {Object.entries(hsnTotals).map(([hsn, data]) => (
          <tr key={`${hsn}-${data.gstRate || 0}`} className='hover:bg-gray-50'>
            <td className='py-2 px-4 border-b border-gray-200'>{hsn}</td>
            <td className='py-2 px-4 border-b border-gray-200 text-right'>
              {Number(data?.gstRate || 0).toFixed(2)}%
            </td>
            <td className='py-2 px-4 border-b border-gray-200 text-right'>
              ₹{Number(data?.gstAmount || 0).toFixed(2)}
            </td>
            <td className='py-2 px-4 border-b border-gray-200 text-right'>
              ₹{Number(data?.total || 0).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>

      <tfoot className='bg-gray-50 font-semibold'>
        <tr>
          <td className='py-2 px-4 text-right' colSpan={2}>Grand Total</td>
          <td className='py-2 px-4 text-right'>
            ₹{Object.values(hsnTotals)
              .reduce((sum, d) => sum + Number(d?.gstAmount || 0), 0)
              .toFixed(2)}
          </td>
          <td className='py-2 px-4 text-right'>
            ₹{Object.values(hsnTotals)
              .reduce((sum, d) => sum + Number(d?.total || 0), 0)
              .toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>


            {/* Party Taxes Section */}
            <div className='flex flex-col gap-3 mt-6'>
                <h1 className='font-bold text-2xl'>Overhead Sale</h1>

                {/* Inputs to add new tax */}
                <div className='flex gap-2 mb-2'>
                    <input
                        type='text'
                        placeholder='Overhead Name'
                        className='border border-black px-2 py-1'
                        value={newTaxName}
                        onChange={(e) => setNewTaxName(e.target.value)}
                    />
                    <input
                        type='number'
                        placeholder='Rate %'
                        className='border border-black px-2 py-1 w-20'
                        value={newTaxRate}
                        onChange={(e) => setNewTaxRate(e.target.value)}
                    />
                    <input
                        type='number'
                        placeholder='Amount'
                        className='border border-black px-2 py-1 w-20'
                        value={newTaxAmount}
                        onChange={(e) => setNewTaxAmount(e.target.value)}
                    />
                    <button
                        className='bg-green-500 text-white px-3 py-1 rounded'
                        onClick={addPartyTax}
                        type='button'
                    >
                        Add Overhead
                    </button>
                </div>

                {/* Party Taxes Table */}
                {partyTaxes.length > 0 ? (
                    <table className='w-full border border-black text-left'>
                        <thead>
                            <tr className='bg-gray-200'>
                                <th className='border border-black px-2 py-1'>Tax Name</th>
                                <th className='border border-black px-2 py-1'>Rate %</th>
                                <th className='border border-black px-2 py-1'>Amount</th>
                                <th className='border border-black px-2 py-1'>Total</th>
                                <th className='border border-black px-2 py-1'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partyTaxes.map((tax, index) => (
                                <tr key={`${tax.name}-${index}`} className='even:bg-gray-50 odd:bg-white'>
                                    <td className='border border-black px-2 py-1'>{tax.name}</td>
                                    <td className='border border-black px-2 py-1'>
                                        {tax.rate ? `${tax.rate}%` : 'NA'}
                                    </td>
                                    <td className='border border-black px-2 py-1'>
                                        {tax.amount ? `₹${tax.amount}` : 'NA'}
                                    </td>
                                    <td className='border border-black px-2 py-1'>{tax.total}</td>
                                    <td className='border border-black px-2 py-1'>
                                        <button
                                            className='bg-red-500 text-white px-2 py-1 rounded active:scale-110'
                                            onClick={() => {
                                                const updatedTaxes = partyTaxes.filter((_, idx) => idx !== index);
                                                setPartyTaxes(updatedTaxes);
                                            }}
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <h1>No Party Taxes Added</h1>
                )}
            </div>

            {/* Save Button */}
            <button 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg w-fit mx-auto text-lg hover:bg-blue-700' 
                onClick={handleSave}
            >
                Save Invoice
            </button>

        {showShippedPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Enter Shipped To</h2>
      <input
        type="text"
        value={shippedTo}
        onChange={(e) => setShippedTo(e.target.value)}
        placeholder="Shipping address"
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowShippedPopup(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        <button onClick={handleShippedSave} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
      </div>
    </div>
  </div>
)}

{showDispatchPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Enter Dispatch From</h2>
      <input
        type="text"
        value={dispatchFrom}
        onChange={(e) => setDispatchFrom(e.target.value)}
        placeholder="Dispatch location"
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowDispatchPopup(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        <button onClick={handleDispatchSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </div>
  </div>
)}

        </div>
        </>
    )
}

export default page