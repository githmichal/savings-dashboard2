// src/components/DataTables/DataTables.js
import React, { useState } from 'react';
import { Tab, Tabs, Card } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import DepartmentsTable from './DepartmentsTable';
import FunctionsTable from './FunctionsTable';
import UsersTable from './UsersTable';
import TimeTable from './TimeTable';
import './DataTables.css';

function DataTables() {
  const { dataLoaded } = useAppData();
  const [activeTab, setActiveTab] = useState('departments');

  if (!dataLoaded) {
    return null;
  }

  return (
    <section className="mb-4">
      <h2 className="mb-3">Szczegółowe dane</h2>
      <Card>
        <Card.Body>
          <Tabs
            id="dataTabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="departments" title="Działy">
              <DepartmentsTable />
            </Tab>
            <Tab eventKey="functions" title="Funkcje">
              <FunctionsTable />
            </Tab>
            <Tab eventKey="users" title="Użytkownicy">
              <UsersTable />
            </Tab>
            <Tab eventKey="time" title="Trendy czasowe">
              <TimeTable />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </section>
  );
}

export default DataTables;