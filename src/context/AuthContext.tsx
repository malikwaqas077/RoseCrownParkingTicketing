import  { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import axios from '../utils/axiosConfig';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthData: (data: { token: string; user: any }) => void;
  handleLogin: (email: string, password: string) => Promise<any>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log("this is token", token)
      if (token) {
        console.log("token exists")
        try {
          const response = await axios.get('/api/protected');
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const setAuthData = (data: { token: string; user: any }) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await axios.post('/api/login', { email, password });
    const { token, user } = response.data;
    setAuthData({ token, user });
    return user;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, setAuthData, handleLogin, handleLogout }}>
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