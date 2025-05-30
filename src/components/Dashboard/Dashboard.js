// src/components/Dashboard/Dashboard.js
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import GeneralIndicators from '../GeneralIndicators/GeneralIndicators';
import DepartmentChart from '../Charts/DepartmentChart';
import FunctionChart from '../Charts/FunctionChart';
import TimeChart from '../Charts/TimeChart';
import DataTables from '../DataTables/DataTables';
import './Dashboard.css';

function Dashboard() {
  const { dataLoaded } = useAppData();

  // Jeśli dane nie zostały jeszcze załadowane, ukryj dashboard
  if (!dataLoaded) {
    return (
      <div className="text-center py-5 no-data-view">
        <div className="py-5 my-5">
          <i className="bi bi-cloud-upload fs-1 text-muted"></i>
          <h3 className="mt-3">Brak danych do wyświetlenia</h3>
          <p className="text-muted">Zaimportuj plik CSV, aby zobaczyć dashboard oszczędności.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GeneralIndicators />
      
      <section className="mb-4">
        <h2 className="mb-3">Wykresy oszczędności</h2>
        <Row className="g-4">
          <Col lg={6}>
            <DepartmentChart />
          </Col>
          <Col lg={6}>
            <FunctionChart />
          </Col>
          <Col lg={12}>
            <TimeChart />
          </Col>
        </Row>
      </section>
      
      <DataTables />
    </>
  );
}

export default Dashboard;