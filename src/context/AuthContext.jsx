  import { createContext, useContext, useState } from 'react';
  import { users } from '../utils/auth';
  import { useNavigate } from 'react-router-dom';

  const AuthContext = createContext(null);

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    });


    const login = (username, password) => {
      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        const userInfo = { ...foundUser };
        delete userInfo.password;
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        return true;
      }
      return false;
    };

    const logout = () => {  
      setUser(null);
      localStorage.removeItem('user');
      window.location.replace('/'); // Replaces history, preventing back navigation
    };
    
    

    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  // Custom hook for authentication
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
