// src/components/DataTables/UsersTable.js
import React from 'react';
import { Table } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency, formatPercent } from '../../utils/dataProcessing';

function UsersTable() {
  const { appData } = useAppData();
  
  return (
    <div className="table-responsive">
      <Table striped>
        <thead>
          <tr>
            <th>Użytkownik</th>
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
          {appData.users.map((user, index) => (
            <tr key={index}>
              <td>{user.user}</td>
              <td>{user.rowCount}</td>
              <td>{formatCurrency(user.appCost)}</td>
              <td>{formatCurrency(user.workerCost)}</td>
              <td>{formatCurrency(user.grossSavings)}</td>
              <td>{formatCurrency(user.netSavings)}</td>
              <td>{user.timeSaved}</td>
              <td>{formatPercent(user.roi)}</td>
            </tr>
          ))}
          
          {appData.users.length > 1 && (
            <tr className="table-secondary fw-bold">
              <td>RAZEM</td>
              <td>{appData.users.reduce((sum, user) => sum + user.rowCount, 0)}</td>
              <td>{formatCurrency(appData.users.reduce((sum, user) => sum + user.appCost, 0))}</td>
              <td>{formatCurrency(appData.users.reduce((sum, user) => sum + user.workerCost, 0))}</td>
              <td>{formatCurrency(appData.users.reduce((sum, user) => sum + user.grossSavings, 0))}</td>
              <td>{formatCurrency(appData.users.reduce((sum, user) => sum + user.netSavings, 0))}</td>
              <td>{calculateTotalTime(appData.users)}</td>
              <td>{calculateTotalROI(appData.users)}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(users) {
  const totalMinutes = users.reduce((sum, user) => sum + user.timeSavedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} godz. ${minutes} min`;
}

// Funkcja do obliczania łącznego ROI
function calculateTotalROI(users) {
  const totalCost = users.reduce((sum, user) => sum + user.appCost + user.workerCost, 0);
  const totalNetSavings = users.reduce((sum, user) => sum + user.netSavings, 0);
  const roi = totalCost > 0 ? (totalNetSavings / totalCost) * 100 : 0;
  return formatPercent(roi);
}

export default UsersTable;