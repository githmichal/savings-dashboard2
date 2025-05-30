import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import './Filters.css';

function Filters() {
  const { filters, updateFilters, appData, dataLoaded } = useAppData();

  // Obsługa zmiany filtrów
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateFilters({ [name]: value });
  };

  // Jeśli dane nie zostały jeszcze załadowane, ukryj filtry
  if (!dataLoaded) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Filtry</Card.Title>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Okres:</Form.Label>
              <Form.Select 
                name="period"
                value={filters.period}
                onChange={handleFilterChange}
              >
                <option value="all">Wszystkie okresy</option>
                <option value="quarter">Kwartały</option>
                <option value="week">Tygodnie</option>
                <option value="day">Dni tygodnia</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Aplikacja:</Form.Label>
              <Form.Select 
                name="app"
                value={filters.app}
                onChange={handleFilterChange}
              >
                <option value="all">Wszystkie</option>
                <option value="kaufland">Kaufland</option>
                <option value="emag">eMAG</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Funkcja:</Form.Label>
              <Form.Select 
                name="function"
                value={filters.function}
                onChange={handleFilterChange}
              >
                <option value="all">Wszystkie funkcje</option>
                {appData.meta.availableFunctions.map((func, index) => (
                  <option key={index} value={func}>{func}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default Filters;