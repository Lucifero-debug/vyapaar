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
import { set } from 'mongoose';

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
  const[bank,setBank]=useState([]);
  const [cash,setCash]=useState([]);
  const [alter, setAlter] = useState(false);
  const [del, setDel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedHsn, setSelectedHsn] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, custRes, invRes,hsnRes,voucherRes] = await Promise.all([
          fetch('/api/get-item'),
          fetch('/api/get-customer'),
          fetch('/api/get-invoice'),
          fetch('/api/get-hsn'),
          fetch('/api/get-voucher'),
        ]);
        const [itemData, custData, invData,hsnData,voucherData] = await Promise.all([
          itemRes.json(),
          custRes.json(),
          invRes.json(),
          hsnRes.json(),
          voucherRes.json(),
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

setBank(
  voucherData.voucher.filter(v => v.paymentType === 'Bank').map(v => ({
    id: v._id,
    name: v.acName || v.accountName || v._id
  })) || []
);
setCash(
  voucherData.voucher.filter(v => v.paymentType === 'Cash').map(v => ({
    id: v._id,
    name: v.acName || v.accountName || v._id
  })) || []
);

// console.log("Fetched Bank:", bank);
console.log("Fetched Cash:", cash);


        // Categorize invoices
        const invoices = invData.invoice || [];
        const saleInv = invoices.filter(inv => inv.type === 'Sale' && !inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
            totalAmount: inv.totalAmount || 0,
            customer:inv.customer.name
        }));
        const purchaseInv = invoices.filter(inv => inv.type === 'Purchase' && !inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
           customer:inv.customer.name
        }));
        const saleRet = invoices.filter(inv => inv.type === 'Sale' && inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
           customer:inv.customer.name
        }));
        const purchaseRet = invoices.filter(inv => inv.type === 'Purchase' && inv.return).map(inv => ({
          invoiceNo: inv.invoiceNo || inv.id,
           customer:inv.customer.name
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

  useEffect(() => {
  if (alter || del) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}, [alter, del]);

console.log("Jaat",saleInvoices)
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

      case'Bank':
            router.push(`/voucheradd?type=Bank&value=${newValue}`);
          break;
      case'Cash':
            router.push(`/voucheradd?type=Cash&value=${newValue}`);
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
  case 'Bank':
      endpoint = `/api/delete-voucher?id=${currentValue}&type=Bank`;
      break;
    case 'Cash':
      endpoint = `/api/delete-voucher?id=${currentValue}&type=Cash`;
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
      window.location.reload();
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
      case 'Bank': return bank;
      case 'Cash': return cash;
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
      case 'Bank': return bank;
      case 'Cash': return cash;
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
                        setDel(false);
                        setAlterState('SaleInvoice');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                     onClick={() => {
                      setAlter (false);
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
                        setDel(false);
                        setAlterState('SaleReturn');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        console.log('Setting deleteState to SaleReturn');
                        setAlter(false);
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
                        setDel(false);
                        setAlterState('PurchaseInvoice');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                     onClick={() => {
                        console.log('Setting deleteState to PurchaseInvoice');
                        setAlter(false);
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
                      setDel(false);
                        setAlterState('Customer');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    onClick={() => {
                        console.log('Setting deleteState to Customer');
                        setAlter(false);
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

             <Accordion type="single" collapsible>
          <AccordionItem value="item-3">
            <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3">
              <ManIcon /> Receive And Payments
            </AccordionTrigger>
            <AccordionContent className="bg-white px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-extrabold text-2xl">
                  Bank
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Bank</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                   <DropdownMenuItem onClick={() => router.push('/voucheradd?type=Bank')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to Bank');
                        console.log("fetched bank:", bank);
                        setDel(false);
                        setAlterState('Bank');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    onClick={() => {
                        console.log('Setting deleteState to Bank');
                        setAlter(false);
                        setDeleteState('Bank');
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
                    Cash
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Cash</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
      <DropdownMenuItem onClick={() => router.push('/voucheradd?type=Cash')}>
                      Create
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Setting alterState to Cash');
                        setDel(false);
                        setAlterState('Cash');
                        setAlter(true);
                      }}
                    >
                      Alter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                     onClick={() => {
                        console.log('Setting deleteState to Cash');
                        setAlter(false);
                        setDeleteState('Cash');
                        setDel(true);
                      }}
                    >Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="bg-gray-50 hover:bg-gray-100 font-bold text-lg rounded-xl px-4 py-3 flex items-center cursor-pointer w-full" onClick={()=>router.push('/voucher')}>
  🧾 Voucher
</div>

        <Accordion type="single" collapsible>
<AccordionItem value="ledger" className="bg-gray-50 rounded-lg">
  <AccordionTrigger className="px-4 py-3 text-lg font-semibold">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" id="ledger"> <path fill="#212121" d="M12 8C11.4477 8 11 8.44772 11 9V11C11 11.5523 11.4477 12 12 12H20C20.5523 12 21 11.5523 21 11V9C21 8.44772 20.5523 8 20 8H12Z"></path> <path fill="#212121" d="M4 3C4 1.89543 4.89543 1 6 1H27C28.1046 1 29 1.89543 29 3V28C29 29.1046 28.1046 30 27 30H6C4.89543 30 4 29.1046 4 28V24.7391C3.09792 24.1616 2.5 23.1506 2.5 22C2.5 20.9218 3.02505 19.9662 3.83341 19.375C3.02505 18.7838 2.5 17.8282 2.5 16.75C2.5 15.6718 3.02505 14.7162 3.83341 14.125C3.02505 13.5338 2.5 12.5782 2.5 11.5C2.5 10.4218 3.02505 9.46622 3.83341 8.875C3.02505 8.28378 2.5 7.32821 2.5 6.25C2.5 5.0994 3.09792 4.08844 4 3.51091V3ZM6 20.2677V25H27V3L6 3V3.00947C6.22342 3.02647 6.44053 3.06606 6.64905 3.12595C6.85055 3.10147 7.19353 3.26251 7.55891 3.54953C8.36306 4.08926 8.91283 4.97865 8.99053 6H9C9 6.09849 8.9806 6.19602 8.94291 6.28701C8.90522 6.37801 8.84997 6.46069 8.78033 6.53033C8.71069 6.59997 8.62801 6.65522 8.53701 6.69291C8.44602 6.7306 8.34849 6.75 8.25 6.75C8.15151 6.75 8.05398 6.7306 7.96299 6.69291C7.87199 6.65522 7.78931 6.59997 7.71967 6.53033C7.65003 6.46069 7.59478 6.37801 7.55709 6.28701C7.5194 6.19602 7.5 6.09849 7.5 6H7.48228C7.37265 5.23358 6.76642 4.62735 6 4.51772V8.25947C6.22342 8.27647 6.44053 8.31606 6.64905 8.37595C6.85055 8.35147 7.19353 8.51251 7.55891 8.79953C8.36306 9.33926 8.91283 10.2286 8.99053 11.25H9C9 11.3485 8.9806 11.446 8.94291 11.537C8.90522 11.628 8.84997 11.7107 8.78033 11.7803C8.71069 11.85 8.62801 11.9052 8.53701 11.9429C8.44602 11.9806 8.34849 12 8.25 12C8.15151 12 8.05398 11.9806 7.96299 11.9429C7.87199 11.9052 7.78931 11.85 7.71967 11.7803C7.65003 11.7107 7.59478 11.628 7.55709 11.537C7.5194 11.446 7.5 11.3485 7.5 11.25H7.48228C7.37265 10.4836 6.76642 9.87735 6 9.76772V13.5095C6.22342 13.5265 6.44053 13.5661 6.64905 13.626C6.85055 13.6015 7.19353 13.7625 7.55891 14.0495C8.36306 14.5893 8.91283 15.4786 8.99053 16.5H9C9 16.5985 8.9806 16.696 8.94291 16.787C8.90522 16.878 8.84997 16.9607 8.78033 17.0303C8.71069 17.1 8.62801 17.1552 8.53701 17.1929C8.44602 17.2306 8.34849 17.25 8.25 17.25C8.15151 17.25 8.05398 17.2306 7.96299 17.1929C7.87199 17.1552 7.78931 17.1 7.71967 17.0303C7.65003 16.9607 7.59478 16.878 7.55709 16.787C7.5194 16.696 7.5 16.5985 7.5 16.5H7.48228C7.37265 15.7336 6.76642 15.1273 6 15.0177V18.7595C6.22342 18.7765 6.44053 18.8161 6.64905 18.876C6.85055 18.8515 7.19353 19.0125 7.55891 19.2995C8.36306 19.8393 8.91283 20.7286 8.99053 21.75H9C9 21.8485 8.9806 21.946 8.94291 22.037C8.90522 22.128 8.84997 22.2107 8.78033 22.2803C8.71069 22.35 8.62801 22.4052 8.53701 22.4429C8.44602 22.4806 8.34849 22.5 8.25 22.5C8.15151 22.5 8.05398 22.4806 7.96299 22.4429C7.87199 22.4052 7.78931 22.35 7.71967 22.2803C7.65003 22.2107 7.59478 22.128 7.55709 22.037C7.5194 21.946 7.5 21.8485 7.5 21.75H7.48228C7.37265 20.9836 6.76642 20.3774 6 20.2677ZM6 27L6 28H27V27H6Z"></path> </svg> Ledger
  </AccordionTrigger>
  <AccordionContent className="bg-white px-4 py-4">
    <div className="flex justify-center">
      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[250px] justify-between"
            >
              {value
                ? customer.find((c) => c.id === value)?.name
                : "Select Customer"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search Customer..." className="h-9" />
              <CommandList>
                <CommandEmpty>No customers found.</CommandEmpty>
                <CommandGroup>
                      <CommandItem
      key="all"
      value="0"
      onSelect={() => {
        setValue("0");
        setOpen(false);
        router.push(`/ledger?customerId=0`);
      }}
    >
      🧾 All Accounts
      <Check
        className={cn(
          "ml-auto",
          value === "0" ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
                  {customer.map((cust) => (
                    <CommandItem
                      key={cust.id}
                      value={String(cust.id)}
                      onSelect={() => {
                        setValue(cust.id);
                        setOpen(false);
                        router.push(`/ledger?customerId=${cust.id}`);
                      }}
                    >
                      {cust.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === cust.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  </AccordionContent>
</AccordionItem>

        </Accordion>

    <Accordion type="single" collapsible>
      <AccordionItem value="itemLedger" className="bg-gray-50 rounded-lg">
        <AccordionTrigger className="px-4 py-3 text-lg font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 32 32"
          >
            <path
              fill="#212121"
              d="M12 8C11.4477 8 11 8.44772 11 9V11C11 11.5523 11.4477 12 12 12H20C20.5523 12 21 11.5523 21 11V9C21 8.44772 20.5523 8 20 8H12Z"
            ></path>
            <path
              fill="#212121"
              d="M4 3C4 1.89543 4.89543 1 6 1H27C28.1046 1 29 1.89543 29 3V28C29 29.1046 28.1046 30 27 30H6C4.89543 30 4 29.1046 4 28V24.7391C3.09792 24.1616 2.5 23.1506 2.5 22C2.5 20.9218 3.02505 19.9662 3.83341 19.375C3.02505 18.7838 2.5 17.8282 2.5 16.75C2.5 15.6718 3.02505 14.7162 3.83341 14.125C3.02505 13.5338 2.5 12.5782 2.5 11.5C2.5 10.4218 3.02505 9.46622 3.83341 8.875C3.02505 8.28378 2.5 7.32821 2.5 6.25C2.5 5.0994 3.09792 4.08844 4 3.51091V3Z"
            ></path>
          </svg>
          Item Ledger
        </AccordionTrigger>

        <AccordionContent className="bg-white px-4 py-4">
          <div className="flex justify-center">
            {loading ? (
              <p>Loading items...</p>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[250px] justify-between">
                    {value
                      ? item.find((item) => item.id === value)?.name
                      : "Select Item"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search Item Ledger..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No items found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all"
                          value="0"
                          onSelect={() => {
                            setValue("0");
                            setOpen(false);
                            router.push(`/item-ledger?itemId=0`);
                          }}
                        >
                          📦 All Items
                          <Check
                            className={cn(
                              "ml-auto",
                              value === "0" ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>

                        {item.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={String(item.id)}
                            onSelect={() => {
                              setValue(item.id);
                              setOpen(false);
                              router.push(`/item-ledger?itemId=${item.id}`);
                            }}
                          >
                            {item.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                value === item.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

        

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
                        const key = alterState === 'Customer' || alterState === 'Item' ? entity.name :  alterState === 'HSN' ? entity.hsncode: alterState === 'Bank' || alterState=='Cash'?entity.id: entity.invoiceNo;
                       const values =
  alterState === 'Customer' || alterState === 'Item'
    ? entity.name
    : alterState === 'HSN'
    ? entity.hsncode
    : alterState === 'SaleInvoice' || alterState === 'PurchaseInvoice'||alterState === 'SaleReturn' || alterState === 'PurchaseReturn'  
    ? entity.invoiceNo
    : alterState === 'Bank' || alterState === 'Cash'
    ? entity.name || entity.id
    : entity.invoiceNo;

                        return (
                          <CommandItem
                            key={key}
                            value={String(key)}
                            onSelect={(currentValue) => handleSelect(currentValue)}
                          >
                            {values}
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
          : deleteState === 'Bank' || deleteState === 'Cash'
          ? e.acName === value
          : e.invoiceNo === value
      )?.[
        deleteState === 'Customer' || deleteState === 'Item'
          ? 'name'
          : deleteState === 'HSN'
          ? 'hsncode'
          : deleteState === 'Bank' || deleteState === 'Cash'
          ? 'acName'
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
   let keys, id;

if (
  deleteState === 'Customer' ||
  deleteState === 'Item'
) {
  keys = entity.name;
  id = entity.id;
} else if (deleteState === 'HSN') {
  keys = entity.hsncode;
  id = entity.id;
}else if (
  deleteState === 'Bank' ||
  deleteState === 'Cash'
) {
  keys = entity.name;
  id = entity.id;
}

else {
  keys = entity.invoiceNo;
  id = entity.invoiceNo;
}


    return (
      <CommandItem
        key={id}
        value={String(id)}
        onSelect={() => handleDelete(id)}
      >
        {keys}
        <Check className={cn('ml-auto', value === keys ? 'opacity-100' : 'opacity-0')} />
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