import { createContext, useState, useEffect } from 'react';

export const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  const [models, setModels] = useState([]);

  // Load models from localStorage on mount
  useEffect(() => {
    const savedModels = localStorage.getItem('aiAnalystModels');
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels);
        setModels(parsedModels);
      } catch (error) {
        console.error('Error loading models from localStorage:', error);
      }
    }
  }, []);

  const addModel = (modelId, name) => {
    const newModels = [...models, { id: modelId, name }];
    setModels(newModels);
    localStorage.setItem('aiAnalystModels', JSON.stringify(newModels));
  };

  const updateModels = (newModels) => {
    setModels(newModels);
    localStorage.setItem('aiAnalystModels', JSON.stringify(newModels));
  };

  const clearModels = () => {
    setModels([]);
    localStorage.removeItem('aiAnalystModels');
  };

  return (
    <ModelContext.Provider value={{ models, addModel, updateModels, clearModels }}>
      {children}
    </ModelContext.Provider>
  );
};