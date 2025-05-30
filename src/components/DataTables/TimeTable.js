// src/components/DataTables/TimeTable.js
import React from 'react';
import { Table } from 'react-bootstrap';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency, formatPercent } from '../../utils/dataProcessing';

function TimeTable() {
  const { appData, filters } = useAppData();
  
  // Wybierz dane w zależności od aktualnego filtru
  let timeData = [];
  
  switch(filters.period) {
    case 'quarter':
      timeData = appData.timeTrends.quarters;
      break;
    case 'day':
      timeData = appData.timeTrends.days;
      break;
    case 'week':
    case 'all':
    default:
      timeData = appData.timeTrends.weeks;
      break;
  }
  
  // Określenie etykiety okresu
  const getPeriodLabel = (period) => {
    if (filters.period === 'quarter') {
      return `Kwartał ${period.quarter}`;
    } else if (filters.period === 'day') {
      return period.day;
    } else {
      return `Tydzień ${period.week}`;
    }
  };
  
  // Sprawdzenie czy dane zawierają kolumnę grossSavings i timeSaved
  const hasDetailedData = timeData.length > 0 && 'grossSavings' in timeData[0] && 'timeSaved' in timeData[0];
  
  return (
    <div className="table-responsive">
      <Table striped>
        <thead>
          <tr>
            <th>Okres</th>
            <th>Liczba wierszy</th>
            <th>Koszty aplikacji</th>
            <th>Koszty pracownika</th>
            {hasDetailedData && <th>Oszczędności brutto</th>}
            <th>Oszczędności netto</th>
            {hasDetailedData && <th>Zaoszczędzony czas</th>}
            <th>ROI</th>
          </tr>
        </thead>
        <tbody>
          {timeData.map((period, index) => (
            <tr key={index}>
              <td>{getPeriodLabel(period)}</td>
              <td>{period.rowCount}</td>
              <td>{formatCurrency(period.appCost)}</td>
              <td>{formatCurrency(period.workerCost)}</td>
              {hasDetailedData && <td>{formatCurrency(period.grossSavings)}</td>}
              <td>{formatCurrency(period.netSavings)}</td>
              {hasDetailedData && <td>{period.timeSaved}</td>}
              <td>{formatPercent(period.roi)}</td>
            </tr>
          ))}
          
          {timeData.length > 1 && (
            <tr className="table-secondary fw-bold">
              <td>RAZEM</td>
              <td>{timeData.reduce((sum, period) => sum + period.rowCount, 0)}</td>
              <td>{formatCurrency(timeData.reduce((sum, period) => sum + period.appCost, 0))}</td>
              <td>{formatCurrency(timeData.reduce((sum, period) => sum + period.workerCost, 0))}</td>
              {hasDetailedData && <td>{formatCurrency(timeData.reduce((sum, period) => sum + period.grossSavings, 0))}</td>}
              <td>{formatCurrency(timeData.reduce((sum, period) => sum + period.netSavings, 0))}</td>
              {hasDetailedData && <td>{calculateTotalTime(timeData)}</td>}
              <td>{calculateTotalROI(timeData)}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(periods) {
  if (!periods[0].timeSavedMinutes) return '0 godz. 0 min';
  
  const totalMinutes = periods.reduce((sum, period) => sum + period.timeSavedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} godz. ${minutes} min`;
}

// Funkcja do obliczania łącznego ROI
function calculateTotalROI(periods) {
  const totalCost = periods.reduce((sum, period) => sum + period.appCost + period.workerCost, 0);
  const totalNetSavings = periods.reduce((sum, period) => sum + period.netSavings, 0);
  const roi = totalCost > 0 ? (totalNetSavings / totalCost) * 100 : 0;
  return formatPercent(roi);
}

export default TimeTable;