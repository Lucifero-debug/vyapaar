'use client';
import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Button } from '../components/ui/button';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/ui/command';
import { cn } from '../lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import ManIcon from '@mui/icons-material/Man';
import HsnMaster from '@/components/HsnMaster';

const Page = () => {
  const router = useRouter();
  const [showHsnMaster, setShowHsnMaster] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [customer, setCustomer] = useState([]);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [saleInvoices, setSaleInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [saleReturns, setSaleReturns] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [alterState, setAlterState] = useState('');
  const [deleteState, setDeleteState] = useState('');
  const [item, setItem] = useState([]);
  const [hsn, setHsn] = useState([]);
  const [alter, setAlter] = useState(false);
  const [del, setDel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedHsn, setSelectedHsn] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, custRes, invRes,hsnRes] = await Promise.all([
          fetch('/api/get-item'),
          fetch('/api/get-customer'),
          fetch('/api/get-invoice'),
          fetch('/api/get-hsn'),
        ]);
        const [itemData, custData, invData,hsnData] = await Promise.all([
          itemRes.json(),
          custRes.json(),
          invRes.json(),
          hsnRes.json(),
        ]);


        // Transform data
      setCustomer(
  custData.customer.map(cust => ({
    id: cust._id, // 🔥 Add the real MongoDB ID
    name: cust.name || cust.customerName || cust._id
  })) || []
);

setItem(
  itemData.item.map(it => ({
    id: it._id, // 🔥 Add the real MongoDB ID
    name: it.name || it.itemName || it._id
  })) || []
);
setHsn(
  hsnData.hsn.map(hs => ({
    ...hs,      
    id: hs._id 
  })) || []
);


        // Categorize invoices
        const invoices = invData.invoice || [];
        const saleInv = invoices.filter(inv => inv.type === 'Sale' && !inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
            totalAmount: inv.totalAmount || 0,
        }));
        const purchaseInv = invoices.filter(inv => inv.type === 'Purchase' && !inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
        }));
        const saleRet = invoices.filter(inv => inv.type === 'Sale' && inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
        }));
        const purchaseRet = invoices.filter(inv => inv.type === 'Purchase' && inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
        }));
         const totalSales = saleInv.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
setTotalSalesAmount(totalSales);


        setSaleInvoices(saleInv);
        setPurchaseInvoices(purchaseInv);
        setSaleReturns(saleRet);
        setPurchaseReturns(purchaseRet);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (currentValue) => {
    console.log('handleSelect triggered with value:', currentValue);
    const newValue = currentValue;
    setValue(newValue);
    setOpen(false);

    if (newValue) {
      console.log('Navigating with alterState:', alterState, 'value:', newValue);
      switch (alterState) {
        case 'Customer':
          router.push(`/customeradd?value=${newValue}`);
          break;
        case 'SaleInvoice':
          router.push(`/saleadd?value=${newValue}`);
          break;
        case 'PurchaseInvoice':
          router.push(`/purchaseadd?value=${newValue}`);
          break;
        case 'SaleReturn':
          router.push(`/salereturn?value=${newValue}`);
          break;
        case 'PurchaseReturn':
          router.push(`/purchasereturn?value=${newValue}`);
          break;
        case 'Item':
          router.push(`/itemadd?value=${newValue}`);
          break;
case 'HSN':
      const selected = hsn.find(h => h.hsncode === newValue);
      if (selected) {
        setSelectedHsn(selected);  
        setShowHsnMaster(true);           // ✅ Open popup in edit mode
      }
      break;

        default:
          console.warn('Unsupported alterState:', alterState);
          alert(`Navigation not supported for ${alterState}`);
      }
    } else {
      console.log('No navigation: newValue is empty');
    }
  };

 const handleDelete = async (currentValue) => {
  console.log('handleDelete triggered with value:', currentValue);

  let endpoint = '';
  switch (deleteState) {
    case 'Customer':
      endpoint = `/api/delete-cust?id=${currentValue}`;
      break;
    case 'Item':
      endpoint = `/api/delete-item?id=${currentValue}`;
      break;
    case 'SaleInvoice':
    case 'PurchaseInvoice':
    case 'SaleReturn':
    case 'PurchaseReturn':
      endpoint = `/api/delete-invoice?id=${currentValue}`;
      break;
      case 'HSN':
  endpoint = `/api/delete-hsn?id=${currentValue}`;
  break;

    default:
      alert(`Delete not supported for ${alterState}`);
      return;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Deleted successfully');
      // Optional: Reload or update UI
    } else {
      console.error('❌ Failed to delete:', result.error);
      alert(`Failed to delete: ${result.error}`);
    }
  } catch (error) {
    console.error('⚠️ Error during delete request:', error);
    alert('Error during delete');
  }
};


    const getEntities = () => {
    switch (alterState) {
      case 'Customer': return customer;
      case 'SaleInvoice': return saleInvoices;
      case 'PurchaseInvoice': return purchaseInvoices;
      case 'SaleReturn': return saleReturns;
      case 'PurchaseReturn': return purchaseReturns;
      case 'Item': return item;
      case 'HSN': return hsn; // or return hsn;
      default: return [];
    }
  };

  const getEntitiey = () => {
    switch (deleteState) {
      case 'Customer': return customer;
      case 'SaleInvoice': return saleInvoices;
      case 'PurchaseInvoice': return purchaseInvoices;
      case 'SaleReturn': return saleReturns;
      case 'PurchaseReturn': return purchaseReturns;
      case 'Item': return item;
      case 'HSN': return hsn; // or return hsn;
      default: return [];
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-blue-600 rounded-lg shadow-lg p-6 text-white mb-6">
        <p className="text-lg font-semibold text-red-700 mb-2">Prashant Kumar</p>
        <p className="text-sm uppercase tracking-wider opacity-80">Total Sales</p>
       <h2 className="text-4xl font-extrabold mt-2">₹{totalSalesAmount.toFixed(2)}</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h2 className="font-extrabold text-xl text-gray-800 mb-2">My Business</h2>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3">
              <CurrencyRupeeOutlinedIcon /> Sale
            </AccordionTrigger>
            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                    Sale Invoice
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Sale Invoice</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/saleadd')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to SaleInvoice');
                        setAlterState('SaleInvoice');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                     onClick={() => {
                        setDeleteState('SaleInvoice');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>

            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                    Sale Return
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Sale Return</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/salereturn')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to SaleReturn');
                        setAlterState('SaleReturn');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        console.log('Setting deleteState to SaleReturn');
                        setDeleteState('SaleReturn');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-2">
            <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3">
              <ShoppingCartOutlinedIcon /> Purchase
            </AccordionTrigger>
            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                    Purchase Invoice
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Purchase Invoice</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/purchaseadd')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to PurchaseInvoice');
                        setAlterState('PurchaseInvoice');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                     onClick={() => {
                        console.log('Setting deleteState to PurchaseInvoice');
                        setDeleteState('PurchaseInvoice');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>

            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                    Purchase Return
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Purchase Return</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/purchasereturn')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to PurchaseReturn');
                        setAlterState('PurchaseReturn');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                            onClick={() => {
                        setDeleteState('PurchaseReturn');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-3">
            <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3">
              <ManIcon /> Master
            </AccordionTrigger>
            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                    Customer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Customer</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/customeradd')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to Customer');
                        setAlterState('Customer');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    onClick={() => {
                        console.log('Setting deleteState to Customer');
                        setDeleteState('Customer');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>

            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                    Items
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Item</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/itemadd')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to Item');
                        setAlterState('Item');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                     onClick={() => {
                        console.log('Setting deleteState to Item');
                        setDeleteState('Item');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>

<AccordionContent className="bg-white px-4 py-3">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="w-full font-extrabold text-2xl">
        HSN
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>HSN Master</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setShowHsnMaster(true)}>
          Create
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAlterState('HSN') || setAlter(true)}>
          Alter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDeleteState('HSN') || setDel(true)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</AccordionContent>




          </AccordionItem>
        </Accordion>

        <div className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3 flex items-center cursor-pointer w-full" onClick={()=>router.push('/voucher')}>
  🧾 Voucher
</div>
        <div className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3 flex items-center cursor-pointer w-full" onClick={()=>router.push('/setup')}>
<SettingsApplicationsIcon/>  Setup
</div>


      {/* Alter Section */}
      {alter && (
        <div className="mt-6 flex justify-center">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[250px] justify-between">
                  {value
                    ? getEntities().find((e) =>
                        (alterState === 'Customer' || alterState === 'Item'
                          ? e.name
                          : e.invoiceNo) === value
                      )?.[alterState === 'Customer' || alterState === 'Item' ? 'name' : 'invoiceNo']
                    : `Select ${alterState}`}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder={`Search ${alterState}`} className="h-9" />
                  <CommandList>
                    <CommandEmpty>No result found.</CommandEmpty>
                    <CommandGroup>
                      {getEntities().map((entity) => {
                        const key = alterState === 'Customer' || alterState === 'Item' ? entity.name :  alterState === 'HSN' ? entity.hsncode: entity.invoiceNo;
                        return (
                          <CommandItem
                            key={key}
                            value={String(key)}
                            onSelect={(currentValue) => handleSelect(currentValue)}
                          >
                            {key}
                            <Check className={cn('ml-auto', value === key ? 'opacity-100' : 'opacity-0')} />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}


      {/* Delete Section */}
      {del && (
        <div className="mt-6 flex justify-center">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
             <Button variant="outline" className="w-[250px] justify-between">
  {value
    ? getEntitiey().find((e) =>
        deleteState === 'Customer' || deleteState === 'Item'
          ? e.name === value
          : deleteState === 'HSN'
          ? e.hsncode === value
          : e.invoiceNo === value
      )?.[
        deleteState === 'Customer' || deleteState === 'Item'
          ? 'name'
          : deleteState === 'HSN'
          ? 'hsncode'
          : 'invoiceNo'
      ]
    : `Select ${deleteState}`}
  <ChevronsUpDown className="opacity-50" />
</Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder={`Search ${deleteState}`} className="h-9" />
                  <CommandList>
                    <CommandEmpty>No result found.</CommandEmpty>
                   <CommandGroup>
  {getEntitiey().map((entity) => {
    let key, id;

    if (deleteState === 'Customer' || deleteState === 'Item') {
      key = entity.name;
      id = entity.id;
    } else if (deleteState === 'HSN') {
      key = entity.hsncode;
      id = entity.id;
    } else {
      key = entity.invoiceNo;
      id = entity.invoiceNo;
    }

    return (
      <CommandItem
        key={id}
        value={String(id)}
        onSelect={() => handleDelete(id)}
      >
        {key}
        <Check className={cn('ml-auto', value === key ? 'opacity-100' : 'opacity-0')} />
      </CommandItem>
    );
  })}
</CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
      </div>
                 {showHsnMaster && (
  <HsnMaster
    open={showHsnMaster}
    onClose={() => {
      setShowHsnMaster(false);
      setSelectedHsn(null); // reset
    }}
    selected={selectedHsn} // ✅ pass selected data
  />
)}

    </div>

  );
};

export default Page;