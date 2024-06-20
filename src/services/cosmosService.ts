export const fetchConfigBySiteId = async (siteId: string) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("THE BASE URL IS:", apiUrl);
    const url = `${apiUrl}/api/config/${siteId}`;
    console.log("Request URL:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    const text = await response.text();
    console.log("Response text:", text);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = JSON.parse(text); // Parse the JSON manually to catch syntax errors
    return data;
  } catch (error) {
    console.error('Error fetching config by site ID:', error);
    throw error;
  }
};
