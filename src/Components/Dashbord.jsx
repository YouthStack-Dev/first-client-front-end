// Dashboard.jsx
import React, { useContext } from 'react';

import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { GlobalContext } from '../store/context';
import { Menu } from 'lucide-react';


const Dashboard = () => {

     
  const { isHovered, setIsHovered } = useContext(GlobalContext); // Correct usage

  const handlenav=()=>{
setIsHovered(true)
 }
    return (
       

       
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="flex-1 bg-gray-100 ">
          {/*  only  this will be displayed in the  small screen  */}
        <nav className="flex items-center justify-between p-4 bg-red-500 shadow-md lg:hidden">
    {/* Menu Button */}
      <button
         onClick={handlenav}
        className="text-white hover:bg-red-600 p-2 rounded-lg"
        aria-label="Toggle Menu"
      >
        <Menu size={24} />
      </button>
      {/* Branding / Logo */}

      <h1 className="text-white text-lg font-bold">MyApp</h1>

  
     
    </nav>
         <Outlet/>  
        </main>
        </div>
     
    );
};

export default Dashboard;
