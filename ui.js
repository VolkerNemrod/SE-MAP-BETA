// ui.js

let gotoMarkerMesh = null;

function fillDropdownWithObjects() {
    const dropdown = document.getElementById('object-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = `<option value="" data-i18n="ui.placeholders.selectObject">${window.t ? window.t('ui.placeholders.selectObject') : '-- Wybierz obiekt --'}</option>`;
    spaceEngineersData.forEach((obj, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${obj.name} (${obj.type})`;
        dropdown.appendChild(opt);
    });
}

function wireJumpPanel() {
    const btn = document.getElementById('jump-btn');
    btn.addEventListener('click', function() {
        const dropdown = document.getElementById('object-dropdown');
        const coordsInput = document.getElementById('coords-input');
        let dest = null;
        let label = window.t ? window.t('ui.messages.targetPoint') : "Punkt docelowy";
        let addCustomMarker = false;

        // Nie usuwamy poprzedniego markera - będzie zarządzany przez MarkerManager
        // Markery będą usuwane tylko przez czerwony przycisk X

        if (dropdown.value !== "") {
            const idx = parseInt(dropdown.value, 10);
            const obj = spaceEngineersData[idx];
            // Center camera on the actual object position for better viewing
            dest = {
                x: obj.x,
                y: obj.y,
                z: obj.z
            };
            label = obj.name;
            addCustomMarker = false;
        } else if (coordsInput.value.trim() !== "") {
            let val = coordsInput.value.trim();
            if(val.startsWith("GPS:")) {
                const parts = val.split(':');
                if(parts.length >= 5) {
                    const x = parseFloat(parts[2].replace(',', '.'));
                    const y = parseFloat(parts[3].replace(',', '.'));
                    const z = parseFloat(parts[4].replace(',', '.'));
                    if(!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        dest = { x, y, z };
                        label = parts[1] || (window.t ? window.t('ui.messages.gpsPoint') : "Punkt GPS");
                        addCustomMarker = true;
                    }
                }
            } else {
                const parts = val.split(',').map(v => parseFloat(v.replace(' ', '').replace(',', '.')));
                if(parts.length === 3 && parts.every(v => !isNaN(v))) {
                    dest = { x: parts[0], y: parts[1], z: parts[2] };
                    label = window.t ? window.t('ui.messages.coordinatesPoint') : "Punkt współrzędnych";
                    addCustomMarker = true;
                }
            }
            if (!dest) {
                alert(window.t ? window.t('ui.messages.invalidCoordinates') : "Podaj współrzędne w formacie X,Y,Z lub GPS:Nazwa:X:Y:Z...");
                return;
            }
        } else {
            alert(window.t ? window.t('ui.messages.selectObjectOrCoords') : "Wybierz obiekt z listy lub podaj współrzędne.");
            return;
        }
        animateCameraTo(dest);

        if (addCustomMarker) {
            setTimeout(() => {
                showGotoMarker(dest, label);
            }, 600);
        }

        // Panel info po skoku do obiektu z dropdowna
        if (!addCustomMarker && dropdown.value !== "") {
            const idx = parseInt(dropdown.value, 10);
            if (!isNaN(idx) && spaceEngineersData[idx]) {
                showObjectInfo(spaceEngineersData[idx]);
            }
        }
        // Panel info dla punktów ręcznych (koord./GPS)
        if (addCustomMarker) {
            showObjectInfo({
                name: label, x: dest.x, y: dest.y, z: dest.z, type: "punkt docelowy",
                diameter: "—", description: ""
            });
        }
    });
}

function animateCameraTo(targetPos, duration = 1.6) {
    if (!window.camera || !window.target) return;
    
    const startCam = camera.position.clone();
    const startTarget = window.target.clone();
    
    // Calculate optimal camera position to center the object
    const objectCenter = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
    
    // Position camera at a good distance from object (200km away in direction from current position)
    const currentToObject = objectCenter.clone().sub(camera.position).normalize();
    const optimalDistance = 200000; // 200km
    const endCam = objectCenter.clone().sub(currentToObject.multiplyScalar(optimalDistance));
    
    // Target point is the exact center of the object
    const endTarget = objectCenter.clone();

    let startTime = null;
    function animateStep(time) {
        if (!startTime) startTime = time;
        let t = (time - startTime) / (duration * 1000);
        if (t > 1) t = 1;
        
        // Smooth interpolation using easing function
        const easeT = t * t * (3.0 - 2.0 * t); // Smooth step function
        
        camera.position.lerpVectors(startCam, endCam, easeT);
        window.target.lerpVectors(startTarget, endTarget, easeT);
        camera.lookAt(window.target);
        
        if (t < 1) {
            requestAnimationFrame(animateStep);
        } else {
            // Ensure perfect centering at the end
            camera.lookAt(endTarget);
            if (typeof syncCameraSpherical === 'function') syncCameraSpherical();
        }
    }
    requestAnimationFrame(animateStep);
}

function showGotoMarker(pos, label = "") {
    // Użyj MarkerManager zamiast bezpośredniego zarządzania markerami
    let minRadius = Infinity;
    spaceEngineersData.forEach(obj => {
        if (obj.diameter && obj.diameter > 0) {
            const radius = (obj.diameter * 1000) / 2;
            if (radius < minRadius) minRadius = radius;
        }
    });
    const markerRadius = minRadius / 2 || 70000;
    const geometry = new THREE.SphereGeometry(markerRadius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pos.x, pos.y, pos.z);
    
    // Dodaj marker przez MarkerManager
    if (window.markerManager) {
        const markerId = window.markerManager.addMarker(sphere, 'jump', label || 'Punkt skoku');
        console.log(`📍 Dodano marker skoku: ${label} (ID: ${markerId})`);
    } else {
        // Fallback jeśli MarkerManager nie jest dostępny
        scene.add(sphere);
        console.warn('⚠️ MarkerManager niedostępny, używam bezpośredniego dodawania do sceny');
    }
    
    // Zachowaj referencję dla kompatybilności wstecznej
    gotoMarkerMesh = sphere;
}

function showObjectInfo(obj) {
    if (!obj) return;
    
    const infoPanel = document.getElementById('side-info-panel');
    const infoDiv = document.getElementById('object-info');
    
    // Don't overwrite route info unless this is also route info
    if (infoPanel.dataset.showingRoute === 'true' && !obj.type?.includes('analiza kursu')) {
        return; // Keep route info visible
    }
    
    // Show the panel
    infoPanel.style.display = 'block';
    
    // Clear route marking if showing regular object
    if (!obj.type?.includes('analiza kursu')) {
        infoPanel.dataset.showingRoute = 'false';
    }
    
    // Dodaj przycisk X jeśli nie istnieje
    addClearButtonToInfoPanel();
    
    // Format coordinates
    const x = typeof obj.x === 'number' ? formatNumber(obj.x) : obj.x;
    const y = typeof obj.y === 'number' ? formatNumber(obj.y) : obj.y;
    const z = typeof obj.z === 'number' ? formatNumber(obj.z) : obj.z;
    const diameter = typeof obj.diameter === 'number' ? formatNumber(obj.diameter) : obj.diameter;
    
    const xLabel = window.t ? window.t('ui.labels.x') : 'X';
    const yLabel = window.t ? window.t('ui.labels.y') : 'Y';
    const zLabel = window.t ? window.t('ui.labels.z') : 'Z';
    const diameterLabel = window.t ? window.t('ui.labels.diameter') : 'Średnica';
    const kmUnit = window.t ? window.t('ui.labels.km') : 'km';
    const resourcesLabel = window.t ? window.t('ui.labels.resources') : 'Surowce';
    
    // Generuj GPS string dla obiektu (sprawdź czy współrzędne są liczbami)
    const gpsX = typeof obj.x === 'number' ? obj.x.toFixed(2) : obj.x;
    const gpsY = typeof obj.y === 'number' ? obj.y.toFixed(2) : obj.y;
    const gpsZ = typeof obj.z === 'number' ? obj.z.toFixed(2) : obj.z;
    const gpsString = `GPS:${obj.name}:${gpsX}:${gpsY}:${gpsZ}:#FFFFFF:`;
    
    infoDiv.innerHTML = `
        <b>${obj.name}</b> <span style="color:#aaa;font-size:0.95em;">(${obj.type})</span><br>
        <span style="color:#9fa">${xLabel}:</span> ${x}, <span style="color:#9fa">${yLabel}:</span> ${y}, <span style="color:#9fa">${zLabel}:</span> ${z}<br>
        <span style="color:#9af">${diameterLabel}:</span> ${diameter} ${kmUnit}<br>
        ${obj.description ? `<div style="margin-top:8px;color:#ffa;line-height:1.4;">${obj.description}</div>` : ""}
        ${obj.resources ? `<div style="margin-top:6px;color:#acf;"><strong>${resourcesLabel}:</strong> ${obj.resources}</div>` : ""}
        ${obj.poeticDescription ? `<div style="margin-top:8px;padding:8px;background:rgba(0,100,0,0.2);border-radius:4px;color:#9ec;font-style:italic;line-height:1.4;">${obj.poeticDescription}</div>` : ""}
        
        <div style="margin-top: 8px; padding: 8px; background: rgba(0,40,80,0.3); border-radius: 4px; border-left: 3px solid #4080ff;">
            <b>📍 GPS dla gry:</b><br>
            <div style="margin-top: 6px;">
                <button id="copy-object-gps" style="
                    background: #101f13; color: #93ffd2; border: 1px solid #13fd87; 
                    border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8em;
                ">📋 Kopiuj GPS</button>
                <div style="margin-top: 6px;">
                    <label style="color: #aaf; font-size: 0.8em; cursor: pointer;">
                        <input type="checkbox" id="safety-buffer-checkbox" style="margin-right: 4px;">
                        Bufor bezpieczeństwa +100m od grawitacji
                    </label>
                </div>
            </div>
            <div style="font-size: 0.75em; color: #aaf; margin-top: 4px; font-style: italic;">
                Kliknij aby skopiować GPS do schowka
            </div>
        </div>
    `;
    
    // Dodaj event listener do przycisku GPS
    setTimeout(() => {
        const gpsBtn = document.getElementById('copy-object-gps');
        if (gpsBtn) {
            gpsBtn.addEventListener('click', () => {
                const safetyCheckbox = document.getElementById('safety-buffer-checkbox');
                const useSafetyBuffer = safetyCheckbox && safetyCheckbox.checked;
                copyObjectGPSToClipboard(gpsString, obj.name, obj, useSafetyBuffer);
            });
        }
    }, 100);
}

function addClearButtonToInfoPanel() {
    const infoPanel = document.getElementById('side-info-panel');
    if (!infoPanel || infoPanel.querySelector('#global-clear-btn')) return;
    
    const clearBtn = document.createElement('button');
    clearBtn.id = 'global-clear-btn';
    clearBtn.innerHTML = '✖';
    clearBtn.title = 'Wyczyść wszystkie markery i resetuj pola';
    clearBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: #2f1313;
        color: #ff9393;
        border: 1px solid #fd3636;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 0.9em;
        z-index: 20;
    `;
    
    clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.background = '#ff3333';
        clearBtn.style.color = '#fff';
    });
    
    clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.background = '#2f1313';
        clearBtn.style.color = '#ff9393';
    });
    
    clearBtn.addEventListener('click', () => {
        clearAllMarkersAndFields();
    });
    
    infoPanel.appendChild(clearBtn);
}

function clearAllMarkersAndFields() {
    // Wyczyść wszystkie markery przez MarkerManager
    if (window.markerManager) {
        const clearedCount = window.markerManager.clearAllMarkers();
        console.log(`🧹 Wyczyszczono ${clearedCount} markerów`);
    }
    
    // Wyczyść wszystkie pola input - globalny przycisk X czyści wszystko
    const coordsInput = document.getElementById('coords-input');
    const objectDropdown = document.getElementById('object-dropdown');
    const routeStartInput = document.getElementById('route-start');
    const routeEndInput = document.getElementById('route-end');
    
    if (coordsInput) coordsInput.value = '';
    if (objectDropdown) objectDropdown.selectedIndex = 0;
    if (routeStartInput) routeStartInput.value = '';
    if (routeEndInput) routeEndInput.value = '';
    
    // Wyczyść panel informacyjny
    const infoPanel = document.getElementById('side-info-panel');
    const infoDiv = document.getElementById('object-info');
    
    if (infoPanel) {
        infoPanel.style.display = 'none';
        infoPanel.dataset.showingRoute = 'false';
    }
    if (infoDiv) {
        infoDiv.innerHTML = '';
    }
    
    // Wyczyść starą referencję gotoMarkerMesh
    gotoMarkerMesh = null;
    
    // Wyczyść trasę (linia i markery, ale pola już wyczyszczone powyżej)
    if (typeof window.clearRoute === 'function') {
        // Wywołaj clearRoute ale bez czyszczenia pól (już wyczyszczone)
        if (window.routeLine) {
            scene.remove(window.routeLine);
            window.routeLine = null;
        }
        if (window.routeMarkers) {
            window.routeMarkers.forEach(marker => {
                scene.remove(marker);
            });
            window.routeMarkers = [];
        }
        window.routeStartPoint = null;
        window.routeEndPoint = null;
    }
    
    console.log('🧹 Wyczyszczono wszystkie markery i pola (globalny przycisk X)');
}

function clearObjectInfo() {
    const infoPanel = document.getElementById('side-info-panel');
    const infoDiv = document.getElementById('object-info');
    
    // Don't clear if showing route info (only X button should clear route)
    if (infoPanel.dataset.showingRoute === 'true') {
        return;
    }
    
    // Hide the panel
    infoPanel.style.display = 'none';
    infoDiv.innerHTML = "";
}

// Helper function to format numbers
function formatNumber(num) {
    if (typeof num !== 'number') return num;
    if (window.languageManager) {
        return window.languageManager.formatNumber(num);
    }
    return num.toLocaleString('pl-PL', { maximumFractionDigits: 2 });
}

// Nasłuchuj zmiany języka i odśwież interfejs
window.addEventListener('languageChanged', () => {
    // Odśwież dropdown z obiektami
    fillDropdownWithObjects();
    
    // Odśwież tytuł przycisku clear
    const clearBtn = document.getElementById('global-clear-btn');
    if (clearBtn && window.t) {
        clearBtn.title = window.t('ui.clear.title');
    }
});

// Funkcja do kopiowania GPS obiektu do schowka
function copyObjectGPSToClipboard(gpsString, objectName, objectData = null, useSafetyBuffer = false) {
    let finalGpsString = gpsString;
    
    // Jeśli włączony bufor bezpieczeństwa, oblicz nowe współrzędne
    if (useSafetyBuffer && objectData && typeof objectData.x === 'number' && typeof objectData.y === 'number' && typeof objectData.z === 'number') {
        // Oblicz zasięg grawitacji
        let gravityRange;
        if (objectData.gravityRange && objectData.gravityRange !== '') {
            gravityRange = parseFloat(objectData.gravityRange) * 1000; // konwertuj km na metry
        } else {
            // Wartości domyślne
            if (objectData.objectType === 'planet') {
                gravityRange = 40000; // 40 km
            } else if (objectData.objectType === 'moon') {
                gravityRange = 5000;  // 5 km
            } else {
                gravityRange = 40000; // domyślnie 40 km
            }
        }
        
        // Oblicz promień obiektu
        const objectRadius = objectData.diameter ? (objectData.diameter * 1000) / 2 : 0;
        
        // Całkowity zasięg (promień obiektu + grawitacja + bufor 100m)
        const totalRange = objectRadius + gravityRange + 100;
        
        // Oblicz kierunek od obiektu do kamery (lub użyj domyślnego kierunku w górę)
        let direction = new THREE.Vector3(0, 1, 0); // domyślnie w górę
        if (window.camera) {
            const objectPos = new THREE.Vector3(objectData.x, objectData.y, objectData.z);
            const cameraPos = window.camera.position.clone();
            direction = cameraPos.sub(objectPos).normalize();
        }
        
        // Oblicz nowe współrzędne z buforem bezpieczeństwa
        const safeX = objectData.x + (direction.x * totalRange);
        const safeY = objectData.y + (direction.y * totalRange);
        const safeZ = objectData.z + (direction.z * totalRange);
        
        // Stwórz nowy GPS string z bezpiecznymi współrzędnymi
        finalGpsString = `GPS:${objectData.name} (Bezpieczny):${safeX.toFixed(2)}:${safeY.toFixed(2)}:${safeZ.toFixed(2)}:#FFFF00:`;
        
        console.log(`🛡️ Bufor bezpieczeństwa: ${objectData.name}`);
        console.log(`   Promień obiektu: ${objectRadius}m`);
        console.log(`   Zasięg grawitacji: ${gravityRange}m`);
        console.log(`   Bufor: 100m`);
        console.log(`   Całkowity zasięg: ${totalRange}m`);
        console.log(`   Oryginalne: ${objectData.x}, ${objectData.y}, ${objectData.z}`);
        console.log(`   Bezpieczne: ${safeX.toFixed(2)}, ${safeY.toFixed(2)}, ${safeZ.toFixed(2)}`);
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(finalGpsString).then(() => {
            console.log(`📋 Skopiowano GPS ${objectName}:`, finalGpsString);
            const message = useSafetyBuffer ? 
                `📋 Skopiowano bezpieczny GPS ${objectName} do schowka!` : 
                `📋 Skopiowano GPS ${objectName} do schowka!`;
            showObjectGPSNotification(message);
        }).catch(err => {
            console.error('❌ Błąd kopiowania do schowka:', err);
            fallbackCopyObjectGPSToClipboard(finalGpsString, objectName, useSafetyBuffer);
        });
    } else {
        fallbackCopyObjectGPSToClipboard(finalGpsString, objectName, useSafetyBuffer);
    }
}

// Fallback dla starszych przeglądarek
function fallbackCopyObjectGPSToClipboard(text, objectName, useSafetyBuffer = false) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log(`📋 Skopiowano GPS ${objectName} (fallback):`, text);
        const message = useSafetyBuffer ? 
            `📋 Skopiowano bezpieczny GPS ${objectName} do schowka!` : 
            `📋 Skopiowano GPS ${objectName} do schowka!`;
        showObjectGPSNotification(message);
    } catch (err) {
        console.error('❌ Błąd kopiowania (fallback):', err);
        showObjectGPSNotification(`❌ Błąd kopiowania GPS ${objectName}`);
    }
    
    document.body.removeChild(textArea);
}

// Pokaż powiadomienie o kopiowaniu GPS obiektu
function showObjectGPSNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: rgba(0,255,128,0.9);
        color: #000;
        padding: 8px 16px;
        border-radius: 4px;
        font-family: 'Fira Mono', monospace;
        font-size: 0.9em;
        z-index: 9999;
        animation: fadeInOut 3s ease-in-out;
        box-shadow: 0 4px 12px rgba(0,255,128,0.3);
    `;
    
    // Dodaj animację CSS jeśli nie istnieje
    if (!document.getElementById('object-gps-notification-style')) {
        const style = document.createElement('style');
        style.id = 'object-gps-notification-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(100%); }
                15% { opacity: 1; transform: translateX(0); }
                85% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Usuń po 3 sekundach
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Export functions to global scope
window.fillDropdownWithObjects = fillDropdownWithObjects;
window.wireJumpPanel = wireJumpPanel;
window.animateCameraTo = animateCameraTo;
window.showGotoMarker = showGotoMarker;
window.showObjectInfo = showObjectInfo;
window.clearObjectInfo = clearObjectInfo;
window.formatNumber = formatNumber;
window.copyObjectGPSToClipboard = copyObjectGPSToClipboard;
