import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthService } from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('goldenzone_admin_token');
    const storedAdmin = localStorage.getItem('goldenzone_admin_user');

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      try {
        setAdmin(JSON.parse(storedAdmin));
        // Verify with server
        adminAuthService.getProfile()
          .then((res) => {
            if (res.data?.admin) {
              setAdmin(res.data.admin);
              localStorage.setItem('goldenzone_admin_user', JSON.stringify(res.data.admin));
            }
          })
          .catch((err) => {
            // Only force logout if the token was rejected by the server
            if (err.response?.status === 401 || err.response?.status === 403) {
              logout();
            }
          })
          .finally(() => setLoading(false));
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken, adminData) => {
    setToken(newToken);
    setAdmin(adminData);
    localStorage.setItem('goldenzone_admin_token', newToken);
    localStorage.setItem('goldenzone_admin_user', JSON.stringify(adminData));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('goldenzone_admin_token');
    localStorage.removeItem('goldenzone_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
