import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



import { Outlet } from "react-router-dom";



function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<h1> This is Home ..... </h1>} />
        <Route path="about" element={<h1> This is About ..... </h1>} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
       
          <Route path="login" element={<h1> This is Login ..... </h1>} />
          <Route path="register" element={<h1> This is Register ..... </h1> } />
        </Route>

        {/* Concerts Routes */}
        <Route path="concerts">
          <Route index element={<ConcertsHome   />} />
          <Route path="*" element={<h1> This is ConcertsHome  city..... </h1>} />
          <Route path="trending" element={<h1> This is trendig ..... </h1> } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;



const AuthLayout = () => {
  return (
    <div>
      <h2>Authentication</h2>
      <Outlet /> {/* Renders Login or Register */}
    </div>
  );
};


const ConcertsHome = () => {
    return (
      <div>
        <h2>Welcome to Concerts</h2>
        <p>Find concerts in your city!</p>
      </div>
    );
  };
  
  