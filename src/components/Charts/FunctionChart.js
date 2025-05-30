import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency } from '../../utils/dataProcessing';

// Rejestracja wszystkich komponentów Chart.js
Chart.register(...registerables);

function FunctionChart() {
  const { appData, filters, dataLoaded } = useAppData();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!dataLoaded || !chartRef.current) return;

    // Filtrowanie danych na podstawie filtrów
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

    // Zniszcz poprzedni wykres jeśli istnieje
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Tworzenie nowego wykresu
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: filteredFunctions.map(func => func.function),
        datasets: [
          {
            label: 'Oszczędności netto (PLN)',
            data: filteredFunctions.map(func => func.netSavings),
            backgroundColor: '#FF5000',
            borderWidth: 0,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Zaoszczędzony czas (godz.)',
            data: filteredFunctions.map(func => func.timeSavedMinutes / 60), // Konwersja minut na godziny
            backgroundColor: '#FF8040',
            borderWidth: 0,
            yAxisID: 'y-axis-2'
          }
        ]
      },
      options: {
        indexAxis: 'y',  // Poziomy wykres słupkowy
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return context.dataset.label + ': ' + formatCurrency(context.raw);
                } else {
                  return context.dataset.label + ': ' + context.raw.toFixed(1) + ' godz.';
                }
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          'y-axis-1': {
            position: 'left',
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(' PLN', '');
              }
            }
          },
          'y-axis-2': {
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: function(value) {
                return value + ' godz.';
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
        Podział oszczędności według funkcji
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </Card.Body>
    </Card>
  );
}

export default FunctionChart;