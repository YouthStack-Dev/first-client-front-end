  import { useState } from "react"
  import { GlobalContext } from "./context";


  const GlobalProvider=({children})=>{

      const [isHovered, setIsHovered] = useState(false);

    const [selectedRows, setSelectedRows] = useState([]);

    const [user, setUser] = useState(null);

    const login = (username, password) => {
      // Simulate API call - in production, this would be a real API call
      const mockUsers = {
        'superadmin@demo.com': { role: 'super_admin', name: 'John Doe' },
        'admin@demo.com': { role: 'admin', name: 'Jane Smith' },
        'client@demo.com': { role: 'client_admin', name: 'Mike Johnson' }
      };
  
      if (mockUsers[username] && password === 'password') {
        setUser({ ...mockUsers[username], email: username });
        return true;
      }
      return false;
    };
  
    const logout = () => {
      setUser(null);
    };
  

  return(

      <GlobalContext.Provider  value  ={{isHovered, setIsHovered,selectedRows,user, login, logout,setSelectedRows}}>
                    {children}
      </GlobalContext.Provider>
  )
  }
    

  export default GlobalProvider;