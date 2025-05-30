// src/components/DataTables/DepartmentsTable.js
import React from 'react';
import { Table } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency, formatPercent } from '../../utils/dataProcessing';

function DepartmentsTable() {
  const { appData, filters } = useAppData();
  
  // Filtrowanie danych według wybranych filtrów
  let filteredDepartments = [...appData.departments];
  
  // Filtrowanie według aplikacji (działu)
  if (filters.app !== 'all') {
    filteredDepartments = filteredDepartments.filter(dept => 
      dept.department.toLowerCase() === filters.app.toLowerCase());
  }

  return (
    <div className="table-responsive">
      <Table striped>
        <thead>
          <tr>
            <th>Dział</th>
            <th>Liczba wierszy</th>
            <th>Koszty aplikacji</th>
            <th>Koszty pracownika</th>
            <th>Oszczędności brutto</th>
            <th>Oszczędności netto</th>
            <th>Zaoszczędzony czas</th>
            <th>ROI</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept, index) => (
            <tr key={index}>
              <td>{dept.department}</td>
              <td>{dept.rowCount}</td>
              <td>{formatCurrency(dept.appCost)}</td>
              <td>{formatCurrency(dept.workerCost)}</td>
              <td>{formatCurrency(dept.grossSavings)}</td>
              <td>{formatCurrency(dept.netSavings)}</td>
              <td>{dept.timeSaved}</td>
              <td>{formatPercent(dept.roi)}</td>
            </tr>
          ))}
          
          {filteredDepartments.length > 1 && (
            <tr className="table-secondary fw-bold">
              <td>RAZEM</td>
              <td>{filteredDepartments.reduce((sum, dept) => sum + dept.rowCount, 0)}</td>
              <td>{formatCurrency(filteredDepartments.reduce((sum, dept) => sum + dept.appCost, 0))}</td>
              <td>{formatCurrency(filteredDepartments.reduce((sum, dept) => sum + dept.workerCost, 0))}</td>
              <td>{formatCurrency(filteredDepartments.reduce((sum, dept) => sum + dept.grossSavings, 0))}</td>
              <td>{formatCurrency(filteredDepartments.reduce((sum, dept) => sum + dept.netSavings, 0))}</td>
              <td>{calculateTotalTime(filteredDepartments)}</td>
              <td>{calculateTotalROI(filteredDepartments)}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(departments) {
  const totalMinutes = departments.reduce((sum, dept) => sum + dept.timeSavedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} godz. ${minutes} min`;
}

// Funkcja do obliczania łącznego ROI
function calculateTotalROI(departments) {
  const totalCost = departments.reduce((sum, dept) => sum + dept.appCost + dept.workerCost, 0);
  const totalNetSavings = departments.reduce((sum, dept) => sum + dept.netSavings, 0);
  const roi = totalCost > 0 ? (totalNetSavings / totalCost) * 100 : 0;
  return formatPercent(roi);
}

export default DepartmentsTable;