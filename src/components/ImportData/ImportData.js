// src/components/ImportData/ImportData.js
import React, { useState, useRef } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { parseCSVFile, processData } from '../../utils/dataProcessing';
import './ImportData.css';

function ImportData() {
  const { updateAppData, dataSource: contextDataSource, refreshInterval, changeRefreshInterval, autoRefresh, toggleAutoRefresh } = useAppData();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Używamy wartości z kontekstu jako wartości początkowej
  const [dataSource, setDataSource] = useState(contextDataSource || 'file'); // 'file' lub 'api'
  const [localRefreshInterval, setLocalRefreshInterval] = useState(refreshInterval || 5);
  const fileInputRef = useRef(null);
  
  // URL do naszego API Google Sheets
  const API_URL = 'https://script.google.com/macros/s/AKfycbx2VeHln3nrvxb8l0jb0rr3QZZHa3kJD532MHjJVxN1lvWEo81V4Urd1NYHWwYyMhXJ6w/exec';

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDataSourceChange = (e) => {
    setDataSource(e.target.value);
    // Resetujemy błędy przy zmianie źródła danych
    setError(null);
  };
  
  // Funkcja obsługująca zmianę interwału odświeżania
  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setLocalRefreshInterval(value);
    // Aktualizujemy wartość w kontekście
    changeRefreshInterval(value);
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (dataSource === 'file') {
        // Istniejąca logika importu z pliku CSV
        if (!selectedFile) {
          throw new Error('Nie wybrano pliku.');
        }
        
        // Parsowanie i przetwarzanie pliku CSV (istniejący kod)
        const parsedData = await parseCSVFile(selectedFile);
        const processedData = processData(parsedData);
        updateAppData(processedData, 'file');
      } else {
        // Nowa logika pobierania danych z API
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Problem z pobraniem danych: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Sprawdzamy, czy otrzymane dane zawierają informację o błędzie
        if (data.error) {
          throw new Error(`Błąd API: ${data.message}`);
        }
        
        // Aktualizujemy dane w aplikacji, przekazując informację o źródle
        updateAppData(data, 'api');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Błąd importu:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Obsługa drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('active');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('active');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Import danych</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Dodajemy przełącznik wyboru źródła danych */}
        <Form.Group className="mb-3">
          <Form.Label>Wybierz źródło danych:</Form.Label>
          <div className="d-flex">
            <Form.Check
              type="radio"
              label="Plik CSV"
              name="dataSource"
              id="fileSource"
              value="file"
              checked={dataSource === 'file'}
              onChange={handleDataSourceChange}
              className="me-3"
            />
            <Form.Check
              type="radio"
              label="Dane na żywo (Google Sheets)"
              name="dataSource"
              id="apiSource"
              value="api"
              checked={dataSource === 'api'}
              onChange={handleDataSourceChange}
            />
          </div>
        </Form.Group>
        
        {/* Wyświetlamy sekcję wyboru pliku tylko jeśli wybrano źródło 'file' */}
        {dataSource === 'file' ? (
          <div 
            className="drop-zone mb-3"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Form.Group>
              <Form.Label>Wybierz plik CSV z danymi oszczędności:</Form.Label>
              <Form.Control
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="mb-3"
              />
              <p className="text-muted">lub przeciągnij i upuść plik tutaj</p>
            </Form.Group>
          </div>
        ) : (
          // Wyświetlamy opcje konfiguracji API, jeśli wybrano źródło 'api'
          <div className="api-config mb-3">
            <Form.Group className="mb-3">
              <Form.Label>Interwał odświeżania danych (minuty):</Form.Label>
              <Form.Select 
                value={localRefreshInterval} 
                onChange={handleIntervalChange}
              >
                <option value="1">Co 1 minutę</option>
                <option value="5">Co 5 minut</option>
                <option value="15">Co 15 minut</option>
                <option value="30">Co 30 minut</option>
                <option value="60">Co 1 godzinę</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Check 
              type="switch"
              id="auto-refresh-switch"
              label="Automatyczne odświeżanie"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
              className="mb-2"
            />
            
            <p className="text-muted">
              Dane będą pobierane bezpośrednio z Google Sheets 
              {autoRefresh 
                ? ` i automatycznie odświeżane co ${localRefreshInterval} ${localRefreshInterval === 1 ? 'minutę' : localRefreshInterval < 5 ? 'minuty' : 'minut'}.` 
                : '. Automatyczne odświeżanie jest wyłączone.'}
            </p>
          </div>
        )}
        
        <div className="d-flex justify-content-between align-items-center">
          <Button 
            variant="primary" 
            onClick={handleImport}
            disabled={dataSource === 'file' && !selectedFile || isLoading}
          >
            {isLoading ? 'Importowanie...' : 'Importuj dane'}
          </Button>
          {dataSource === 'file' && selectedFile && (
            <span className="text-muted small">
              Wybrany plik: {selectedFile.name}
            </span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ImportData;