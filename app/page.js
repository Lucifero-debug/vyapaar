'use client'
import Image from "next/image";
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import BallotIcon from '@mui/icons-material/Ballot';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";

export default function Home() {
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const router=useRouter()
  return (
    <div className="sm:m-[4vw] flex flex-col gap-5">
   <div className="bg-white w-full h-[18vh] absolute top-0 left-0 rounded-lg flex flex-col text-black gap-5">
    <div className="flex justify-between ">
<StorefrontIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
<input type="text" className="w-[39vw] sm:w-[55vw] border-2 border-black bg-white"/>
<NotificationsIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
<SettingsIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
    </div>
    <div className="bg-white flex justify-between px-10">
      <button className="border-2 border-black rounded-lg w-36 h-12">Transaction Deatils</button>
      <button className="border-2 border-black rounded-lg w-36 h-12">Party Details</button>
    </div>
   </div>
   <div className="bg-gray-500 w-full h-[21vh] mt-[20vh] sm:mt-[14vh] rounded-lg flex flex-col sm:p-4 gap-3">
    <h2 className=" font-bold">Quick Links</h2>
    <div className=" flex justify-between">
      <div className="flex flex-col cursor-pointer  items-center justify-center">
<AddBoxIcon  style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
<p className="">Add Txn</p>
      </div>
      <div className="flex flex-col cursor-pointer items-center justify-center">
<ReceiptIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
<p className="">Sale Report</p>
      </div>
      <div className="flex flex-col cursor-pointer items-center justify-center">
<SettingsIcon  style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
<p className="">Txn Settings</p>
      </div>
      <div className="flex flex-col cursor-pointer items-center justify-center">
<ChevronRightIcon  style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
<p className="">Show All</p>
      </div>
    </div>
   </div>
   <div className="bg-white w-full h-[19vh] rounded-lg">helo</div> 
   <div className="bg-white w-full h-[12vh] rounded-lg absolute bottom-0 left-0 flex items-center gap-10 justify-between p-5 sm:gap-7">
   <div className="flex flex-col w-[7vw] text-black  items-center justify-center bg-white">
    <HomeIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}} className=""/>
    <p className="text-lg bg-white">Home</p>
    </div> 
   <div className="flex flex-col w-[7vw] text-black items-center justify-center cursor-pointer bg-white">
<DashboardIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
    <p className="text-lg bg-white">Dashboard</p>
    </div> 
   <div className="flex flex-col w-[7vw] text-black items-center justify-center bg-white">
<BallotIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
    <p className="text-lg bg-white">Item</p>
    </div> 
   <div className="flex flex-col w-[7vw] text-black items-center justify-center cursor-pointer bg-white" onClick={()=>router.push('/menu')}>
<MenuIcon style={{fontSize: isSmallScreen ? '30px' : '60px'}}/>
    <p className="text-lg bg-white">Menu</p>
    </div> 
    </div> 
    </div>
  );
}
