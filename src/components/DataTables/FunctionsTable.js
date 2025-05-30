// src/components/DataTables/FunctionsTable.js
import React from 'react';
import { Table } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency, formatPercent } from '../../utils/dataProcessing';

function FunctionsTable() {
  const { appData, filters } = useAppData();
  
  // Filtrowanie danych według wybranych filtrów
  let filteredFunctions = [...appData.functions];
  
  // Filtrowanie według aplikacji (działu)
  if (filters.app !== 'all') {
    filteredFunctions = filteredFunctions.filter(func => 
      func.department.toLowerCase() === filters.app.toLowerCase());
  }
  
  // Filtrowanie według funkcji
  if (filters.function !== 'all') {
    filteredFunctions = filteredFunctions.filter(func => 
      func.function === filters.function);
  }

  return (
    <div className="table-responsive">
      <Table striped>
        <thead>
          <tr>
            <th>Funkcja</th>
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
          {filteredFunctions.map((func, index) => (
            <tr key={index}>
              <td>{func.function}</td>
              <td>{func.department}</td>
              <td>{func.rowCount}</td>
              <td>{formatCurrency(func.appCost)}</td>
              <td>{formatCurrency(func.workerCost)}</td>
              <td>{formatCurrency(func.grossSavings)}</td>
              <td>{formatCurrency(func.netSavings)}</td>
              <td>{func.timeSaved}</td>
              <td>{formatPercent(func.roi)}</td>
            </tr>
          ))}
          
          {filteredFunctions.length > 1 && (
            <tr className="table-secondary fw-bold">
              <td>RAZEM</td>
              <td></td>
              <td>{filteredFunctions.reduce((sum, func) => sum + func.rowCount, 0)}</td>
              <td>{formatCurrency(filteredFunctions.reduce((sum, func) => sum + func.appCost, 0))}</td>
              <td>{formatCurrency(filteredFunctions.reduce((sum, func) => sum + func.workerCost, 0))}</td>
              <td>{formatCurrency(filteredFunctions.reduce((sum, func) => sum + func.grossSavings, 0))}</td>
              <td>{formatCurrency(filteredFunctions.reduce((sum, func) => sum + func.netSavings, 0))}</td>
              <td>{calculateTotalTime(filteredFunctions)}</td>
              <td>{calculateTotalROI(filteredFunctions)}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(functions) {
  const totalMinutes = functions.reduce((sum, func) => sum + func.timeSavedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} godz. ${minutes} min`;
}

// Funkcja do obliczania łącznego ROI
function calculateTotalROI(functions) {
  const totalCost = functions.reduce((sum, func) => sum + func.appCost + func.workerCost, 0);
  const totalNetSavings = functions.reduce((sum, func) => sum + func.netSavings, 0);
  const roi = totalCost > 0 ? (totalNetSavings / totalCost) * 100 : 0;
  return formatPercent(roi);
}

export default FunctionsTable;