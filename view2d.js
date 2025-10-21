// view2d.js - 2D System Map View with Graphics

class View2D {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.objects = [];
        
        // Pan & Zoom state
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        this.init();
    }
    
    init() {
        this.container = document.getElementById('view2d-container');
        
        // Setup background - sprawdź czy istnieje background.png
        this.setupBackground();
        
        // Initially hidden
        this.hide();
    }
    
    setupBackground() {
        // Spróbuj załadować background.png, jeśli nie istnieje - czarne tło
        const bg = new Image();
        bg.onload = () => {
            this.container.style.backgroundImage = `url(/graf/background.png)`;
            this.container.style.backgroundSize = 'cover';
            this.container.style.backgroundPosition = 'center';
        };
        bg.onerror = () => {
            this.container.style.backgroundColor = '#000000';
        };
        bg.src = '/graf/background.png';
    }
    
    show() {
        this.isActive = true;
        this.container.style.display = 'block';
        document.getElementById('container').style.display = 'none';
        
        // Ukryj elementy interfejsu
        const topBar = document.getElementById('top-bar');
        const sidePanel = document.getElementById('side-info-panel');
        const authorInfo = document.getElementById('author-info');
        
        if (topBar) topBar.style.display = 'none';
        if (sidePanel) sidePanel.style.display = 'none';
        if (authorInfo) authorInfo.style.display = 'none';
        
        // Prepare and render objects
        this.prepareObjects();
        this.render();
    }
    
    hide() {
        this.isActive = false;
        this.container.style.display = 'none';
        document.getElementById('container').style.display = 'block';
        
        // Przywróć elementy interfejsu
        const topBar = document.getElementById('top-bar');
        const sidePanel = document.getElementById('side-info-panel');
        const authorInfo = document.getElementById('author-info');
        
        if (topBar) topBar.style.display = 'flex';
        // Nie przywracaj sidePanel na 'block' - powinien być ukryty domyślnie
        // Panel będzie pokazany przez showObjectInfo() gdy użytkownik kliknie na obiekt
        if (sidePanel) sidePanel.style.display = 'none';
        if (authorInfo) authorInfo.style.display = 'block';
    }
    
    prepareObjects() {
        console.log('🔍 prepareObjects - sprawdzam dane...');
        console.log('- window.spaceEngineersData:', window.spaceEngineersData);
        console.log('- Długość:', window.spaceEngineersData ? window.spaceEngineersData.length : 'undefined');
        
        if (!window.spaceEngineersData || window.spaceEngineersData.length === 0) {
            console.log('⚠️ Brak danych do wyświetlenia w widoku 2D');
            return;
        }
        
        // Debug - pokaż pierwsze 3 obiekty z danymi
        console.log('🔍 Pierwsze 3 obiekty z danych:');
        window.spaceEngineersData.slice(0, 3).forEach(obj => {
            console.log(`- ${obj.name}: graphicPath="${obj.graphicPath}"`);
        });
        
        // Filtruj tylko obiekty z graphicPath
        this.objects = window.spaceEngineersData.filter(obj => {
            const hasGraphic = obj.graphicPath && obj.graphicPath.trim() !== '';
            if (!hasGraphic) {
                console.log(`❌ ${obj.name} - brak graphicPath`);
            }
            return hasGraphic;
        });
        
        console.log(`📊 Widok 2D: Znaleziono ${this.objects.length} obiektów z grafikami`);
        
        // Oblicz odległości od centrum dla kolejności
        this.objects.forEach(obj => {
            obj.distance = Math.sqrt(obj.x * obj.x + obj.y * obj.y + obj.z * obj.z);
        });
        
        // Posortuj według odległości
        this.objects.sort((a, b) => a.distance - b.distance);
    }
    
    calculateSize(diameter) {
        // Skalowanie rozmiaru na podstawie średnicy
        // Minimalny rozmiar: 30px dla małych obiektów (stacje, wormhole)
        // Maksymalny rozmiar: 180px dla dużych planet
        const minSize = 30;
        const maxSize = 180;
        
        if (diameter <= 0 || !diameter) {
            return minSize;
        }
        
        // Liniowa skala z silnym współczynnikiem dla wyraźnych różnic
        // Księżyce (19km) → ~42px (małe)
        // Małe planety (60km) → ~102px (średnie)
        // Duże planety (120km) → ~162px (duże)
        const linearScale = minSize + (diameter * 1.1);
        return Math.max(minSize, Math.min(maxSize, linearScale));
    }
    
    findParentPlanet(moon) {
        // Znajdź planetę-rodzica dla księżyca
        // Szukaj planety która ma podobną nazwę lub jest najbliższa
        const moonName = moon.name.toLowerCase();
        
        // Sprawdź najpierw czy nazwa księżyca zawiera oznaczenie planety (np. "Kepler-444b-1")
        for (let obj of this.objects) {
            if (obj.objectType === 'planet') {
                const planetCode = obj.name.match(/Kepler-\d+[a-z]/i);
                const moonCode = moon.name.match(/Kepler-\d+[a-z]-\d+/i);
                
                if (planetCode && moonCode && moonCode[0].startsWith(planetCode[0])) {
                    return obj;
                }
            }
        }
        
        // Fallback: znajdź najbliższą planetę
        let closestPlanet = null;
        let minDistance = Infinity;
        
        for (let obj of this.objects) {
            if (obj.objectType === 'planet') {
                const dist = Math.sqrt(
                    Math.pow(moon.x - obj.x, 2) +
                    Math.pow(moon.y - obj.y, 2) +
                    Math.pow(moon.z - obj.z, 2)
                );
                
                if (dist < minDistance) {
                    minDistance = dist;
                    closestPlanet = obj;
                }
            }
        }
        
        return closestPlanet;
    }
    
    render() {
        // Wyczyść poprzednią zawartość
        this.container.innerHTML = '';
        
        if (this.objects.length === 0) {
            this.showNoDataMessage();
            return;
        }
        
        // Dodaj logo ISF w lewym górnym rogu
        this.addLogo();
        
        // Oblicz układ obiektów
        this.calculateLayout();
        
        // Utwórz viewport dla pan/zoom
        this.createViewport();
        
        // Renderuj obiekty
        this.objects.forEach(obj => {
            if (obj.layout2D) {
                this.renderObject(obj);
            }
        });
        
        // Dodaj kontrolki zoom
        this.addZoomControls();
        
        // Setup pan & zoom
        this.setupPanZoom();
    }
    
    addLogo() {
        // Pobierz nazwę układu z ścieżki grafiki pierwszego obiektu
        let systemName = 'Unknown System';
        if (this.objects.length > 0 && this.objects[0].graphicPath) {
            // Ścieżka: graf/Kepler-444/Navia.png → wyciągnij "Kepler-444"
            const pathParts = this.objects[0].graphicPath.split('/');
            if (pathParts.length >= 2) {
                systemName = pathParts[1]; // Drugi element to nazwa katalogu układu
            }
            console.log('🔍 Wykryto nazwę układu:', systemName, 'z ścieżki:', this.objects[0].graphicPath);
        }
        
        const logo = document.createElement('div');
        logo.style.position = 'absolute';
        logo.style.top = '20px';
        logo.style.left = '20px';
        logo.style.color = '#ffffff';
        logo.style.fontFamily = '"Fira Mono", monospace';
        logo.style.fontSize = '24px';
        logo.style.fontWeight = 'bold';
        logo.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
        logo.style.zIndex = '10000';
        logo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 32px;">🌟</span>
                <div>
                    <div>Interstellar Federation</div>
                    <div style="font-size: 18px; opacity: 0.8;">${systemName}</div>
                </div>
            </div>
        `;
        this.container.appendChild(logo);
        
        // Dodaj przycisk powrotu do widoku 3D
        this.addBackButton();
    }
    
    addBackButton() {
        const backBtn = document.createElement('button');
        backBtn.textContent = '🌐 3D';
        backBtn.style.position = 'absolute';
        backBtn.style.top = '20px';
        backBtn.style.right = '20px';
        backBtn.style.background = '#101f13';
        backBtn.style.color = '#93ffd2';
        backBtn.style.fontWeight = '700';
        backBtn.style.border = '1.6px solid #13fd87';
        backBtn.style.borderRadius = '6px';
        backBtn.style.padding = '8px 20px';
        backBtn.style.cursor = 'pointer';
        backBtn.style.fontSize = '16px';
        backBtn.style.fontFamily = '"Fira Mono", monospace';
        backBtn.style.textShadow = '0 0 6px #19ff97';
        backBtn.style.zIndex = '10000';
        backBtn.style.transition = 'background 0.14s, color 0.12s';
        
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.background = '#18ffcc22';
            backBtn.style.color = '#fff';
        });
        
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.background = '#101f13';
            backBtn.style.color = '#93ffd2';
        });
        
        backBtn.addEventListener('click', () => {
            toggleView();
        });
        
        this.container.appendChild(backBtn);
    }
    
    calculateLayout() {
        const planets = this.objects.filter(obj => obj.objectType === 'planet');
        const moons = this.objects.filter(obj => obj.objectType === 'moon');
        const others = this.objects.filter(obj => 
            obj.objectType !== 'planet' && obj.objectType !== 'moon'
        );
        
        const startX = 200;
        const startY = 250;
        const planetSpacing = 280; // Zmniejszony odstęp (z 350)
        const moonOffsetY = 150; // Zmniejszone przesunięcie (z 180)
        const moonSpacing = 100; // Zmniejszony odstęp (z 120)
        const otherOffsetY = 200; // Zmniejszone przesunięcie (z 250)
        const labelHeight = 40; // Margines na etykietę
        
        // Rozmieść planety w linii poziomej
        planets.forEach((planet, index) => {
            const size = this.calculateSize(planet.diameter);
            planet.layout2D = {
                x: startX + (index * planetSpacing),
                y: startY,
                size: size
            };
        });
        
        // Rozmieść księżyce pod swoimi planetami
        moons.forEach((moon) => {
            const parent = this.findParentPlanet(moon);
            const size = this.calculateSize(moon.diameter);
            
            if (parent && parent.layout2D) {
                // Policz ile księżyców ma ta planeta
                const siblings = moons.filter(m => {
                    const p = this.findParentPlanet(m);
                    return p === parent;
                });
                const moonIndex = siblings.indexOf(moon);
                
                // Rozmieść księżyce w pionie pod planetą z większym odstępem
                moon.layout2D = {
                    x: parent.layout2D.x,
                    y: parent.layout2D.y + parent.layout2D.size/2 + moonOffsetY + (moonIndex * (moonSpacing + labelHeight)),
                    size: size,
                    parent: parent
                };
            } else {
                // Fallback - umieść na końcu
                moon.layout2D = {
                    x: startX + (planets.length * planetSpacing),
                    y: startY + moonOffsetY,
                    size: size
                };
            }
        });
        
        // Rozmieść pozostałe obiekty (wormhole, stacje) na końcu
        others.forEach((obj, index) => {
            const size = this.calculateSize(obj.diameter);
            
            // Znajdź ostatnią planetę z księżycami
            let maxX = startX;
            planets.forEach((planet, i) => {
                const planetX = startX + (i * planetSpacing);
                if (planetX > maxX) {
                    maxX = planetX;
                }
            });
            
            obj.layout2D = {
                x: maxX + planetSpacing + (index * 200), // Zwiększony odstęp (z 150 na 200)
                y: startY + otherOffsetY,
                size: size
            };
        });
        
        // Oblicz wymiary całego układu
        this.calculateBounds();
    }
    
    calculateBounds() {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        this.objects.forEach(obj => {
            if (obj.layout2D) {
                const halfSize = obj.layout2D.size / 2;
                const labelHeight = 50; // Margines na etykietę
                
                minX = Math.min(minX, obj.layout2D.x - halfSize);
                maxX = Math.max(maxX, obj.layout2D.x + halfSize);
                minY = Math.min(minY, obj.layout2D.y - halfSize);
                maxY = Math.max(maxY, obj.layout2D.y + halfSize + labelHeight);
            }
        });
        
        this.bounds = {
            minX, maxX, minY, maxY,
            width: maxX - minX,
            height: maxY - minY
        };
        
        console.log('📐 Wymiary układu:', this.bounds);
    }
    
    createViewport() {
        // Stwórz viewport dla pan/zoom
        this.viewport = document.createElement('div');
        this.viewport.id = 'view2d-viewport';
        this.viewport.style.position = 'absolute';
        this.viewport.style.width = '100%';
        this.viewport.style.height = '100%';
        this.viewport.style.transformOrigin = 'center center';
        this.viewport.style.transition = 'none';
        this.container.appendChild(this.viewport);
        
        console.log('✅ Viewport utworzony');
    }
    
    setupPanZoom() {
        // Mousewheel zoom
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(0.1, Math.min(5, this.scale * delta));
            
            this.scale = newScale;
            this.updateViewportTransform();
            
            console.log(`🔍 Zoom: ${(this.scale * 100).toFixed(0)}%`);
        });
        
        // Mouse drag to pan
        this.viewport.addEventListener('mousedown', (e) => {
            // Nie przeciągaj jeśli kliknięto na obiekt
            if (e.target.closest('[style*="cursor: pointer"]')) {
                return;
            }
            
            this.isDragging = true;
            this.dragStartX = e.clientX - this.panX;
            this.dragStartY = e.clientY - this.panY;
            this.viewport.style.cursor = 'grabbing';
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            this.panX = e.clientX - this.dragStartX;
            this.panY = e.clientY - this.dragStartY;
            this.updateViewportTransform();
        });
        
        this.container.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.viewport.style.cursor = 'default';
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.viewport.style.cursor = 'default';
        });
        
        console.log('✅ Pan & Zoom włączone');
    }
    
    updateViewportTransform() {
        if (this.viewport) {
            this.viewport.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        }
    }
    
    addZoomControls() {
        // Kontener dla kontrolek zoom
        const controls = document.createElement('div');
        controls.style.position = 'absolute';
        controls.style.bottom = '20px';
        controls.style.right = '20px';
        controls.style.display = 'flex';
        controls.style.flexDirection = 'column';
        controls.style.gap = '10px';
        controls.style.zIndex = '10000';
        
        // Styl przycisków
        const buttonStyle = {
            background: '#101f13',
            color: '#93ffd2',
            border: '1.6px solid #13fd87',
            borderRadius: '6px',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.14s, color 0.12s',
            fontFamily: '"Fira Mono", monospace'
        };
        
        // Przycisk Zoom In (+)
        const zoomIn = document.createElement('button');
        zoomIn.textContent = '+';
        Object.assign(zoomIn.style, buttonStyle);
        zoomIn.addEventListener('click', () => {
            this.scale = Math.min(5, this.scale * 1.2);
            this.updateViewportTransform();
            console.log(`🔍 Zoom In: ${(this.scale * 100).toFixed(0)}%`);
        });
        zoomIn.addEventListener('mouseenter', () => {
            zoomIn.style.background = '#18ffcc22';
            zoomIn.style.color = '#fff';
        });
        zoomIn.addEventListener('mouseleave', () => {
            zoomIn.style.background = '#101f13';
            zoomIn.style.color = '#93ffd2';
        });
        
        // Przycisk Zoom Out (-)
        const zoomOut = document.createElement('button');
        zoomOut.textContent = '-';
        Object.assign(zoomOut.style, buttonStyle);
        zoomOut.addEventListener('click', () => {
            this.scale = Math.max(0.1, this.scale * 0.8);
            this.updateViewportTransform();
            console.log(`🔍 Zoom Out: ${(this.scale * 100).toFixed(0)}%`);
        });
        zoomOut.addEventListener('mouseenter', () => {
            zoomOut.style.background = '#18ffcc22';
            zoomOut.style.color = '#fff';
        });
        zoomOut.addEventListener('mouseleave', () => {
            zoomOut.style.background = '#101f13';
            zoomOut.style.color = '#93ffd2';
        });
        
        // Przycisk Reset (⟲)
        const reset = document.createElement('button');
        reset.textContent = '⟲';
        Object.assign(reset.style, buttonStyle);
        reset.addEventListener('click', () => {
            this.scale = 1;
            this.panX = 0;
            this.panY = 0;
            this.updateViewportTransform();
            console.log('🔄 Reset widoku');
        });
        reset.addEventListener('mouseenter', () => {
            reset.style.background = '#18ffcc22';
            reset.style.color = '#fff';
        });
        reset.addEventListener('mouseleave', () => {
            reset.style.background = '#101f13';
            reset.style.color = '#93ffd2';
        });
        
        controls.appendChild(zoomIn);
        controls.appendChild(zoomOut);
        controls.appendChild(reset);
        
        this.container.appendChild(controls);
        console.log('✅ Kontrolki zoom dodane');
    }
    
    renderObject(obj) {
        // Kontener dla obiektu (grafika + etykieta)
        const objectDiv = document.createElement('div');
        objectDiv.style.position = 'absolute';
        objectDiv.style.left = (obj.layout2D.x - obj.layout2D.size / 2) + 'px';
        objectDiv.style.top = (obj.layout2D.y - obj.layout2D.size / 2) + 'px';
        objectDiv.style.width = obj.layout2D.size + 'px';
        objectDiv.style.height = obj.layout2D.size + 'px';
        objectDiv.style.cursor = 'pointer';
        objectDiv.style.transition = 'transform 0.2s';
        objectDiv.style.zIndex = '5000';
        
        // Hover effect
        objectDiv.addEventListener('mouseenter', () => {
            objectDiv.style.transform = 'scale(1.1)';
        });
        objectDiv.addEventListener('mouseleave', () => {
            objectDiv.style.transform = 'scale(1)';
        });
        
        // Click handler
        objectDiv.addEventListener('click', () => {
            this.showInfo(obj);
        });
        
        // Grafika
        const img = document.createElement('img');
        img.src = obj.graphicPath;
        img.alt = obj.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.3))';
        
        img.onerror = () => {
            console.warn(`⚠️ Nie można załadować grafiki: ${obj.graphicPath}`);
            // Zastąp brakującą grafikę placeholder
            img.src = 'data:image/svg+xml,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                    <circle cx="50" cy="50" r="40" fill="#666" stroke="#fff" stroke-width="2"/>
                    <text x="50" y="55" text-anchor="middle" fill="#fff" font-size="12">?</text>
                </svg>`
            );
        };
        
        objectDiv.appendChild(img);
        
        // Etykieta (minimalistyczna - tylko nazwa)
        const label = document.createElement('div');
        label.textContent = obj.name;
        label.style.position = 'absolute';
        label.style.top = '100%';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.marginTop = '8px';
        label.style.color = '#ffffff';
        label.style.fontFamily = '"Fira Mono", monospace';
        label.style.fontSize = '12px';
        label.style.textAlign = 'center';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        label.style.padding = '4px 8px';
        label.style.borderRadius = '4px';
        label.style.whiteSpace = 'nowrap';
        label.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        label.style.pointerEvents = 'none';
        label.style.zIndex = '5001';
        
        objectDiv.appendChild(label);
        
        // Dodaj do viewport zamiast bezpośrednio do kontenera
        this.viewport.appendChild(objectDiv);
    }
    
    showNoDataMessage() {
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = '#ffffff';
        message.style.fontFamily = '"Fira Mono", monospace';
        message.style.fontSize = '18px';
        message.style.textAlign = 'center';
        message.style.textShadow = '0 0 10px rgba(0,0,0,0.8)';
        
        message.innerHTML = `
            <div style="margin-bottom: 20px;">⚠️</div>
            <div>BRAK DANYCH DO WYŚWIETLENIA</div>
            <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">
                Upewnij się, że dane z CSV zostały załadowane
            </div>
        `;
        
        this.container.appendChild(message);
    }
    
    showInfo(obj) {
        // Usuń poprzedni panel jeśli istnieje
        const existingPanel = document.getElementById('view2d-info-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Stwórz nowy panel info
        const panel = document.createElement('div');
        panel.id = 'view2d-info-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '20px';
        panel.style.left = '50%';
        panel.style.transform = 'translateX(-50%)';
        panel.style.background = 'rgba(18, 44, 32, 0.95)';
        panel.style.border = '2px solid #17ffb2';
        panel.style.borderRadius = '10px';
        panel.style.padding = '15px 25px';
        panel.style.color = '#b2ffd6';
        panel.style.fontFamily = '"Fira Mono", monospace';
        panel.style.fontSize = '14px';
        panel.style.zIndex = '10001';
        panel.style.maxWidth = '600px';
        panel.style.boxShadow = '0 4px 20px rgba(0, 44, 19, 0.7)';
        
        // Formatuj informacje
        const info = [];
        info.push(`<b style="color: #fffacd; font-size: 16px;">${obj.name}</b>`);
        info.push(`<div style="margin-top: 8px;">`);
        info.push(`<span style="color: #93ffd2;">Typ:</span> ${obj.objectType || 'N/A'}`);
        info.push(`<span style="margin-left: 20px; color: #93ffd2;">Średnica:</span> ${obj.diameter || 'N/A'} km`);
        info.push(`</div>`);
        
        if (obj.x !== undefined) {
            info.push(`<div style="margin-top: 5px; font-size: 12px; opacity: 0.8;">`);
            info.push(`GPS: X:${obj.x.toFixed(0)} Y:${obj.y.toFixed(0)} Z:${obj.z.toFixed(0)}`);
            info.push(`</div>`);
        }
        
        panel.innerHTML = info.join(' ');
        
        // Dodaj przycisk zamknięcia
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '5px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#17ffb2';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.padding = '5px 10px';
        closeBtn.addEventListener('click', () => panel.remove());
        
        panel.appendChild(closeBtn);
        
        // Dodaj do kontenera
        this.container.appendChild(panel);
        
        // Auto-zamknij po 5 sekundach
        setTimeout(() => {
            if (panel.parentNode) {
                panel.remove();
            }
        }, 5000);
    }
}

// Initialize 2D view
let view2D = null;

function initView2D() {
    console.log('🚀 Inicjalizacja widoku 2D (nowa wersja z grafikami)...');
    view2D = new View2D();
    
    // Setup toggle button
    const toggleBtn = document.getElementById('view-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleView);
        console.log('✅ Przycisk 2D/3D podłączony');
    } else {
        console.error('❌ Nie znaleziono przycisku view-toggle-btn');
    }
}

function toggleView() {
    const toggleBtn = document.getElementById('view-toggle-btn');
    
    if (view2D.isActive) {
        // Switch to 3D
        view2D.hide();
        toggleBtn.textContent = '🗺️ 2D';
        toggleBtn.title = 'Przełącz na widok 2D';
    } else {
        // Switch to 2D
        view2D.show();
        toggleBtn.textContent = '🌐 3D';
        toggleBtn.title = 'Przełącz na widok 3D';
    }
}

// Export to global scope
window.initView2D = initView2D;
window.toggleView = toggleView;
window.view2D = view2D;
