// src/components/ErrorLogger/ErrorLogger.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Collapse, Alert } from 'react-bootstrap';
import './ErrorLogger.css';

// Klasa do przechwytywania i zarządzania błędami w aplikacji
class ErrorLoggerService {
  static instance = null;
  logs = [];
  listeners = [];

  static getInstance() {
    if (!ErrorLoggerService.instance) {
      ErrorLoggerService.instance = new ErrorLoggerService();
      
      // Przechwytuj konsole.error
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Wywołaj oryginalną funkcję
        originalConsoleError.apply(console, args);
        
        // Dodaj wpis do logu
        this.instance.addLog({
          type: 'error',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          timestamp: new Date()
        });
      };
      
      // Przechwytuj niezłapane wyjątki
      window.addEventListener('error', (event) => {
        this.instance.addLog({
          type: 'uncaught',
          message: `Niezłapany błąd: ${event.message} w ${event.filename}:${event.lineno}`,
          timestamp: new Date()
        });
      });
      
      // Przechwytuj odrzucone obietnice
      window.addEventListener('unhandledrejection', (event) => {
        this.instance.addLog({
          type: 'promise',
          message: `Nieobsłużone odrzucenie obietnicy: ${event.reason}`,
          timestamp: new Date()
        });
      });
    }
    return ErrorLoggerService.instance;
  }

  addLog(logEntry) {
    this.logs.unshift(logEntry); // Dodaj na początek, aby najnowsze były na górze
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100); // Ogranicz liczbę logów
    }
    this.notifyListeners();
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.logs));
  }
}

function ErrorLogger() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const logger = ErrorLoggerService.getInstance();
    setLogs(logger.getLogs());
    
    // Subskrybuj aktualizacje logów
    const unsubscribe = logger.subscribe(newLogs => {
      setLogs([...newLogs]);
    });
    
    return () => unsubscribe();
  }, []);

  const handleClearLogs = () => {
    ErrorLoggerService.getInstance().clearLogs();
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const handleCopyLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp.toLocaleTimeString()}] [${log.type}] ${log.message}`)
      .join('\n');
      
    navigator.clipboard.writeText(logText)
      .then(() => alert('Logi skopiowane do schowka'))
      .catch(err => console.error('Błąd kopiowania: ', err));
  };

  if (logs.length === 0 && !isOpen) {
    return null;
  }

  return (
    <Card className="error-logger">
      <Card.Header 
        className="d-flex justify-content-between align-items-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <span className="log-icon">📋</span> Dziennik błędów 
          {logs.length > 0 && <span className="log-badge">{logs.length}</span>}
        </div>
        <Button 
          variant="link" 
          className="p-0" 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? '▼' : '▲'}
        </Button>
      </Card.Header>
      
      <Collapse in={isOpen}>
        <div>
          <Card.Body className="p-2">
            <div className="d-flex justify-content-between mb-2">
              <div>
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="me-1"
                >
                  Wszystkie
                </Button>
                <Button
                  variant={filter === 'error' ? 'danger' : 'outline-danger'}
                  size="sm"
                  onClick={() => setFilter('error')}
                  className="me-1"
                >
                  Błędy
                </Button>
                <Button
                  variant={filter === 'uncaught' ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={() => setFilter('uncaught')}
                  className="me-1"
                >
                  Niezłapane
                </Button>
                <Button
                  variant={filter === 'promise' ? 'info' : 'outline-info'}
                  size="sm"
                  onClick={() => setFilter('promise')}
                >
                  Obietnice
                </Button>
              </div>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleCopyLogs}
                  className="me-1"
                >
                  Kopiuj
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleClearLogs}
                >
                  Wyczyść
                </Button>
              </div>
            </div>
            
            <div className="log-container">
              {filteredLogs.length === 0 ? (
                <Alert variant="info">Brak logów do wyświetlenia</Alert>
              ) : (
                filteredLogs.map((log, index) => (
                  <div key={index} className={`log-entry log-${log.type}`}>
                    <div className="log-time">{log.timestamp.toLocaleTimeString()}</div>
                    <div className="log-message">{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
}

export default ErrorLogger;
export { ErrorLoggerService };