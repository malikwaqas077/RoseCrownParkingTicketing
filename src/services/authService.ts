// src/services/authService.ts
import axios from 'axios';

export const login = async (email: string, password: string) => {
  console.log("AuthService called with email:", email, "and password:", password);
  const response = await axios.post('/api/login', { email, password });
  return response.data;
};
