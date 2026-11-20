import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) {
      setChecking(false);
      return;
    }
    api.get('/auth/me')
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = async (loginName, password) => {
    const res = await api.post('/auth/login', { login: loginName, password });
    tokenStore.set(res.token);
    setUser(res.user);
  };

  const value = { user, checking, login, logout, isAdmin: user?.role === 'ADMIN' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
