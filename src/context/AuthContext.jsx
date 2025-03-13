import { createContext, useContext, useState } from 'react';
import { users } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : "guest";
  });

  const login = (username, password) => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
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
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};