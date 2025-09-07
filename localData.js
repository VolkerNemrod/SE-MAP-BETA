// localData.js
// Obsługa lokalnych danych użytkownika przechowywanych w localStorage

class LocalDataManager {
    constructor() {
        this.storageKey = 'se_map_local_data';
        this.localData = this.loadLocalData();
    }

    // Ładowanie danych z localStorage z fallbackiem
    loadLocalData() {
        try {
            // Sprawdź czy localStorage jest dostępne
            if (typeof(Storage) === "undefined" || !window.localStorage) {
                console.warn('localStorage niedostępne - używam pamięci sesji');
                return window.tempLocalData || [];
            }
            
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Błąd ładowania lokalnych danych:', error);
            // Fallback do pamięci sesji
            return window.tempLocalData || [];
        }
    }

    // Zapisywanie danych do localStorage z fallbackiem
    saveLocalData() {
        try {
            // Sprawdź czy localStorage jest dostępne
            if (typeof(Storage) === "undefined" || !window.localStorage) {
                console.warn('localStorage niedostępne - zapisuję w pamięci sesji');
                window.tempLocalData = this.localData;
                return true;
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(this.localData));
            return true;
        } catch (error) {
            console.error('Błąd zapisywania lokalnych danych:', error);
            // Fallback do pamięci sesji
            window.tempLocalData = this.localData;
            return true; // Zwróć true, żeby aplikacja działała dalej
        }
    }

    // Parsowanie formatu GPS Space Engineers
    parseSpaceEngineersGPS(gpsString) {
        // Format rozszerzony: GPS:Nazwa:X:Y:Z:#Kolor:Rozmiar
        // Format standardowy: GPS:Nazwa:X:Y:Z:#Kolor:
        const gpsMatch = gpsString.match(/^GPS:([^:]+):([^:]+):([^:]+):([^:]+):(#[A-Fa-f0-9]{6,8})?:?([^:]*)?:?$/);
        if (!gpsMatch) {
            throw new Error('Nieprawidłowy format GPS Space Engineers');
        }

        const result = {
            name: gpsMatch[1].trim(),
            x: parseFloat(gpsMatch[2].replace(',', '.')) || 0,
            y: parseFloat(gpsMatch[3].replace(',', '.')) || 0,
            z: parseFloat(gpsMatch[4].replace(',', '.')) || 0,
            color: gpsMatch[5] ? parseInt(gpsMatch[5].replace('#', ''), 16) : null
        };

        // Obsługa rozmiaru (w metrach)
        if (gpsMatch[6] && gpsMatch[6].trim()) {
            const size = parseFloat(gpsMatch[6].trim().replace(',', '.'));
            if (size > 0) {
                result.diameter = size; // rozmiar w metrach
            }
        }

        return result;
    }

    // Parsowanie CSV z pliku użytkownika
    parseUserCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('Plik CSV musi zawierać nagłówek i co najmniej jeden wiersz danych');
        }

        const headers = lines[0].split(';').map(h => h.trim());
        
        // Sprawdź czy są wymagane kolumny - teraz wymagamy albo x,y,z albo seGPS
        const hasStandardCoords = ['name', 'x', 'y', 'z'].every(h => headers.includes(h));
        const hasGPSCoords = ['name', 'seGPS'].every(h => headers.includes(h));
        
        if (!hasStandardCoords && !hasGPSCoords) {
            throw new Error('Plik musi zawierać kolumny: name + (x,y,z) lub name + seGPS');
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Obsługa cudzysłowów w CSV
            const values = [];
            let buffer = '';
            let inQuote = false;
            
            for (let j = 0; j < line.length; j++) {
                const ch = line[j];
                if (ch === '"' && line[j+1] === '"') { 
                    buffer += '"'; 
                    j++; 
                    continue; 
                }
                if (ch === '"') { 
                    inQuote = !inQuote; 
                    continue; 
                }
                if (ch === ';' && !inQuote) { 
                    values.push(buffer); 
                    buffer = ''; 
                    continue; 
                }
                buffer += ch;
            }
            values.push(buffer);

            const row = {};
            headers.forEach((h, idx) => {
                row[h] = (values[idx] || '').trim();
            });

            // Konwersja typów
            if (row.name) {
                // Paleta kontrastowych kolorów dla obiektów użytkownika
                const contrastColors = [
                    0xFF4444, // jasny czerwony
                    0x4444FF, // jasny niebieski  
                    0x44FF44, // jasny zielony
                    0xFFFF44, // żółty
                    0xFF44FF, // magenta
                    0x44FFFF, // cyan
                    0xFF8844, // pomarańczowy
                    0x8844FF  // fioletowy
                ];

                // Sprawdź czy jest kolumna seGPS i ma wartość
                if (row.seGPS && row.seGPS.trim()) {
                    try {
                        const gpsData = this.parseSpaceEngineersGPS(row.seGPS.trim());
                        row.x = gpsData.x;
                        row.y = gpsData.y;
                        row.z = gpsData.z;
                        if (gpsData.color !== null) {
                            row.color = gpsData.color;
                        }
                        // Jeśli nazwa w GPS różni się od kolumny name, użyj tej z GPS
                        if (gpsData.name && gpsData.name !== row.name) {
                            row.gpsName = gpsData.name;
                        }
                    } catch (error) {
                        console.warn(`Błąd parsowania GPS dla ${row.name}: ${error.message}`);
                        // Fallback do standardowych współrzędnych
                        row.x = parseFloat((row.x || '0').replace(',', '.')) || 0;
                        row.y = parseFloat((row.y || '0').replace(',', '.')) || 0;
                        row.z = parseFloat((row.z || '0').replace(',', '.')) || 0;
                    }
                } else {
                    // Użyj standardowych współrzędnych
                    row.x = parseFloat((row.x || '0').replace(',', '.')) || 0;
                    row.y = parseFloat((row.y || '0').replace(',', '.')) || 0;
                    row.z = parseFloat((row.z || '0').replace(',', '.')) || 0;
                }

                // Domyślny diameter 2km dla obiektów użytkownika
                row.diameter = parseFloat((row.diameter || '2000').replace(',', '.')) || 2000;
                
                // Domyślne wartości dla opcjonalnych pól
                row.type = row.type || 'Obiekt użytkownika';
                row.objectType = row.objectType || 'user_object';
                row.description = row.description || 'Obiekt dodany przez użytkownika';
                
                // Kolor - priorytet: GPS > kolumna color > losowy kontrastowy
                if (!row.color) {
                    // Wybierz losowy kontrastowy kolor
                    const colorIndex = Math.floor(Math.random() * contrastColors.length);
                    row.color = contrastColors[colorIndex];
                } else if (typeof row.color === 'string') {
                    row.color = parseInt(row.color.replace(/^0x/i,'').replace('#',''), 16);
                }
                
                row.resources = row.resources || '';
                row.poeticDescription = row.poeticDescription || '';
                row.gravityRange = row.gravityRange ? parseFloat(row.gravityRange.replace(',', '.')) : null;
                row.containedObjects = row.containedObjects || '';
                
                // Oznacz jako dane użytkownika
                row.isUserData = true;
                
                data.push(row);
            }
        }

        return data;
    }

    // Dodanie danych z pliku CSV
    addCSVData(csvText, filename = 'user_data.csv') {
        try {
            const newData = this.parseUserCSV(csvText);
            
            // Dodaj informację o źródle
            newData.forEach(item => {
                item.sourceFile = filename;
                item.addedDate = new Date().toISOString();
            });

            this.localData = this.localData.concat(newData);
            this.saveLocalData();
            
            return {
                success: true,
                count: newData.length,
                data: newData
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Pobranie wszystkich lokalnych danych
    getLocalData() {
        return this.localData;
    }

    // Usunięcie danych z konkretnego pliku
    removeDataByFile(filename) {
        const initialCount = this.localData.length;
        this.localData = this.localData.filter(item => item.sourceFile !== filename);
        const removedCount = initialCount - this.localData.length;
        
        if (removedCount > 0) {
            this.saveLocalData();
        }
        
        return removedCount;
    }

    // Wyczyszczenie wszystkich lokalnych danych
    clearAllData() {
        this.localData = [];
        this.saveLocalData();
    }

    // Pobranie listy plików źródłowych
    getSourceFiles() {
        const files = {};
        this.localData.forEach(item => {
            if (!files[item.sourceFile]) {
                files[item.sourceFile] = {
                    name: item.sourceFile,
                    count: 0,
                    addedDate: item.addedDate
                };
            }
            files[item.sourceFile].count++;
        });
        return Object.values(files);
    }

    // Eksport lokalnych danych do CSV
    exportToCSV() {
        if (this.localData.length === 0) {
            return null;
        }

        const headers = ['name', 'type', 'x', 'y', 'z', 'diameter', 'color', 'objectType', 'description', 'resources', 'poeticDescription', 'gravityRange', 'containedObjects', 'seGPS'];
        const csvLines = [headers.join(';')];

        this.localData.forEach(item => {
            const values = headers.map(header => {
                let value = item[header] || '';
                // Jeśli wartość zawiera średnik lub cudzysłów, otocz cudzysłowami
                if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csvLines.push(values.join(';'));
        });

        return csvLines.join('\n');
    }
}

// Globalna instancja managera
window.localDataManager = new LocalDataManager();
