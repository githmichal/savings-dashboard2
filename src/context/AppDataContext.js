import React, { createContext, useState, useContext } from 'react';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [appData, setAppData] = useState({
    general: {},
    departments: [],
    functions: [],
    users: [],
    timeTrends: {
      quarters: [],
      weeks: [],
      days: []
    },
    meta: {
      lastUpdate: null,
      availableFunctions: []
    }
  });

  const [filters, setFilters] = useState({
    period: 'all',
    app: 'all',
    function: 'all'
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  // Aktualizacja danych aplikacji
  const updateAppData = (newData) => {
    setAppData(newData);
    setDataLoaded(true);
  };

  // Aktualizacja filtrów
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <AppDataContext.Provider value={{
      appData,
      filters,
      dataLoaded,
      updateAppData,
      updateFilters
    }}>
      {children}
    </AppDataContext.Provider>
  );
};