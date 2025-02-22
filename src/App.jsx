// App.jsx
import React from 'react';
import {  Route, Routes, Navigate } from 'react-router-dom';

const App = () => {

   
    return (
      
            <Routes>
                <Route path="/" element={<h1> THis is the landing page hiii  man ss </h1>} />
            

               {/*  This is Parent route  */}
                <Route path="/dashboard" element={ <h1> this is the dash board </h1>}> 
                {/*  this is chiled routes  */}
                 <Route index element={<h1> its a dashbord content

                    <br />
                    <button onClick={hancleclick}> click here  </button>
                     </h1>} />
                 <Route path="drivers" element={<h1> this is  Drivers </h1>} />
                 <Route path="settings" element={<h1> this is  Settings </h1>} />
                </Route>


                <Route path="*" element={<NotFound/>} />    
            </Routes>
      
    );
};

export default App;


const NotFound =()=>{

    return<>
    <h1 className=' items-center test-2xl'> Page Not Found </h1>
    </>
}