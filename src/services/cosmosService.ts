export const fetchConfigBySiteId = async (siteId: string) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/config/${siteId}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching config by site ID:', error);
    throw error;
  }
};
