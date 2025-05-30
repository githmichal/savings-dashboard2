// src/components/Charts/DepartmentChart.js
import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency } from '../../utils/dataProcessing';

// Rejestracja wszystkich komponentów Chart.js
Chart.register(...registerables);

function DepartmentChart() {
  const { appData, filters, dataLoaded } = useAppData();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!dataLoaded || !chartRef.current) return;

    // Filtrowanie danych na podstawie filtrów
    const filteredDepartments = appData.departments.filter(dept => {
      if (filters.app !== 'all' && dept.department.toLowerCase() !== filters.app.toLowerCase()) {
        return false;
      }
      return true;
    });

    // Zniszcz poprzedni wykres jeśli istnieje
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Tworzenie nowego wykresu
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: filteredDepartments.map(dept => dept.department),
        datasets: [
          {
            label: 'Oszczędności netto',
            data: filteredDepartments.map(dept => dept.netSavings),
            backgroundColor: '#FF5000',
            borderWidth: 0
          },
          {
            label: 'Koszty aplikacji',
            data: filteredDepartments.map(dept => dept.appCost),
            backgroundColor: '#FFA573',
            borderWidth: 0
          },
          {
            label: 'Koszty pracownika',
            data: filteredDepartments.map(dept => dept.workerCost),
            backgroundColor: '#FFCBAD',
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(' PLN', '');
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [appData, filters, dataLoaded]);

  if (!dataLoaded) {
    return null;
  }

  return (
    <Card className="h-100">
      <Card.Header>
        Podział oszczędności według działów
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </Card.Body>
    </Card>
  );
}

export default DepartmentChart;