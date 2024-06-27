import axios from 'axios';

export const fetchConfigByWorkflowName = async (workflowName: string) => {
  try {
    const response = await axios.get(`/api/flows/${workflowName}`);
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
};
