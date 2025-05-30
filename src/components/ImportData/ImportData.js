import React, { useState, useRef } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { parseCSVFile, processData } from '../../utils/dataProcessing';
import './ImportData.css';

function ImportData() {
  const { updateAppData } = useAppData();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Parsowanie pliku CSV
      const parsedData = await parseCSVFile(selectedFile);
      
      // Przetwarzanie danych
      const processedData = processData(parsedData);
      
      // Aktualizacja danych w kontekście aplikacji
      updateAppData(processedData);
      
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
        
        <div className="d-flex justify-content-between align-items-center">
          <Button 
            variant="primary" 
            onClick={handleImport}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Importowanie...' : 'Importuj dane'}
          </Button>
          <span className="text-muted small">
            {selectedFile && `Wybrany plik: ${selectedFile.name}`}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ImportData;