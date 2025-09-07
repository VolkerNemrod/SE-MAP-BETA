// dataLoader.js
// Prosta funkcja do ładowania i parsowania CSV z pliku (średnik jako separator)

// Funkcja ładuje CSV, parsuje do tablicy obiektów JS i wywołuje callback z tymi danymi
function loadSystemDataCsv(csvPath, callback) {
    // AGRESYWNE CACHE BUSTING dla serwerów komercyjnych (Mikrus/cyberFolks)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const cacheBuster = `?v=${timestamp}&r=${randomId}&nocache=1`;
    const urlWithCacheBuster = csvPath + cacheBuster;
    
    // Maksymalne opcje anti-cache
    fetch(urlWithCacheBuster, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }
    })
        .then(resp => resp.text())
        .then(csv => {
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(';');
            const data = lines.slice(1).map(line => {
                // Obsługuje cudzysłowy w komórkach (aby nie pociąć pól z średnikami/opisem!)
                const values = [];
                let buffer = '';
                let inQuote = false;
                for (let i = 0; i < line.length; ++i) {
                    const ch = line[i];
                    if (ch === '"' && line[i+1] === '"') { buffer += '"'; ++i; continue; }
                    if (ch === '"') { inQuote = !inQuote; continue; }
                    if (ch === ';' && !inQuote) { values.push(buffer); buffer = ''; continue; }
                    buffer += ch;
                }
                values.push(buffer);
                const row = {};
                headers.forEach((h, i) => row[h.trim()] = (values[i]||'').trim());
                // Konwersja typów: liczby, kolor (z hex na int)
                row.x = parseFloat((row.x||'').replace(',', '.'));
                row.y = parseFloat((row.y||'').replace(',', '.'));
                row.z = parseFloat((row.z||'').replace(',', '.'));
                row.diameter = parseFloat((row.diameter||'').replace(',', '.'));
                row.color = parseInt((row.color+"").replace(/^0x/i,'').replace('#',''), 16) || 0xffffff;
                // Obsługa kolumny gravityRange (może być pusta)
                if (row.gravityRange && row.gravityRange.trim()) {
                    row.gravityRange = parseFloat(row.gravityRange.replace(',', '.'));
                } else {
                    row.gravityRange = null; // Będzie używany domyślny
                }
                return row;
            }).filter(row => row.name); // Filter out empty rows
            
            // Process danger zones - only auto-calculate if position is 0,0,0
            data.forEach(obj => {
                if (obj.objectType === 'danger_zone' && obj.containedObjects) {
                    // Only auto-calculate if position is at origin (0,0,0) and diameter is 0
                    if (obj.x === 0 && obj.y === 0 && obj.z === 0 && obj.diameter === 0) {
                        const containedNames = obj.containedObjects.split(',').map(name => name.trim());
                        const containedObjs = data.filter(item => containedNames.includes(item.name));
                        
                        if (containedObjs.length > 0) {
                            // Calculate center of mass
                            let centerX = 0, centerY = 0, centerZ = 0;
                            containedObjs.forEach(contained => {
                                centerX += contained.x;
                                centerY += contained.y;
                                centerZ += contained.z;
                            });
                            centerX /= containedObjs.length;
                            centerY /= containedObjs.length;
                            centerZ /= containedObjs.length;
                            
                            // Calculate maximum distance from center
                            let maxDistance = 0;
                            containedObjs.forEach(contained => {
                                const distance = Math.sqrt(
                                    Math.pow(contained.x - centerX, 2) +
                                    Math.pow(contained.y - centerY, 2) +
                                    Math.pow(contained.z - centerZ, 2)
                                );
                                // Add object radius to distance
                                const objectRadius = (contained.diameter * 1000) / 2;
                                const totalDistance = distance + objectRadius;
                                if (totalDistance > maxDistance) {
                                    maxDistance = totalDistance;
                                }
                            });
                            
                            // Set zone position and size with margin from gravityRange (in km)
                            obj.x = centerX;
                            obj.y = centerY;
                            obj.z = centerZ;
                            const marginKm = obj.gravityRange || 50; // Default 50km margin
                            const marginMeters = marginKm * 1000;
                            const zoneDiameterKm = ((maxDistance + marginMeters) * 2) / 1000; // Convert to km
                            obj.diameter = zoneDiameterKm;
                        }
                    }
                    // If position/diameter are specified in CSV, use them as-is
                }
            });
            
            callback(data);
        })
        .catch(error => {
            console.error('Błąd ładowania CSV:', error);
            // Spróbuj ponownie bez cache bustera jako fallback
            fetch(csvPath, { cache: 'reload' })
                .then(resp => resp.text())
                .then(csv => {
                    console.log('🔄 Próba załadowania CSV z fallback...');
                    const lines = csv.trim().split('\n');
                    const headers = lines[0].split(';');
                    const data = lines.slice(1).map(line => {
                        // Obsługuje cudzysłowy w komórkach (aby nie pociąć pól z średnikami/opisem!)
                        const values = [];
                        let buffer = '';
                        let inQuote = false;
                        for (let i = 0; i < line.length; ++i) {
                            const ch = line[i];
                            if (ch === '"' && line[i+1] === '"') { buffer += '"'; ++i; continue; }
                            if (ch === '"') { inQuote = !inQuote; continue; }
                            if (ch === ';' && !inQuote) { values.push(buffer); buffer = ''; continue; }
                            buffer += ch;
                        }
                        values.push(buffer);
                        const row = {};
                        headers.forEach((h, i) => row[h.trim()] = (values[i]||'').trim());
                        // Konwersja typów: liczby, kolor (z hex na int)
                        row.x = parseFloat((row.x||'').replace(',', '.'));
                        row.y = parseFloat((row.y||'').replace(',', '.'));
                        row.z = parseFloat((row.z||'').replace(',', '.'));
                        row.diameter = parseFloat((row.diameter||'').replace(',', '.'));
                        row.color = parseInt((row.color+"").replace(/^0x/i,'').replace('#',''), 16) || 0xffffff;
                        // Obsługa kolumny gravityRange (może być pusta)
                        if (row.gravityRange && row.gravityRange.trim()) {
                            row.gravityRange = parseFloat(row.gravityRange.replace(',', '.'));
                        } else {
                            row.gravityRange = null; // Będzie używany domyślny
                        }
                        return row;
                    }).filter(row => row.name); // Filter out empty rows
                    
                    // Process danger zones - only auto-calculate if position is 0,0,0
                    data.forEach(obj => {
                        if (obj.objectType === 'danger_zone' && obj.containedObjects) {
                            // Only auto-calculate if position is at origin (0,0,0) and diameter is 0
                            if (obj.x === 0 && obj.y === 0 && obj.z === 0 && obj.diameter === 0) {
                                const containedNames = obj.containedObjects.split(',').map(name => name.trim());
                                const containedObjs = data.filter(item => containedNames.includes(item.name));
                                
                                if (containedObjs.length > 0) {
                                    // Calculate center of mass
                                    let centerX = 0, centerY = 0, centerZ = 0;
                                    containedObjs.forEach(contained => {
                                        centerX += contained.x;
                                        centerY += contained.y;
                                        centerZ += contained.z;
                                    });
                                    centerX /= containedObjs.length;
                                    centerY /= containedObjs.length;
                                    centerZ /= containedObjs.length;
                                    
                                    // Calculate maximum distance from center
                                    let maxDistance = 0;
                                    containedObjs.forEach(contained => {
                                        const distance = Math.sqrt(
                                            Math.pow(contained.x - centerX, 2) +
                                            Math.pow(contained.y - centerY, 2) +
                                            Math.pow(contained.z - centerZ, 2)
                                        );
                                        // Add object radius to distance
                                        const objectRadius = (contained.diameter * 1000) / 2;
                                        const totalDistance = distance + objectRadius;
                                        if (totalDistance > maxDistance) {
                                            maxDistance = totalDistance;
                                        }
                                    });
                                    
                                    // Set zone position and size with margin from gravityRange (in km)
                                    obj.x = centerX;
                                    obj.y = centerY;
                                    obj.z = centerZ;
                                    const marginKm = obj.gravityRange || 50; // Default 50km margin
                                    const marginMeters = marginKm * 1000;
                                    const zoneDiameterKm = ((maxDistance + marginMeters) * 2) / 1000; // Convert to km
                                    obj.diameter = zoneDiameterKm;
                                }
                            }
                            // If position/diameter are specified in CSV, use them as-is
                        }
                    });
                    
                    console.log('✅ Załadowano CSV z fallback');
                    callback(data);
                })
                .catch(fallbackError => {
                    console.error('❌ Fallback również nie powiódł się:', fallbackError);
                    // Wywołaj callback z pustą tablicą jako ostatnia deska ratunku
                    callback([]);
                });
        });
}

// Ustaw funkcję jako globalną, by była widoczna w innych plikach JS
window.loadSystemDataCsv = loadSystemDataCsv;
