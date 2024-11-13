import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [role, setRole] = useState(''); // Thêm role vào state
  const [user_id, setId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    const storedUserId = localStorage.getItem('user_id');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          setIsLoggedIn(true);
          setUser(user);
          setRole(decodedToken.role); // Lấy role từ token
          setId(storedUserId || decodedToken.user_id); // Lấy user_id từ token hoặc từ localStorage
          setId(decodedToken.user_id);
        } else {
          localStorage.removeItem('access_token');
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', user);
    const decodedToken = jwtDecode(token);
    setIsLoggedIn(true);
    setUser(user);
    setRole(decodedToken.role); // Lưu role khi đăng nhập
    setId(decodedToken.user_id);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    setUser('');
    setRole('');
    setId('');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, role, user_id}}>
      {children}
    </AuthContext.Provider>
  );
};
