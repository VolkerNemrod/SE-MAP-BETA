// navigation2.js - Route planning and visualization

let routeLine = null;
let routeMarkers = [];
let routeStartPoint = null;
let routeEndPoint = null;

// Initialize course planning UI and functionality
function initializeRoutePlanning() {
    createRoutePanel();
    setupAutocomplete();
    setupRouteCalculation();
}

// Create the route planning panel
function createRoutePanel() {
    const topBar = document.getElementById('top-bar');
    
    // Create second row container if it doesn't exist
    let secondRow = topBar.querySelector('.menu-row-2');
    if (!secondRow) {
        secondRow = document.createElement('div');
        secondRow.className = 'menu-row-2';
        topBar.appendChild(secondRow);
    }
    
    // Create route planning section
    const routeSection = document.createElement('div');
    routeSection.id = 'route-section';
    routeSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-right: 20px;
    `;
    
    // Route label
    const routeLabel = document.createElement('span');
    routeLabel.textContent = window.t ? window.t('navigation.courseAnalysis') : 'Wyznacz Kurs:';
    routeLabel.setAttribute('data-i18n', 'navigation.courseAnalysis');
    routeLabel.style.cssText = `
        color: #67fda9;
        font-size: 0.9em;
        margin-right: 5px;
    `;
    
    // Start input
    const startInput = document.createElement('input');
    startInput.id = 'route-start';
    startInput.placeholder = window.t ? window.t('navigation.startPoint') : 'Start (GPS lub nazwa)';
    startInput.setAttribute('data-i18n', 'navigation.startPoint');
    startInput.type = 'text';
    startInput.style.cssText = `
        font-size: 0.9em;
        width: 140px;
        background: #13281b;
        color: #aaffaa;
        border: 1.6px solid #13fd87;
        border-radius: 6px;
        padding: 3px 7px;
        box-shadow: 0 0 8px #00f47c33 inset;
        outline: none;
    `;
    
    // End input
    const endInput = document.createElement('input');
    endInput.id = 'route-end';
    endInput.placeholder = window.t ? window.t('navigation.endPoint') : 'Koniec (GPS lub nazwa)';
    endInput.setAttribute('data-i18n', 'navigation.endPoint');
    endInput.type = 'text';
    endInput.style.cssText = `
        font-size: 0.9em;
        width: 140px;
        background: #13281b;
        color: #aaffaa;
        border: 1.6px solid #13fd87;
        border-radius: 6px;
        padding: 3px 7px;
        box-shadow: 0 0 8px #00f47c33 inset;
        outline: none;
    `;
    
    // Calculate button
    const calculateBtn = document.createElement('button');
    calculateBtn.id = 'calculate-route-btn';
    calculateBtn.textContent = window.t ? window.t('navigation.calculateRoute') : '🧭 Oblicz kurs';
    calculateBtn.setAttribute('data-i18n', 'navigation.calculateRoute');
    calculateBtn.style.cssText = `
        background: #101f13;
        color: #93ffd2;
        font-weight: 700;
        border: 1.6px solid #36fdc3;
        border-radius: 7px;
        padding: 3px 12px;
        text-shadow: 0 0 6px #19ff97;
        cursor: pointer;
        transition: background 0.14s, color 0.12s;
        font-size: 0.9em;
    `;
    
    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-route-btn';
    clearBtn.textContent = '✖';
    clearBtn.style.cssText = `
        background: #2f1313;
        color: #ff9393;
        font-weight: 700;
        border: 1.6px solid #fd3636;
        border-radius: 7px;
        padding: 3px 8px;
        cursor: pointer;
        transition: background 0.14s, color 0.12s;
        font-size: 0.9em;
    `;
    
    // Add hover effects
    calculateBtn.addEventListener('mouseenter', () => {
        calculateBtn.style.background = '#18ffcc22';
        calculateBtn.style.color = '#fff';
    });
    calculateBtn.addEventListener('mouseleave', () => {
        calculateBtn.style.background = '#101f13';
        calculateBtn.style.color = '#93ffd2';
    });
    
    clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.background = '#ff3333';
        clearBtn.style.color = '#fff';
    });
    clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.background = '#2f1313';
        clearBtn.style.color = '#ff9393';
    });
    
    // Assemble the route section
    routeSection.appendChild(routeLabel);
    routeSection.appendChild(startInput);
    routeSection.appendChild(endInput);
    routeSection.appendChild(calculateBtn);
    routeSection.appendChild(clearBtn);
    
    // Add to second row
    secondRow.appendChild(routeSection);
}

// Setup autocomplete for object names
function setupAutocomplete() {
    const startInput = document.getElementById('route-start');
    const endInput = document.getElementById('route-end');
    
    [startInput, endInput].forEach(input => {
        const suggestionBox = createSuggestionBox(input);
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length < 2 || value.startsWith('gps:')) {
                suggestionBox.style.display = 'none';
                return;
            }
            
            const matches = spaceEngineersData.filter(obj => 
                obj.name.toLowerCase().includes(value)
            ).slice(0, 5);
            
            if (matches.length > 0) {
                showSuggestions(suggestionBox, matches, input);
            } else {
                suggestionBox.style.display = 'none';
            }
        });
        
        input.addEventListener('blur', () => {
            setTimeout(() => suggestionBox.style.display = 'none', 200);
        });
    });
}

// Create suggestion box for autocomplete
function createSuggestionBox(input) {
    const box = document.createElement('div');
    box.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #13281b;
        border: 1px solid #13fd87;
        border-top: none;
        border-radius: 0 0 6px 6px;
        max-height: 150px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.appendChild(input.cloneNode(true));
    wrapper.appendChild(box);
    
    input.parentNode.replaceChild(wrapper, input);
    wrapper.replaceChild(input, wrapper.firstChild);
    
    return box;
}

// Show autocomplete suggestions
function showSuggestions(box, matches, input) {
    box.innerHTML = '';
    matches.forEach(obj => {
        const item = document.createElement('div');
        item.textContent = `${obj.name} (${obj.type})`;
        item.style.cssText = `
            padding: 6px 8px;
            cursor: pointer;
            color: #aaffaa;
            font-size: 0.85em;
            border-bottom: 1px solid #0a4a2a;
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = '#18ff8822';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
        });
        item.addEventListener('click', () => {
            input.value = obj.name;
            box.style.display = 'none';
        });
        
        box.appendChild(item);
    });
    box.style.display = 'block';
}

// Setup route calculation functionality
function setupRouteCalculation() {
    const calculateBtn = document.getElementById('calculate-route-btn');
    const clearBtn = document.getElementById('clear-route-btn');
    
    calculateBtn.addEventListener('click', calculateRoute);
    clearBtn.addEventListener('click', clearRoute);
}

// Parse input to get coordinates
function parseRouteInput(input) {
    const value = input.trim();
    
    // Try GPS format first
    if (value.startsWith('GPS:')) {
        const parts = value.split(':');
        if (parts.length >= 5) {
            const x = parseFloat(parts[2].replace(',', '.'));
            const y = parseFloat(parts[3].replace(',', '.'));
            const z = parseFloat(parts[4].replace(',', '.'));
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                return { x, y, z, name: parts[1] || 'GPS Point' };
            }
        }
    }
    
    // Try coordinate format
    const coords = value.split(',').map(v => parseFloat(v.trim().replace(',', '.')));
    if (coords.length === 3 && coords.every(v => !isNaN(v))) {
        return { x: coords[0], y: coords[1], z: coords[2], name: 'Coordinates' };
    }
    
    // Try object name
    const obj = spaceEngineersData.find(o => 
        o.name.toLowerCase().includes(value.toLowerCase())
    );
    if (obj) {
        // Get safe distance from gravity range
        const gravityRadius = getGravityRange(obj);
        const objectRadius = (obj.diameter * 1000) / 2;
        const safeDistance = objectRadius + gravityRadius;
        
        // Position at safe distance
        const dir = new THREE.Vector3(obj.x, obj.y, obj.z).normalize();
        return {
            x: obj.x + dir.x * safeDistance,
            y: obj.y + dir.y * safeDistance,
            z: obj.z + dir.z * safeDistance,
            name: obj.name + ' (safe distance)',
            originalObject: obj
        };
    }
    
    return null;
}

// Calculate and display route
function calculateRoute() {
    const startInput = document.getElementById('route-start').value;
    const endInput = document.getElementById('route-end').value;
    
    if (!startInput || !endInput) {
        alert('Podaj punkt startu i końca trasy.');
        return;
    }
    
    const startPoint = parseRouteInput(startInput);
    const endPoint = parseRouteInput(endInput);
    
    if (!startPoint || !endPoint) {
        alert('Nieprawidłowy format współrzędnych. Użyj GPS:Nazwa:X:Y:Z, X,Y,Z lub nazwy obiektu.');
        return;
    }
    
    // Check for obstacles
    const obstacles = checkRouteObstacles(startPoint, endPoint);
    
    // Calculate distance and travel time
    const distance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2) +
        Math.pow(endPoint.z - startPoint.z, 2)
    );
    
    const travelTime = distance / 100; // 100 m/s max speed
    
    // Display route - NIE czyść pól input, pozostaw je wypełnione
    drawRoute(startPoint, endPoint);
    displayRouteInfo(startPoint, endPoint, distance, travelTime, obstacles);
    
    // Frame the entire route in camera view
    frameRoute(startPoint, endPoint);
    
    routeStartPoint = startPoint;
    routeEndPoint = endPoint;
}

// Check for obstacles along the route
function checkRouteObstacles(start, end) {
    const obstacles = [];
    const startVec = new THREE.Vector3(start.x, start.y, start.z);
    const endVec = new THREE.Vector3(end.x, end.y, end.z);
    const direction = endVec.clone().sub(startVec).normalize();
    const distance = startVec.distanceTo(endVec);
    
    // Margines bezpieczeństwa dla statku (100m radius)
    const shipSafetyMargin = 100;
    
    spaceEngineersData.forEach(obj => {
        const objPos = new THREE.Vector3(obj.x, obj.y, obj.z);
        const objRadius = (obj.diameter * 1000) / 2; // Radius powierzchni obiektu
        const gravityRadius = getGravityRange(obj); // Zasięg grawitacji
        
        // Sprawdź kolizję tylko z powierzchnią obiektu + margines bezpieczeństwa
        // (nie z całym polem grawitacyjnym, bo to nie jest kolizja)
        const collisionRadius = objRadius + shipSafetyMargin;
        
        // Calculate closest point on line to object center
        const toObj = objPos.clone().sub(startVec);
        const projLength = toObj.dot(direction);
        
        // Sprawdź czy obiekt jest w zasięgu trasy (nie za punktami start/end)
        if (projLength >= 0 && projLength <= distance) {
            const closestPoint = startVec.clone().add(direction.clone().multiplyScalar(projLength));
            const distanceToObjCenter = closestPoint.distanceTo(objPos);
            
            // Kolizja tylko jeśli trasa przechodzi przez powierzchnię obiektu + margines
            if (distanceToObjCenter < collisionRadius) {
                // Oblicz rzeczywistą odległość od powierzchni (nie od centrum)
                const distanceFromSurface = Math.max(0, distanceToObjCenter - objRadius);
                
                obstacles.push({
                    object: obj,
                    distance: distanceFromSurface, // Odległość od powierzchni
                    safeDistance: shipSafetyMargin, // Wymagany margines
                    collisionRadius: collisionRadius,
                    gravityRadius: gravityRadius
                });
            }
        }
    });
    
    return obstacles;
}

// Draw route line on the map
function drawRoute(start, end) {
    clearRoute();
    
    // Create route line
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
        start.x, start.y, start.z,
        end.x, end.y, end.z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({ 
        color: 0x00ffff, 
        linewidth: 3,
        transparent: true,
        opacity: 0.8
    });
    
    routeLine = new THREE.Line(geometry, material);
    scene.add(routeLine);
    
    // Create start marker
    const startMarker = createRouteMarker(start, 0x00ff00, 'START');
    if (window.markerManager) {
        window.markerManager.addMarker(startMarker, 'route', `Trasa START: ${start.name}`);
    } else {
        scene.add(startMarker);
    }
    routeMarkers.push(startMarker);
    
    // Create end marker
    const endMarker = createRouteMarker(end, 0xff0000, 'END');
    if (window.markerManager) {
        window.markerManager.addMarker(endMarker, 'route', `Trasa END: ${end.name}`);
    } else {
        scene.add(endMarker);
    }
    routeMarkers.push(endMarker);
}

// Create route marker
function createRouteMarker(point, color, label) {
    // Złote markery trasy (1km radius) - dużo mniejsze, widoczne ale nie olbrzymie
    const geometry = new THREE.SphereGeometry(1000, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700, // Złoty kolor dla wszystkich markerów trasy
        transparent: true, 
        opacity: 0.7 
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.set(point.x, point.y, point.z);
    marker.userData = { label: label };
    return marker;
}

// Display route information
function displayRouteInfo(start, end, distance, travelTime, obstacles) {
    const distanceKm = (distance / 1000).toFixed(1);
    const timeMinutes = (travelTime / 60).toFixed(1);
    
    // Generuj GPS koordynaty w formacie Space Engineers
    const startGPS = `GPS:START ${start.name}:${start.x.toFixed(2)}:${start.y.toFixed(2)}:${start.z.toFixed(2)}:#FF75C9F1:`;
    const endGPS = `GPS:END ${end.name}:${end.x.toFixed(2)}:${end.y.toFixed(2)}:${end.z.toFixed(2)}:#FF75C9F1:`;
    
    let info = `
        <div style="margin-top: 12px; padding: 10px; background: rgba(0,80,40,0.3); border-radius: 6px; border-left: 3px solid #00ff80;">
            <b>Trasa wyznaczona</b><br>
            <span style="color:#9fa">Start:</span> ${start.name}<br>
            <span style="color:#9fa">Koniec:</span> ${end.name}<br>
            <span style="color:#9af">Dystans:</span> ${distanceKm} km<br>
            <span style="color:#fa9">Czas lotu:</span> ~${timeMinutes} min
        </div>
        
        <div style="margin-top: 8px; padding: 8px; background: rgba(0,40,80,0.3); border-radius: 4px; border-left: 3px solid #4080ff;">
            <b>📍 Punkty GPS dla gry:</b><br>
            <div style="margin-top: 6px;">
                <button id="copy-start-gps" style="
                    background: #101f13; color: #93ffd2; border: 1px solid #13fd87; 
                    border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8em; margin-right: 4px;
                ">📋 START</button>
                <button id="copy-end-gps" style="
                    background: #101f13; color: #93ffd2; border: 1px solid #13fd87; 
                    border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8em;
                ">📋 END</button>
            </div>
            <div style="font-size: 0.75em; color: #aaf; margin-top: 4px; font-style: italic;">
                Kliknij przycisk aby skopiować GPS do schowka
            </div>
        </div>
    `;
    
    if (obstacles.length > 0) {
        info += `
            <div style="margin-top: 8px; padding: 8px; background: rgba(80,20,0,0.3); border-radius: 4px; border-left: 3px solid #ff4000;">
                <b>⚠️ Przeszkody na trasie:</b><br>
        `;
        obstacles.forEach(obs => {
            const distanceKm = (obs.distance / 1000).toFixed(1);
            info += `<span style="color:#ff9">• ${obs.object.name} (${distanceKm} km)</span><br>`;
        });
        info += '</div>';
    }
    
    const infoPanel = document.getElementById('side-info-panel');
    const infoDiv = document.getElementById('object-info');
    
    // Mark panel as showing route info (don't auto-hide)
    infoPanel.dataset.showingRoute = 'true';
    infoPanel.style.display = 'block';
    infoDiv.innerHTML = info;
    
    // Dodaj event listenery do przycisków GPS
    setTimeout(() => {
        const startBtn = document.getElementById('copy-start-gps');
        const endBtn = document.getElementById('copy-end-gps');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => copyGPSToClipboard(startGPS, 'START'));
        }
        if (endBtn) {
            endBtn.addEventListener('click', () => copyGPSToClipboard(endGPS, 'END'));
        }
    }, 100);
}

// Funkcja do kopiowania GPS do schowka
function copyGPSToClipboard(gpsString, pointName) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(gpsString).then(() => {
            console.log(`📋 Skopiowano GPS ${pointName}:`, gpsString);
            showGPSNotification(`📋 Skopiowano GPS ${pointName} do schowka!`);
        }).catch(err => {
            console.error('❌ Błąd kopiowania do schowka:', err);
            fallbackCopyToClipboard(gpsString, pointName);
        });
    } else {
        fallbackCopyToClipboard(gpsString, pointName);
    }
}

// Fallback dla starszych przeglądarek
function fallbackCopyToClipboard(text, pointName) {
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
        console.log(`📋 Skopiowano GPS ${pointName} (fallback):`, text);
        showGPSNotification(`📋 Skopiowano GPS ${pointName} do schowka!`);
    } catch (err) {
        console.error('❌ Błąd kopiowania (fallback):', err);
        showGPSNotification(`❌ Błąd kopiowania GPS ${pointName}`);
    }
    
    document.body.removeChild(textArea);
}

// Pokaż powiadomienie o kopiowaniu GPS
function showGPSNotification(message) {
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
    if (!document.getElementById('gps-notification-style')) {
        const style = document.createElement('style');
        style.id = 'gps-notification-style';
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

// Frame the route in camera view
function frameRoute(startPoint, endPoint) {
    // Calculate center point between start and end
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerY = (startPoint.y + endPoint.y) / 2;
    const centerZ = (startPoint.z + endPoint.z) / 2;
    
    // Calculate distance between points for optimal camera distance
    const distance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2) +
        Math.pow(endPoint.z - startPoint.z, 2)
    );
    
    // Set camera distance to show entire route (with padding)
    const cameraDistance = Math.max(distance * 2, 800000); // At least 800km away
    const maxDistance = 80000000; // Maximum camera distance
    const finalDistance = Math.min(cameraDistance, maxDistance);
    
    // Update global target
    window.target.set(centerX, centerY, centerZ);
    
    // Update spherical coordinates for new distance
    if (window.spherical) {
        window.spherical.radius = finalDistance;
        window.offset.setFromSpherical(window.spherical);
        camera.position.copy(window.target).add(window.offset);
        camera.lookAt(window.target);
    }
    
    // Animate camera to center of route with custom duration for longer routes
    const animationDuration = Math.min(3.0, Math.max(1.5, distance / 50000000)); // Scale duration with distance
    animateCameraTo({ x: centerX, y: centerY, z: centerZ }, animationDuration);
}

// Clear route from the map
function clearRoute() {
    // Clear route visualization
    if (routeLine) {
        scene.remove(routeLine);
        routeLine = null;
    }
    
    routeMarkers.forEach(marker => {
        scene.remove(marker);
    });
    routeMarkers = [];
    
    routeStartPoint = null;
    routeEndPoint = null;
    
    // Clear route input fields when X button is pressed
    const routeStartInput = document.getElementById('route-start');
    const routeEndInput = document.getElementById('route-end');
    
    if (routeStartInput) routeStartInput.value = '';
    if (routeEndInput) routeEndInput.value = '';
    
    // Clear info panel only if it's showing route info
    const infoPanel = document.getElementById('side-info-panel');
    if (infoPanel && infoPanel.dataset.showingRoute === 'true') {
        infoPanel.dataset.showingRoute = 'false';
        if (typeof clearObjectInfo === 'function') {
            clearObjectInfo();
        }
    }
    
    // Hide mobile panel if present
    if (typeof hideMobilePanel === 'function') {
        hideMobilePanel();
    }
}

// Helper function to calculate gravity range for objects
function getGravityRange(obj) {
    // Estimate gravity range based on object type and size
    const objectRadius = (obj.diameter * 1000) / 2;
    
    switch (obj.type?.toLowerCase()) {
        case 'planeta':
            return objectRadius * 2.5; // Planets have strong gravity
        case 'księżyc':
            return objectRadius * 1.5; // Moons have moderate gravity
        case 'asteroida':
            return objectRadius * 0.5; // Asteroids have weak gravity
        default:
            return objectRadius * 0.8; // Default gravity range
    }
}

// Update language for navigation elements
function updateNavigationLanguage() {
    if (!window.t) return;
    
    // Update route label
    const routeLabel = document.querySelector('[data-i18n="navigation.courseAnalysis"]');
    if (routeLabel) {
        routeLabel.textContent = window.t('navigation.courseAnalysis');
    }
    
    // Update input placeholders
    const startInput = document.querySelector('[data-i18n="navigation.startPoint"]');
    if (startInput) {
        startInput.placeholder = window.t('navigation.startPoint');
    }
    
    const endInput = document.querySelector('[data-i18n="navigation.endPoint"]');
    if (endInput) {
        endInput.placeholder = window.t('navigation.endPoint');
    }
    
    // Update calculate button
    const calculateBtn = document.querySelector('[data-i18n="navigation.calculateRoute"]');
    if (calculateBtn) {
        calculateBtn.textContent = window.t('navigation.calculateRoute');
    }
}

// Listen for language changes
window.addEventListener('languageChanged', () => {
    updateNavigationLanguage();
});

// Export functions to global scope
window.initializeRoutePlanning = initializeRoutePlanning;
window.calculateRoute = calculateRoute;
window.clearRoute = clearRoute;
window.getGravityRange = getGravityRange;
window.updateNavigationLanguage = updateNavigationLanguage;
