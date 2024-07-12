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
      if (token) {
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

  const fetchExternalToken = async () => {
    try {
      const response = await axios.post('https://e850837e-0018-401b-9f24-fb730bd5a456.mock.pstmn.io/oauth/token', {
        grant_type: 'client_credentials',
        client_secret: 'secret_token',
        client_id: 'id',
        provider: 'staff',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      console.log("External toke is", access_token);
      localStorage.setItem('external_token', access_token);
    } catch (error) {
      console.error('Error fetching external token:', error);
    }
  };

  const setAuthData = (data: { token: string; user: any }) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await axios.post('/api/login', { email, password });
    const { token, user } = response.data;
    setAuthData({ token, user });
    
    // Fetch external token after successful login
    await fetchExternalToken();

    return user;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('external_token');
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
