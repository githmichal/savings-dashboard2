// src/components/GeneralIndicators/GeneralIndicators.js
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency, formatPercent } from '../../utils/dataProcessing';
import './GeneralIndicators.css';

function GeneralIndicators() {
  const { appData, dataLoaded } = useAppData();

  if (!dataLoaded) {
    return null;
  }

  return (
    <section className="mb-4">
      <h2 className="mb-3">Wskaźniki ogólne</h2>
      <Row className="g-3">
        <Col md={3}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <h5 className="card-title text-muted">Koszty łączne</h5>
              <p className="card-text fs-3 fw-bold indicator-value">
                {formatCurrency(appData.general.totalCost)}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <h5 className="card-title text-muted">Oszczędności netto</h5>
              <p className="card-text fs-3 fw-bold indicator-value">
                {formatCurrency(appData.general.totalNetSavings)}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <h5 className="card-title text-muted">Zaoszczędzony czas</h5>
              <p className="card-text fs-3 fw-bold indicator-value">
                {appData.general.totalTimeSaved || '0 godz.'}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <h5 className="card-title text-muted">ROI</h5>
              <p className="card-text fs-3 fw-bold indicator-value">
                {formatPercent(appData.general.roi)}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

export default GeneralIndicators;