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
  const API_URL = 'https://script.google.com/macros/s/AKfycbwnP4fnHSOtmyyyNeeDWfpifL92F1w3hAV-D2WY7AhqdjHoz29RD86pe_KWnR35LFqdfw/exec';

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
        // Nowa logika pobierania danych z API z rozszerzonym logowaniem
        console.log('Rozpoczynam pobieranie danych z API:', API_URL);
        
        try {
          const response = await fetch(API_URL);
          console.log('Status odpowiedzi:', response.status, response.statusText);
          
          // Sprawdź, czy odpowiedź jest w formacie JSON
          const contentType = response.headers.get('content-type');
          console.log('Typ zawartości odpowiedzi:', contentType);
          
          if (!response.ok) {
            // Spróbuj pobrać tekst błędu, nawet jeśli odpowiedź nie jest OK
            const errorText = await response.text();
            console.error('Treść odpowiedzi z błędem:', errorText);
            throw new Error(`Problem z pobraniem danych: ${response.statusText}. Status: ${response.status}`);
          }
          
          // Spróbuj przetworzyć odpowiedź jako JSON, ale z obsługą błędów
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
          
          console.log('Dane zostały pomyślnie pobrane i przetworzone');
          
          // Aktualizujemy dane w aplikacji, przekazując informację o źródle
          updateAppData(data, 'api');
        } catch (fetchError) {
          console.error('Szczegółowy błąd fetch:', fetchError);
          
          // Sprawdź problemy związane z CORS
          if (fetchError.message.includes('CORS') || 
              fetchError.message.includes('Failed to fetch') || 
              fetchError.message.includes('Network error')) {
            console.error('Prawdopodobny problem z CORS lub konfiguracją Google Apps Script');
            throw new Error('Problem z komunikacją z API. Sprawdź ustawienia CORS w Google Apps Script lub dostępność API.');
          }
          
          throw fetchError;
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Błąd importu:', err);
      // Rozszerzone informacje o błędzie
      const errorDetails = err.stack || err.toString();
      console.error('Szczegóły błędu:', errorDetails);
      setError(`${err.message} (Otwórz konsolę przeglądarki, aby zobaczyć więcej szczegółów)`);
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
            disabled={(dataSource === 'file' && !selectedFile) || isLoading}
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