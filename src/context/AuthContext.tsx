import { createContext, useState, useContext, ReactNode, FC } from 'react';
import { login as loginService } from '../services/authService';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  handleLogin: (email: string, password: string) => Promise<any>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const handleLogin = async (email: string, password: string) => {
    const data = await loginService(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user; // Return the user data
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
