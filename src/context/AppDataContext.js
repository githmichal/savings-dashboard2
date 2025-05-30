// src/context/AppDataContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// URL do API Google Sheets
const API_URL = 'https://script.google.com/macros/s/AKfycbytfqhcMms--K_jiAC6yEPGdG8yO3qAfTTdFtthbKgdbeEg9f1MT8H8dmXVSJiqwgRykw/exec';

// Utworzenie kontekstu
const AppDataContext = createContext();

// Hook do używania kontekstu
export const useAppData = () => useContext(AppDataContext);

// Komponent Provider dla kontekstu
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
  
  // Stan źródła danych
  const [dataSource, setDataSource] = useState('file'); // 'file' lub 'api'
  
  // Stan interwału odświeżania (w minutach)
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // domyślnie 5 minut
  
  // Stan automatycznego odświeżania
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Aktualizacja danych aplikacji
  const updateAppData = (newData, source = 'file') => {
    setAppData(newData);
    setDataLoaded(true);
    setDataSource(source);
    
    // Jeśli dane pochodzą z API, włączamy automatyczne odświeżanie
    if (source === 'api') {
      setAutoRefresh(true);
    }
  };

  // Aktualizacja filtrów
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  // Zmiana interwału odświeżania
  const changeRefreshInterval = (intervalInMinutes) => {
    setRefreshInterval(intervalInMinutes * 60 * 1000);
  };
  
  // Włączanie/wyłączanie automatycznego odświeżania
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  // Ręczne odświeżenie danych z API
  const refreshData = async () => {
    // Odświeżamy tylko jeśli dane pochodzą z API
    if (dataSource === 'api' && dataLoaded) {
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Problem z pobraniem danych: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Sprawdzamy, czy otrzymane dane zawierają informację o błędzie
        if (data.error) {
          throw new Error(`Błąd API: ${data.message}`);
        }
        
        // Aktualizujemy dane w aplikacji
        setAppData(data);
        console.log('Dane odświeżone z API:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Błąd odświeżania danych:', error);
      }
    }
  };
  
  // Automatyczne odświeżanie danych
  useEffect(() => {
    let intervalId = null;
    
    if (autoRefresh && dataSource === 'api' && dataLoaded) {
      intervalId = setInterval(refreshData, refreshInterval);
      console.log(`Ustawiono automatyczne odświeżanie co ${refreshInterval / 60000} minut`);
    }
    
    // Czyszczenie interwału przy odmontowaniu komponentu lub zmianie zależności
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('Wyłączono automatyczne odświeżanie');
      }
    };
  }, [autoRefresh, dataSource, dataLoaded, refreshInterval, refreshData]);

  return (
    <AppDataContext.Provider value={{
      appData,
      filters,
      dataLoaded,
      dataSource,
      autoRefresh,
      refreshInterval: refreshInterval / 60000, // Zwracamy w minutach dla łatwiejszego użycia
      updateAppData,
      updateFilters,
      refreshData,
      toggleAutoRefresh,
      changeRefreshInterval
    }}>
      {children}
    </AppDataContext.Provider>
  );
};