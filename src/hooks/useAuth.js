import { useState, useEffect } from 'react';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const status = localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsLoggedIn(status);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const login = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
  };

  return { isLoggedIn, login, logout };
}
