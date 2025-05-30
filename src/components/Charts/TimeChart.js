import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency } from '../../utils/dataProcessing';

// Rejestracja wszystkich komponentów Chart.js
Chart.register(...registerables);

function TimeChart() {
  const { appData, filters, dataLoaded } = useAppData();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!dataLoaded || !chartRef.current) return;

    // Wybierz dane w zależności od aktualnego filtru
    let timeData = [];
    let labels = [];
    
    switch(filters.period) {
      case 'quarter':
        timeData = appData.timeTrends.quarters;
        labels = timeData.map(q => `Kwartał ${q.quarter}`);
        break;
      case 'day':
        timeData = appData.timeTrends.days;
        labels = timeData.map(d => d.day);
        break;
      case 'week':
      case 'all':
      default:
        // Domyślnie pokazuj dane tygodniowe
        timeData = appData.timeTrends.weeks;
        labels = timeData.map(w => `Tydzień ${w.week}`);
        break;
    }

    // Zniszcz poprzedni wykres jeśli istnieje
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Tworzenie nowego wykresu
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Oszczędności netto (PLN)',
            data: timeData.map(period => period.netSavings),
            backgroundColor: 'rgba(255, 80, 0, 0.1)',
            borderColor: '#FF5000',
            borderWidth: 2,
            fill: true,
            tension: 0.2,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'ROI (%)',
            data: timeData.map(period => period.roi),
            backgroundColor: 'transparent',
            borderColor: '#FF8040',
            borderWidth: 2,
            pointBackgroundColor: '#FF8040',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.2,
            yAxisID: 'y-axis-2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return context.dataset.label + ': ' + formatCurrency(context.raw);
                } else {
                  return context.dataset.label + ': ' + context.raw.toFixed(1) + '%';
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          'y-axis-1': {
            position: 'left',
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(' PLN', '');
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          'y-axis-2': {
            position: 'right',
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              drawOnChartArea: false
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
        Trendy oszczędności w czasie
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TimeChart;