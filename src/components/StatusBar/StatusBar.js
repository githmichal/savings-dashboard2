// src/components/StatusBar/StatusBar.js
import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import './StatusBar.css';

function StatusBar() {
  const { dataSource, autoRefresh, refreshInterval, refreshData, appData } = useAppData();
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Ustawiamy czas ostatniego odświeżenia przy pierwszym renderowaniu
  // lub gdy zmienią się dane
  useEffect(() => {
    if (dataSource === 'api' && appData.meta && appData.meta.lastUpdate) {
      setLastRefreshTime(new Date().toLocaleTimeString());
    }
  }, [dataSource, appData]);
  
  // Ustawiamy czas następnego odświeżenia
  useEffect(() => {
    if (dataSource === 'api' && autoRefresh) {
      const now = new Date();
      const next = new Date(now.getTime() + refreshInterval * 60 * 1000);
      setNextRefreshTime(next.toLocaleTimeString());
      
      // Aktualizujemy licznik odliczający czas do następnego odświeżenia
      const intervalId = setInterval(() => {
        const now = new Date();
        const nextRefresh = new Date(now.getTime() + refreshInterval * 60 * 1000);
        const diffMs = nextRefresh - now;
        
        if (diffMs <= 0) {
          setTimeRemaining("Odświeżanie...");
        } else {
          const diffMins = Math.floor(diffMs / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          setTimeRemaining(`${diffMins}:${diffSecs < 10 ? '0' : ''}${diffSecs}`);
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    } else {
      setNextRefreshTime(null);
      setTimeRemaining(null);
    }
  }, [dataSource, autoRefresh, refreshInterval, lastRefreshTime]);
  
  // Funkcja do ręcznego odświeżenia danych
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setLastRefreshTime(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  };
  
  // Nie wyświetlamy paska statusu, jeśli dane nie pochodzą z API
  if (dataSource !== 'api') {
    return null;
  }

  return (
    <Alert variant="info" className="status-bar d-flex justify-content-between align-items-center">
      <div>
        <strong>Status API:</strong> Połączono z Google Sheets
        {lastRefreshTime && <span> | Ostatnie odświeżenie: {lastRefreshTime}</span>}
        {autoRefresh && nextRefreshTime && (
          <span> | Następne odświeżenie: {timeRemaining ? `za ${timeRemaining}` : "wkrótce"}</span>
        )}
      </div>
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? 'Odświeżanie...' : 'Odśwież teraz'}
      </Button>
    </Alert>
  );
}

export default StatusBar;