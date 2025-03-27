'use client'
import { useRouter } from 'next/navigation';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Backbutton = () => {
    const router = useRouter();
  return (
    <button onClick={()=>router.back()}><ArrowBackIcon sx={{fontSize:'40px'}}/></button>
  )
}

export default Backbutton