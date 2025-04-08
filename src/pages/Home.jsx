import { Link } from "react-router-dom"

const Home = (second) => { 
    
    return(
<div className="h-screen bg-blue-700 flex justify-center items-center">
  <div className="text-center">
    <h1 className="text-4xl font-bold text-white">This is the Landing Page</h1>
    <p className="mt-4 text-lg text-white">Welcome to our platform!</p>
    <Link to="/login">
          <button className="mt-6 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300">
            Login
          </button>
        </Link>
  </div>
</div>

       
      
    )
  }

  export default Home