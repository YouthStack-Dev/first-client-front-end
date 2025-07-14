import {useState, useEffect } from 'react';
const useAuth = () => {
    const [isAuthenticated,setIsAuthenticated] = useState(false);
    const [loading ,setLoading] = useState(true);

    useEffect(() =>{
        const token =localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    return {isAuthenticated,loading};
};

export default useAuth;




