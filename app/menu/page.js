'use client'
import React, { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from 'next/navigation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command"
import { cn } from "../../lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"

const Page = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [customer, setCustomer] = useState([])
  const [alterState, setAlterState] = useState('')
  const [item, setItem] = useState([])
  const [next, setNext] = useState('')
  const [alter, setAlter] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch('/api/get-item')
        const result = await response.json()
        setItem(result.item)
      } catch (error) {
        console.error('Error fetching Item data:', error)
        alert('Failed to fetch item.')
      }
    }

    const fetchCust = async () => {
      try {
        const response = await fetch('/api/get-customer')
        const result = await response.json()
        setCustomer(result.customer)
      } catch (error) {
        console.error('Error fetching Customer data:', error)
        alert('Failed to fetch customer.')
      }
    }

    fetchCust()
    fetchItem()
  }, [])

  const handleSelect = (currentValue) => {
    const newValue = currentValue === value ? "" : currentValue;
  setValue(newValue);
  setOpen(false);
  
  // Navigate immediately with the new value
  if (newValue) {
    if(alterState=='Customer'){
      router.push(`/customeralter?value=${newValue}`);
    }else{
      router.push(`/itemalter?value=${newValue}`);
    }
  }
  }
  

  return (
    <div className='p-4'>
      <div className='bg-white w-full h-[46vw] p-4'>
        <h2 className='bg-white font-extrabold'>My Business</h2>
        <div className='bg-white flex flex-col'>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="bg-white font-bold text-lg">
                <div className='bg-white'>
                  <CurrencyRupeeOutlinedIcon style={{ background: 'white' }} />&nbsp;Sale
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white">
                <div className='w-full bg-white text-lg cursor-pointer' onClick={() => router.push('/saleinvoice')}>Sale Invoice</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-2">
              <AccordionTrigger className="bg-white font-bold text-lg">
                <div className='bg-white'>
                  <ShoppingCartOutlinedIcon style={{ background: 'white' }} />&nbsp;Purchase
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white">
                <div className='w-full bg-white text-lg'>Sale Invoice</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-3">
              <AccordionTrigger className="bg-white font-bold text-lg">
                <div className='bg-white'>
                  <ShoppingCartOutlinedIcon style={{ background: 'white' }} />&nbsp;Master
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Customer</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Customer</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push('/customeradd')}>
                        Create
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => (setAlter(true), setAlterState('Customer'))}>
                        Alter
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AccordionContent>
              <AccordionContent className="bg-white">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Items</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Item</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push('/itemadd')}>
                        Create
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => (setAlter(true), setAlterState('Item'))}>
                        Alter
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className={`mt-10 ${alter ? 'flex' : 'hidden'}`}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {value ? item.find((items) => items.name === value)?.name : `Select ${alterState}`}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder={`Search ${alterState}`} className="h-9" />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {(alterState === 'Customer' ? customer : item).map((entity) => (
                        <CommandItem
                          key={entity.name}
                          value={entity.name}
                          onSelect={handleSelect}
                        >
                          {entity.name}
                          <Check className={cn("ml-auto", value === entity.name ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
