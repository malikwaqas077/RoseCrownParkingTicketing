// src/context/AuthContext.tsx
import  { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';
import { login as loginService } from '../services/authService';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You can add more logic here to verify the token or fetch the user data
      setUser({ token });
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const data = await loginService(username, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, handleLogin, handleLogout }}>
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
