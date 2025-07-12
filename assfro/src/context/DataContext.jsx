import { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [dataState, setDataState] = useState({
    csvData: null,
    schema: null,
    targetColumn: '',
    metrics: null,
    predictions: null,
    featureImportance: [],
    insights: [],
    error: '',
    sessionId: null,
    modelId: null
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('aiAnalystData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setDataState(parsedData);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  const updateData = (newData) => {
    const updatedState = { ...dataState, ...newData };
    setDataState(updatedState);
    
    // Save to localStorage
    localStorage.setItem('aiAnalystData', JSON.stringify(updatedState));
  };

  const resetData = () => {
    const resetState = {
      csvData: null,
      schema: null,
      targetColumn: '',
      metrics: null,
      predictions: null,
      featureImportance: [],
      insights: [],
      error: '',
      sessionId: null,
      modelId: null
    };
    setDataState(resetState);
    localStorage.removeItem('aiAnalystData');
  };

  return (
    <DataContext.Provider value={{ dataState, updateData, resetData }}>
      {children}
    </DataContext.Provider>
  );
};