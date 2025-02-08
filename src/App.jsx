// App.jsx
import React from 'react';
import {  Route, Routes, Navigate } from 'react-router-dom';



// const ProtectedRoute = ({ children, roles }) => {
//     const { isAuthenticated, } = useAuth();
//      const  user ='admin'
//     console.log('user', user );
   
//     if (!isAuthenticated) {
//         console.warn('User is not authenticated. Redirecting to login.');
//         return <Navigate to="/login" />;
//     }

//     if (roles && (!user || !roles.includes(user))) {
//         console.log('User does not have the required role. Redirecting to dashboard.');
//         return <Navigate to="/dashboard" />;
//     }

//     return children;
// };




const hancleclick= async()=>{
 const responce = await  axiosClient.get("create")

 console.log(responce.data);
 
}

const App = () => {

    const { isAuthenticated, user } = useAuth();
    return (
      
            <Routes>
                <Route path="/" element={<h1> THis is the landing page </h1>} />
                <Route     path="/login"element={isAuthenticated ? <Navigate to="/dashboard"
                 replace /> : <LoginPage />}/>


             {/*  This is Parent route  */}
                <Route path="/dashboard" element={ <h1> this is the dash board </h1>}> 
                {/*  this is chiled routes  */}
                 <Route index element={<h1> its a dashbord content

                    <br />
                    <button onClick={hancleclick}> click here  </button>
                     </h1>} />
                 <Route path="drivers" element={<Drivers/>} />
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


{/* <Routes>
<Route path="/" element={<h1> THis is the landing page </h1>} />
<Route     path="/login"element={isAuthenticated ? <Navigate to="/dashboard"
 replace /> : <LoginPage />}/> */}



{/* <Route path="/dashboard" element={ <ProtectedRoute > <Dashboard /></ProtectedRoute>}>  */}

//  <Route index element={<h1> its a dashbord content

//     <br />
//     <button onClick={hancleclick}> click here  </button>
//      </h1>} />
//  <Route path="drivers" element={<ProtectedRoute roles={[ 'user', 'admin' ]}><Drivers/></ProtectedRoute>} />
//  <Route path="settings" element={<ProtectedRoute roles={['admin']}><h1> this is  Settings </h1></ProtectedRoute>} />
// </Route>


// <Route path="*" element={<NotFound/>} />    
// </Routes>