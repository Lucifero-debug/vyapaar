'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const page = () => {
  const router=useRouter()
  return (
    <div className='p-4 flex flex-col gap-3'>
        <div className='bg-white h-14 p-2'>
<p className='bg-white'>Total Sale</p>
<h2 className='bg-white font-bold'>&#8377;350.00</h2>
        </div>
        <div className='bg-white h-28 p-2'>
<p className='bg-white'>Prashant Kumar</p>
<h2 className='bg-white font-bold'>&#8377;350.00</h2>
<p className='text-slate-400 bg-white'>Balance:150.00</p>
        </div>
        <button className='w-[10vw] h-[7vh] rounded-lg bg-red-800 text-white active:scale-125' onClick={()=>router.push('/saleadd')}>Add Sale</button>
    </div>
  )
}

export default page