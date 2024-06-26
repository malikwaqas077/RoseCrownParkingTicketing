// src/services/siteService.ts
import axios from 'axios';

export const fetchFlows = async () => {
  const response = await axios.get('/api/flows', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const addSite = async (siteData: any) => {
  await axios.post('/api/sites', siteData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
