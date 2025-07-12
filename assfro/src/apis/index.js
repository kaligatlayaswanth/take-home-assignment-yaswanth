import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const trainModel = (sessionId, targetColumn) =>
  api.post(`/train/${sessionId}/`, { 
    target_column: targetColumn 
  });

export const predict = (modelId, data) =>
  api.post(`/predict/${modelId}/`, { 
    input_data: data 
  });

export const getSummary = (modelId) =>
  api.get(`/summary/${modelId}/`);

export default api; 