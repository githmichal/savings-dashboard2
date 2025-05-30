import Papa from 'papaparse';

// Obiekt do przechowywania zaimportowanych danych
export const createEmptyAppData = () => ({
  general: {},
  departments: [],
  functions: [],
  users: [],
  timeTrends: {
    quarters: [],
    weeks: [],
    days: []
  },
  meta: {
    lastUpdate: null,
    availableFunctions: []
  }
});

// Parsowanie pliku CSV
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.data && results.data.length > 0) {
          resolve(results.data);
        } else {
          reject(new Error('Nie udało się wczytać danych z pliku CSV.'));
        }
      },
      error: function(error) {
        reject(error);
      }
    });
  });
};

// Wyciągnij liczbę ze stringa (np. "123.45 PLN" -> 123.45)
export const extractNumberFromString = (str) => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  
  const matches = str.toString().match(/[-+]?[0-9]*\.?[0-9]+/g);
  return matches ? parseFloat(matches[0]) : 0;
};

// Konwertuj czas w formacie "X godz. Y min" na minuty
export const convertTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  if (typeof timeStr === 'number') return timeStr;
  
  let totalMinutes = 0;
  
  // Wyciągnij godziny
  const hoursMatch = timeStr.match(/(\d+)\s*godz/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  // Wyciągnij minuty
  const minutesMatch = timeStr.match(/(\d+)\s*min/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  return totalMinutes;
};

// Przetwarzanie danych z CSV
export const processData = (data) => {
  try {
    // Inicjalizacja pustych danych
    const appData = createEmptyAppData();
    
    // Sekcje danych
    let currentSection = '';
    let sectionStartRow = 0;
    let headerRow = [];
    
    // Iteracja przez wiersze danych
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Wykrywanie sekcji (bardziej elastyczne - dopuszcza numery lub ich brak)
      if (row[0] && typeof row[0] === 'string') {
        // Wskaźniki ogólne
        if (row[0].includes('WSKAŹNIKI OGÓLNE')) {
          currentSection = 'general';
          sectionStartRow = i + 1;
          continue;
        }
        // Podsumowanie wg działów
        else if (row[0].includes('PODSUMOWANIE WG DZIAŁÓW')) {
          currentSection = 'departments';
          sectionStartRow = i + 1;
          continue;
        }
        // Podsumowanie wg funkcji
        else if (row[0].includes('PODSUMOWANIE WG FUNKCJI')) {
          currentSection = 'functions';
          sectionStartRow = i + 1;
          continue;
        }
        // Podsumowanie wg użytkowników
        else if (row[0].includes('PODSUMOWANIE WG UŻYTKOWNIKÓW')) {
          currentSection = 'users';
          sectionStartRow = i + 1;
          continue;
        }
        // Trendy czasowe
        else if (row[0].includes('TRENDY CZASOWE')) {
          currentSection = 'time';
          continue;
        }
        // Podsumowanie wg kwartałów
        else if (row[0].includes('PODSUMOWANIE WG KWARTAŁÓW')) {
          currentSection = 'quarters';
          sectionStartRow = i + 1;
          continue;
        }
        // Podsumowanie wg tygodni roku
        else if (row[0].includes('PODSUMOWANIE WG TYGODNI ROKU')) {
          currentSection = 'weeks';
          sectionStartRow = i + 1;
          continue;
        }
        // Podsumowanie wg dni tygodnia
        else if (row[0].includes('PODSUMOWANIE WG DNI TYGODNIA')) {
          currentSection = 'days';
          sectionStartRow = i + 1;
          continue;
        }
        // Ostatnia aktualizacja
        else if (row[0].includes('Ostatnia aktualizacja')) {
          appData.meta.lastUpdate = row[0].split(': ')[1];
          continue;
        }
      }
      
      // Przetwarzanie wiersza nagłówkowego
      if (i === sectionStartRow) {
        headerRow = row;
        continue;
      }
      
      // Przetwarzanie danych w zależności od sekcji
      if (i > sectionStartRow) {
        switch(currentSection) {
          case 'general':
            if (row[0] === 'Całkowite koszty aplikacji') {
              appData.general.totalAppCost = extractNumberFromString(row[1]);
            } else if (row[0] === 'Całkowite koszty pracownika') {
              appData.general.totalWorkerCost = extractNumberFromString(row[1]);
            } else if (row[0] === 'Całkowite koszty łączne') {
              appData.general.totalCost = extractNumberFromString(row[1]);
            } else if (row[0] === 'Całkowite oszczędności brutto') {
              appData.general.totalGrossSavings = extractNumberFromString(row[1]);
            } else if (row[0] === 'Całkowite oszczędności netto') {
              appData.general.totalNetSavings = extractNumberFromString(row[1]);
            } else if (row[0] === 'Całkowity zaoszczędzony czas') {
              appData.general.totalTimeSaved = row[1];
              appData.general.totalTimeSavedMinutes = convertTimeToMinutes(row[1]);
            } else if (row[0] === 'ROI') {
              appData.general.roi = extractNumberFromString(row[1]);
            }
            break;
            
          case 'departments':
            // Ignoruj wiersz sumy (RAZEM)
            if (row[0] !== 'RAZEM') {
              appData.departments.push({
                department: row[0],
                rowCount: row[1],
                appCost: extractNumberFromString(row[2]),
                workerCost: extractNumberFromString(row[3]),
                grossSavings: extractNumberFromString(row[4]),
                netSavings: extractNumberFromString(row[5]),
                timeSaved: row[6],
                timeSavedMinutes: convertTimeToMinutes(row[6]),
                roi: extractNumberFromString(row[7])
              });
            }
            break;
            
          case 'functions':
            // Ignoruj wiersz sumy (RAZEM)
            if (row[0] !== 'RAZEM') {
              const functionData = {
                function: row[0],
                department: row[1],
                rowCount: row[2],
                appCost: extractNumberFromString(row[3]),
                workerCost: extractNumberFromString(row[4]),
                grossSavings: extractNumberFromString(row[5]),
                netSavings: extractNumberFromString(row[6]),
                timeSaved: row[7],
                timeSavedMinutes: convertTimeToMinutes(row[7]),
                roi: extractNumberFromString(row[8])
              };
              
              appData.functions.push(functionData);
              
              // Dodaj funkcję do listy dostępnych funkcji, jeśli jeszcze jej tam nie ma
              if (!appData.meta.availableFunctions.includes(row[0])) {
                appData.meta.availableFunctions.push(row[0]);
              }
            }
            break;
            
          case 'users':
            // Ignoruj wiersz sumy (RAZEM)
            if (row[0] !== 'RAZEM') {
              appData.users.push({
                user: row[0],
                rowCount: row[1],
                appCost: extractNumberFromString(row[2]),
                workerCost: extractNumberFromString(row[3]),
                grossSavings: extractNumberFromString(row[4]),
                netSavings: extractNumberFromString(row[5]),
                timeSaved: row[6],
                timeSavedMinutes: convertTimeToMinutes(row[6]),
                roi: extractNumberFromString(row[7])
              });
            }
            break;
            
          case 'quarters':
            // Ignoruj wiersz sumy (RAZEM)
            if (row[0] !== 'RAZEM') {
              appData.timeTrends.quarters.push({
                quarter: row[0],
                rowCount: row[1],
                appCost: extractNumberFromString(row[2]),
                workerCost: extractNumberFromString(row[3]),
                grossSavings: extractNumberFromString(row[4]),
                netSavings: extractNumberFromString(row[5]),
                timeSaved: row[6],
                timeSavedMinutes: convertTimeToMinutes(row[6]),
                roi: extractNumberFromString(row[7])
              });
            }
            break;
            
          case 'weeks':
            // Ignoruj wiersz sumy (RAZEM)
            if (row[0] !== 'RAZEM') {
              appData.timeTrends.weeks.push({
                week: row[0],
                rowCount: row[1],
                appCost: extractNumberFromString(row[2]),
                workerCost: extractNumberFromString(row[3]),
                netSavings: extractNumberFromString(row[4]),
                roi: extractNumberFromString(row[5])
              });
            }
            break;
            
          case 'days':
            // Ignoruj wiersz sumy (RAZEM)
            if (row[0] !== 'RAZEM') {
              appData.timeTrends.days.push({
                day: row[0],
                rowCount: row[1],
                appCost: extractNumberFromString(row[2]),
                workerCost: extractNumberFromString(row[3]),
                netSavings: extractNumberFromString(row[4]),
                roi: extractNumberFromString(row[5])
              });
            }
            break;
          default:
            break;
        }
      }
    }
    
    return appData;
  } catch (error) {
    console.error('Błąd podczas przetwarzania danych:', error);
    throw new Error('Wystąpił błąd podczas przetwarzania danych: ' + error.message);
  }
};

// Formatuj walutę (PLN)
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 PLN';
  return new Intl.NumberFormat('pl-PL', { 
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Formatuj procent
export const formatPercent = (value) => {
  if (!value && value !== 0) return '0%';
  return new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};