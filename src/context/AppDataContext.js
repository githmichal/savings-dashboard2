// src/context/AppDataContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// URL do API Google Sheets
const API_URL = 'https://script.google.com/macros/s/AKfycbzO7W9sw4ZIhCYAjh42uat2eMBwUphf7VBLuOizj2uesRl5NwD_dUPCfqrJuYCEtCj2DA/exec';

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
  
  // Ręczne odświeżenie danych z API - użyj useCallback aby uniknąć rekonstrukcji
  const refreshData = useCallback(async () => {
    // Odświeżamy tylko jeśli dane pochodzą z API
    if (dataSource === 'api' && dataLoaded) {
      try {
        console.log('Rozpoczynam odświeżanie danych z API:', API_URL);
        const response = await fetch(API_URL);
        console.log('Status odpowiedzi:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Treść odpowiedzi z błędem:', errorText);
          throw new Error(`Problem z pobraniem danych: ${response.statusText}. Status: ${response.status}`);
        }
        
        // Sprawdź, czy odpowiedź jest w formacie JSON
        let data;
        const responseText = await response.text();
        console.log('Treść odpowiedzi (pierwsze 200 znaków):', responseText.substring(0, 200));
        
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Błąd parsowania JSON:', jsonError);
          console.error('Otrzymany tekst (pierwsze 500 znaków):', responseText.substring(0, 500));
          throw new Error('Otrzymano nieprawidłowy format danych (nie JSON)');
        }
        
        // Sprawdzamy, czy otrzymane dane zawierają informację o błędzie
        if (data.error) {
          console.error('API zwróciło błąd:', data.message, data);
          throw new Error(`Błąd API: ${data.message}`);
        }
        
        // Aktualizujemy dane w aplikacji
        setAppData(data);
        console.log('Dane odświeżone z API:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Błąd odświeżania danych:', error);
        console.error('Szczegóły błędu:', error.stack || error.toString());
        // Można tutaj zaimplementować pokazywanie błędu użytkownikowi, np. przez state
      }
    }
  }, [dataSource, dataLoaded]); // Dodaj zależności do useCallback
  
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