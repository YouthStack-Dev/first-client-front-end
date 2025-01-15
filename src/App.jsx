// App.jsx
import React from 'react';
import {  Route, Routes, Navigate } from 'react-router-dom';

import Dashboard from './components/Dashbord';

import { useAuth } from './store/ AuthProvider';
import LoginPage from './Components/Login';
import Drivers from './Components/Drivers';



const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const App = () => {
    return (
      
            <Routes>
                <Route path="/" element={<h1> THis is the landing page </h1>} />
                <Route path="/login" element={<LoginPage />} />

             {/*  This is Parent route  */}
                <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /></ProtectedRoute>}> 
                {/*  this is chiled routes  */}
                 <Route index element={<h1> its a dashbord content </h1>} />
                 <Route path="drivers" element={<ProtectedRoute roles={[ 'user', 'admin' ]}><Drivers/></ProtectedRoute>} />
                 <Route path="settings" element={<ProtectedRoute roles={['admin']}><h1> this is  Settings </h1></ProtectedRoute>} />
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
