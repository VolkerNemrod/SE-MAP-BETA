// view2d.js - 2D System Map View (Elite Dangerous style)

class View2D {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.objects = [];
        this.hoveredObject = null;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        // Panning variables
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Visual settings
        this.colors = {
            background: '#000011',
            grid: '#112233',
            planet: '#4488ff',
            moon: '#88ccff',
            wormhole: '#ffff66',
            dangerZone: '#ff6666',
            userObject: '#ff9966',
            text: '#ffffff',
            connection: '#666666'
        };
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('view2d-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Add event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Initially hidden
        this.hide();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        if (this.isActive) {
            this.render();
        }
    }
    
    show() {
        this.isActive = true;
        document.getElementById('view2d-container').style.display = 'block';
        document.getElementById('container').style.display = 'none';
        
        // Debug - sprawdź dane ponownie przy pokazywaniu widoku 2D
        console.log('🔍 Sprawdzanie danych przy przełączaniu na widok 2D:');
        console.log('- window.spaceEngineersData:', window.spaceEngineersData);
        console.log('- Długość:', window.spaceEngineersData ? window.spaceEngineersData.length : 'undefined');
        
        // Sprawdź dropdown ponownie
        const dropdown = document.getElementById('object-dropdown');
        if (dropdown) {
            console.log('- Dropdown opcje przy przełączaniu:', dropdown.options.length);
            if (dropdown.options.length > 1) {
                console.log('✅ Dropdown ma opcje - próbuję pobrać dane z dropdown');
                this.extractDataFromDropdown();
            }
        }
        
        // Prepare objects for 2D rendering
        this.prepareObjects();
        this.render();
    }
    
    hide() {
        this.isActive = false;
        document.getElementById('view2d-container').style.display = 'none';
        document.getElementById('container').style.display = 'block';
    }
    
    prepareObjects() {
        if (!window.spaceEngineersData || window.spaceEngineersData.length === 0) {
            console.log('⚠️ Brak danych spaceEngineersData dla widoku 2D - tworzę dane testowe');
            this.createTestData();
            return;
        }
        
        console.log(`📊 Przygotowywanie ${window.spaceEngineersData.length} obiektów dla widoku 2D`);
        
        // Debug - sprawdź średnice obiektów
        console.log('🔍 Średnice obiektów z danych CSV:');
        window.spaceEngineersData.forEach(obj => {
            console.log(`- ${obj.name}: ${obj.diameter}km (typ: ${obj.objectType || obj.type})`);
        });
        
        // Calculate distance from center (0,0,0) for each object
        this.objects = window.spaceEngineersData.map(obj => {
            const distance = Math.sqrt(obj.x * obj.x + obj.y * obj.y + obj.z * obj.z);
            
            // Proporcjonalny rozmiar na podstawie rzeczywistej średnicy
            // Użyj logarytmicznej skali dla lepszego rozróżnienia rozmiarów
            const minSize = 4; // Minimalny rozmiar
            const maxSize = 30; // Maksymalny rozmiar
            
            let proportionalRadius;
            if (obj.diameter <= 0) {
                proportionalRadius = minSize;
            } else {
                // Logarytmiczna skala dla lepszego rozróżnienia
                const logScale = Math.log(obj.diameter + 1) * 3;
                proportionalRadius = Math.max(minSize, Math.min(maxSize, logScale));
            }
            
            console.log(`📏 ${obj.name}: średnica ${obj.diameter}km → rozmiar ${proportionalRadius.toFixed(1)}px`);
            
            return {
                ...obj,
                distance: distance,
                displayRadius: proportionalRadius
            };
        });
        
        // Sort by distance from center
        this.objects.sort((a, b) => a.distance - b.distance);
        
        console.log(`✅ Posortowano obiekty według odległości od centrum`);
        
        // Calculate positions for 2D layout
        this.calculateLayout();
    }
    
    calculateLayout() {
        // Dane orbit planet (zgodne z rzeczywistymi proporcjami)
        const planetOrbits = {
            'Navia (Kepler-444b)': { orbitDistance: 0.4, realDiameter: 12742, planetType: 'terrestrial' }, // Ziemia
            'Ravok (Kepler-444c)': { orbitDistance: 0.8, realDiameter: 6779, planetType: 'terrestrial' }, // Mars
            'Triton (Kepler-444d)': { orbitDistance: 1.5, realDiameter: 49244, planetType: 'ice_giant' }, // Neptun
            'Pertam (Kepler-444e)': { orbitDistance: 2.2, realDiameter: 4879, planetType: 'terrestrial' }, // Merkury
            'Vorath (Kepler-444f)': { orbitDistance: 3.5, realDiameter: 142984, planetType: 'gas_giant' } // Jowisz
        };
        
        const moonData = {
            'Elyra (Kepler-444b-1)': { parentPlanet: 'Navia (Kepler-444b)', moonDistance: 60, realDiameter: 3474 }, // Księżyc
            'Europa (Kepler-444c-1)': { parentPlanet: 'Ravok (Kepler-444c)', moonDistance: 45, realDiameter: 3121 }, // Europa
            'Torvion (Kepler-444e-1)': { parentPlanet: 'Pertam (Kepler-444e)', moonDistance: 35, realDiameter: 2634 }, // Enceladus
            'Phrygia (Kepler-444e-2)': { parentPlanet: 'Pertam (Kepler-444e)', moonDistance: 50, realDiameter: 1436 }, // Mimas
            'Titan (Kepler-444f-1)': { parentPlanet: 'Vorath (Kepler-444f)', moonDistance: 80, realDiameter: 5149 } // Tytan
        };
        
        // Skala dla widoku 2D - mniejsze obiekty żeby się nie nakładały
        const orbitScale = 120; // piksele na AU - większe orbity
        const baseSizeScale = 0.001; // Bardzo mała skala rozmiarów
        const minSize = 4; // Minimalny rozmiar obiektu w pikselach
        const maxSize = 25; // Maksymalny rozmiar obiektu w pikselach - zmniejszony
        
        const planets = this.objects.filter(obj => obj.objectType === 'planet');
        const moons = this.objects.filter(obj => obj.objectType === 'moon');
        const others = this.objects.filter(obj => 
            obj.objectType !== 'planet' && obj.objectType !== 'moon'
        );
        
        // Nie dodawaj słońca - zasłania inne obiekty
        
        // Rozmieść planety na orbitach wokół słońca - naprzemiennie lewo/prawo
        planets.forEach((planet, index) => {
            const orbitData = planetOrbits[planet.name];
            if (orbitData) {
                const orbitRadius = orbitData.orbitDistance * orbitScale;
                // Naprzemiennie z lewej i prawej strony (0° i 180°)
                const angle = (index % 2 === 0) ? 0 : Math.PI; // 0° lub 180°
                const x = this.centerX + Math.cos(angle) * orbitRadius;
                const y = this.centerY + Math.sin(angle) * orbitRadius;
                
                planet.layout2D = {
                    x: x,
                    y: y,
                    level: 0,
                    orbitRadius: orbitRadius,
                    orbitAngle: angle
                };
                // Zachowaj oryginalny displayRadius z rzeczywistych danych CSV
                // planet.displayRadius już jest ustawiony w prepareObjects()
                planet.planetType = orbitData.planetType;
            } else {
                // Fallback dla planet bez zdefiniowanej orbity
                planet.layout2D = {
                    x: this.centerX + (Math.random() - 0.5) * 400,
                    y: this.centerY + (Math.random() - 0.5) * 400,
                    level: 0
                };
                // Zachowaj oryginalny displayRadius z rzeczywistych danych CSV
                // planet.displayRadius już jest ustawiony w prepareObjects()
            }
        });
        
        // Rozmieść księżyce wokół swoich planet - naprzemiennie lewo/prawo
        moons.forEach((moon, moonIndex) => {
            const moonInfo = moonData[moon.name];
            if (moonInfo) {
                const parentPlanet = planets.find(p => p.name === moonInfo.parentPlanet);
                if (parentPlanet && parentPlanet.layout2D) {
                    const moonOrbitRadius = moonInfo.moonDistance * 0.8; // Skala dla widoku 2D
                    
                    // Znajdź wszystkie księżyce tej planety
                    const planetMoons = moons.filter(m => {
                        const mInfo = moonData[m.name];
                        return mInfo && mInfo.parentPlanet === moonInfo.parentPlanet;
                    });
                    
                    const moonIndexInPlanet = planetMoons.indexOf(moon);
                    
                    // Naprzemiennie z góry i z dołu (90° i 270°)
                    const moonAngle = (moonIndexInPlanet % 2 === 0) ? Math.PI/2 : 3*Math.PI/2; // 90° lub 270°
                    
                    moon.layout2D = {
                        x: parentPlanet.layout2D.x + Math.cos(moonAngle) * moonOrbitRadius,
                        y: parentPlanet.layout2D.y + Math.sin(moonAngle) * moonOrbitRadius,
                        level: 1,
                        parent: parentPlanet,
                        moonOrbitRadius: moonOrbitRadius,
                        moonAngle: moonAngle
                    };
                    // Zachowaj oryginalny displayRadius z rzeczywistych danych CSV
                    // moon.displayRadius już jest ustawiony w prepareObjects()
                }
            }
            
            // Fallback dla księżyców bez zdefiniowanego rodzica
            if (!moon.layout2D) {
                const closestPlanet = this.findParentPlanet(moon);
                if (closestPlanet && closestPlanet.layout2D) {
                    moon.layout2D = {
                        x: closestPlanet.layout2D.x + (Math.random() - 0.5) * 100,
                        y: closestPlanet.layout2D.y + 80 + Math.random() * 40,
                        level: 1,
                        parent: closestPlanet
                    };
                } else {
                    moon.layout2D = {
                        x: this.centerX + 300,
                        y: this.centerY + 150,
                        level: 1
                    };
                }
                // Zachowaj oryginalny displayRadius z rzeczywistych danych CSV
                // moon.displayRadius już jest ustawiony w prepareObjects()
            }
        });
        
        // Rozmieść pozostałe obiekty w okręgu wokół układu
        let otherAngle = 0;
        const otherRadius = Math.max(400, Math.max(...planets.map(p => p.layout2D ? p.layout2D.orbitRadius || 0 : 0)) + 100);
        others.forEach((obj, index) => {
            const x = this.centerX + Math.cos(otherAngle) * otherRadius;
            const y = this.centerY + Math.sin(otherAngle) * otherRadius;
            
            obj.layout2D = {
                x: x,
                y: y,
                level: 2
            };
            
            otherAngle += (Math.PI * 2) / others.length;
        });
    }
    
    findParentPlanet(moon) {
        // Simple heuristic: find closest planet
        let closestPlanet = null;
        let minDistance = Infinity;
        
        this.objects.filter(obj => obj.objectType === 'planet').forEach(planet => {
            const distance = Math.sqrt(
                Math.pow(moon.x - planet.x, 2) +
                Math.pow(moon.y - planet.y, 2) +
                Math.pow(moon.z - planet.z, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPlanet = planet;
            }
        });
        
        return closestPlanet;
    }
    
    render() {
        if (!this.isActive) return;
        
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nie rysuj siatki - niepotrzebne kreski
        
        // Draw orbits
        this.drawOrbits();
        
        // Draw danger zones as areas
        this.drawDangerZones();
        
        // Nie rysuj połączeń - niepotrzebne linie
        
        // Draw objects
        this.objects.forEach(obj => this.drawObject(obj));
        
        // Draw labels
        this.objects.forEach(obj => this.drawLabel(obj));
        
        // Nie rysuj markera centrum - niepotrzebny krzyżyk
        
        // Draw info message if no objects
        if (this.objects.length === 0) {
            this.drawNoDataMessage();
        }
    }
    
    // Funkcja drawGrid() usunięta - niepotrzebne kreski
    
    drawOrbits() {
        // Rysuj orbity planet - jaśniejsze i bardziej widoczne z zoom
        this.ctx.strokeStyle = '#6699cc';
        this.ctx.lineWidth = 2 * this.scale;
        this.ctx.setLineDash([5 * this.scale, 5 * this.scale]);
        
        const planets = this.objects.filter(obj => obj.objectType === 'planet' && obj.layout2D && obj.layout2D.orbitRadius);
        planets.forEach(planet => {
            this.ctx.beginPath();
            this.ctx.arc(
                (this.centerX + this.offsetX) * this.scale, 
                (this.centerY + this.offsetY) * this.scale, 
                planet.layout2D.orbitRadius * this.scale, 
                0, Math.PI * 2
            );
            this.ctx.stroke();
        });
        
        // Rysuj orbity księżyców - jaśniejsze z zoom
        this.ctx.strokeStyle = '#88aadd';
        this.ctx.lineWidth = 1 * this.scale;
        this.ctx.setLineDash([3 * this.scale, 3 * this.scale]);
        
        const moons = this.objects.filter(obj => obj.objectType === 'moon' && obj.layout2D && obj.layout2D.moonOrbitRadius);
        moons.forEach(moon => {
            if (moon.layout2D.parent && moon.layout2D.parent.layout2D) {
                this.ctx.beginPath();
                this.ctx.arc(
                    (moon.layout2D.parent.layout2D.x + this.offsetX) * this.scale, 
                    (moon.layout2D.parent.layout2D.y + this.offsetY) * this.scale, 
                    moon.layout2D.moonOrbitRadius * this.scale, 
                    0, Math.PI * 2
                );
                this.ctx.stroke();
            }
        });
        
        this.ctx.setLineDash([]);
    }
    
    drawDangerZones() {
        // Znajdź strefy niebezpieczeństwa i narysuj je jako obszary z zoom
        const dangerZones = this.objects.filter(obj => obj.objectType === 'danger_zone');
        
        dangerZones.forEach(zone => {
            // Znajdź planety i księżyce w pobliżu strefy
            const affectedObjects = this.findObjectsInZone(zone);
            
            if (affectedObjects.length > 0) {
                // Oblicz obszar obejmujący wszystkie obiekty w strefie
                const bounds = this.calculateZoneBounds(affectedObjects);
                
                // Zastosuj zoom i offset do strefy
                const centerX = (bounds.centerX + this.offsetX) * this.scale;
                const centerY = (bounds.centerY + this.offsetY) * this.scale;
                const radius = (bounds.radius + 30) * this.scale;
                
                // Rysuj strefę jako półprzezroczysty obszar
                this.ctx.fillStyle = this.colors.dangerZone + '22'; // Bardzo przezroczyste
                this.ctx.strokeStyle = this.colors.dangerZone + '88'; // Bardziej widoczne obramowanie
                this.ctx.lineWidth = 2 * this.scale;
                this.ctx.setLineDash([8 * this.scale, 4 * this.scale]);
                
                // Rysuj okrąg obejmujący strefę
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Dodaj napis strefy na dole obszaru z zoom
                const labelY = centerY + radius + 50 * this.scale;
                const fontSize = Math.max(8, Math.min(16, 12 * this.scale));
                
                // Cień pod napisem
                this.ctx.fillStyle = '#000000';
                this.ctx.font = `${fontSize}px "Fira Mono", monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(zone.name, centerX + 1, labelY + 1);
                
                // Główny napis
                this.ctx.fillStyle = this.colors.dangerZone;
                this.ctx.fillText(zone.name, centerX, labelY);
                
                this.ctx.setLineDash([]);
            }
        });
    }
    
    findObjectsInZone(zone) {
        // Znajdź obiekty w pobliżu strefy (planety i księżyce)
        const affectedObjects = [];
        const zoneRadius = 200000; // Promień strefy w jednostkach gry
        
        this.objects.forEach(obj => {
            if (obj.objectType === 'planet' || obj.objectType === 'moon') {
                const distance = Math.sqrt(
                    Math.pow(obj.x - zone.x, 2) +
                    Math.pow(obj.y - zone.y, 2) +
                    Math.pow(obj.z - zone.z, 2)
                );
                
                if (distance < zoneRadius) {
                    affectedObjects.push(obj);
                }
            }
        });
        
        // Jeśli nie znaleziono obiektów w pobliżu, spróbuj znaleźć najbliższe
        if (affectedObjects.length === 0) {
            // Znajdź najbliższą planetę
            let closestPlanet = null;
            let minDistance = Infinity;
            
            this.objects.forEach(obj => {
                if (obj.objectType === 'planet' && obj.layout2D) {
                    const distance = Math.sqrt(
                        Math.pow(obj.x - zone.x, 2) +
                        Math.pow(obj.y - zone.y, 2) +
                        Math.pow(obj.z - zone.z, 2)
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPlanet = obj;
                    }
                }
            });
            
            if (closestPlanet) {
                affectedObjects.push(closestPlanet);
                
                // Dodaj księżyce tej planety
                this.objects.forEach(obj => {
                    if (obj.objectType === 'moon' && obj.layout2D && obj.layout2D.parent === closestPlanet) {
                        affectedObjects.push(obj);
                    }
                });
            }
        }
        
        return affectedObjects;
    }
    
    calculateZoneBounds(objects) {
        if (objects.length === 0) return { centerX: 0, centerY: 0, radius: 50 };
        
        // Znajdź granice obszaru
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        objects.forEach(obj => {
            if (obj.layout2D) {
                minX = Math.min(minX, obj.layout2D.x - obj.displayRadius);
                maxX = Math.max(maxX, obj.layout2D.x + obj.displayRadius);
                minY = Math.min(minY, obj.layout2D.y - obj.displayRadius);
                maxY = Math.max(maxY, obj.layout2D.y + obj.displayRadius);
            }
        });
        
        // Oblicz środek i promień
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const radius = Math.max(
            Math.abs(maxX - minX) / 2,
            Math.abs(maxY - minY) / 2
        ) + 20; // Dodatkowy margines
        
        return { centerX, centerY, radius };
    }
    
    drawConnections() {
        this.ctx.strokeStyle = this.colors.connection;
        this.ctx.lineWidth = 1;
        
        this.objects.forEach(obj => {
            if (obj.layout2D && obj.layout2D.parent) {
                this.ctx.beginPath();
                this.ctx.moveTo(obj.layout2D.parent.layout2D.x, obj.layout2D.parent.layout2D.y);
                this.ctx.lineTo(obj.layout2D.x, obj.layout2D.y);
                this.ctx.stroke();
            }
        });
    }
    
    drawObject(obj) {
        if (!obj.layout2D) return;
        
        // Zastosuj zoom i offset
        const x = (obj.layout2D.x + this.offsetX) * this.scale;
        const y = (obj.layout2D.y + this.offsetY) * this.scale;
        const radius = obj.displayRadius * this.scale;
        
        // Get color based on object type and planet type
        let color = this.colors.planet;
        
        if (obj.objectType === 'star') {
            color = '#ffff00';
        } else if (obj.objectType === 'planet') {
            // Różne kolory dla różnych typów planet
            switch (obj.planetType) {
                case 'gas_giant':
                    color = '#ff8844'; // Pomarańczowy dla gazowych gigantów
                    break;
                case 'ice_giant':
                    color = '#44aaff'; // Niebieski dla lodowych gigantów
                    break;
                case 'terrestrial':
                    // Różne kolory dla planet skalistych
                    if (obj.name.includes('Navia')) color = '#66cc66'; // Zielony - Ziemia
                    else if (obj.name.includes('Ravok')) color = '#cc6644'; // Czerwony - Mars
                    else if (obj.name.includes('Pertam')) color = '#cccc44'; // Żółty - Merkury
                    else color = '#8888cc'; // Domyślny niebieski
                    break;
                default:
                    color = this.colors.planet;
            }
        } else if (obj.objectType === 'moon') {
            // Różne kolory dla księżyców
            if (obj.name.includes('Elyra')) color = '#cccccc'; // Szary - Księżyc
            else if (obj.name.includes('Europa')) color = '#aaccff'; // Jasnoniebieski - Europa
            else if (obj.name.includes('Titan')) color = '#ffaa66'; // Pomarańczowy - Tytan
            else color = this.colors.moon;
        } else if (obj.objectType === 'wormhole') {
            color = this.colors.wormhole;
        } else if (obj.objectType === 'danger_zone') {
            color = this.colors.dangerZone;
        } else if (obj.objectType === 'user_object') {
            color = this.colors.userObject;
        }
        
        // Highlight if hovered
        if (obj === this.hoveredObject) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw object
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        
        if (obj.objectType === 'star') {
            // Draw sun with special glow effect
            const time = Date.now() * 0.002;
            
            // Outer glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
            gradient.addColorStop(0, '#ffff00aa');
            gradient.addColorStop(0.3, '#ffaa0044');
            gradient.addColorStop(0.6, '#ff660022');
            gradient.addColorStop(1, '#ff000000');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main sun body with pulsing effect
            const pulseRadius = radius + Math.sin(time * 2) * 2;
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner bright core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulseRadius * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
            
            return;
        } else if (obj.objectType === 'danger_zone') {
            // Nie rysuj znaczników stref - tylko obszary z napisami
            return;
        } else if (obj.objectType === 'wormhole') {
            // Draw wormholes as rotating rings
            const time = Date.now() * 0.001;
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(time);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
            return;
        } else {
            // Draw regular objects as circles
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        
        // Add inner glow for planets based on type
        if (obj.objectType === 'planet') {
            let glowColor = color + '44';
            if (obj.planetType === 'gas_giant') {
                glowColor = color + '66';
            } else if (obj.planetType === 'ice_giant') {
                glowColor = color + '55';
            }
            
            this.ctx.fillStyle = glowColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawLabel(obj) {
        if (!obj.layout2D) return;
        
        // Zastosuj zoom i offset
        const x = (obj.layout2D.x + this.offsetX) * this.scale;
        let y = (obj.layout2D.y + obj.displayRadius + 8 + this.offsetY) * this.scale; // Bliżej obiektu
        
        // Dla księżyców - napisy bardzo blisko
        if (obj.objectType === 'moon' && obj.layout2D.parent) {
            y = (obj.layout2D.y + obj.displayRadius + 6 + this.offsetY) * this.scale; // Jeszcze bliżej dla księżyców
        }
        
        // Skaluj czcionkę z zoom
        const fontSize = Math.max(8, Math.min(16, 10 * this.scale));
        
        // Cień pod tekstem dla lepszej czytelności
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${fontSize}px "Fira Mono", monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(obj.name, x + 1, y + 1);
        
        // Główny tekst - biały dla lepszego kontrastu
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(obj.name, x, y);
    }
    
    // Funkcja drawCenterMarker() usunięta - niepotrzebny krzyżyk
    
    drawNoDataMessage() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '16px "Fira Mono", monospace';
        this.ctx.textAlign = 'center';
        
        const messages = [
            'ŁADOWANIE DANYCH SYSTEMU...',
            '',
            'Uruchom aplikację przez Live Server',
            'aby załadować dane z pliku CSV'
        ];
        
        let y = this.centerY - 60;
        messages.forEach(message => {
            if (message) {
                this.ctx.fillText(message, this.centerX, y);
            }
            y += 25;
        });
        
        // Draw loading animation
        const time = Date.now() * 0.003;
        const radius = 20;
        this.ctx.strokeStyle = this.colors.text;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY + 80, radius, time, time + Math.PI);
        this.ctx.stroke();
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Najpierw sprawdź czy kliknięto w napis strefy
        const clickedZoneLabel = this.getZoneLabelAt(x, y);
        if (clickedZoneLabel && window.showObjectInfo) {
            window.showObjectInfo(clickedZoneLabel);
            return;
        }
        
        // Potem sprawdź inne obiekty (ale nie strefy jako obiekty)
        const clickedObject = this.getObjectAt(x, y);
        if (clickedObject && clickedObject.objectType !== 'danger_zone' && window.showObjectInfo) {
            window.showObjectInfo(clickedObject);
        }
    }
    
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.isDragging = true;
        this.lastMouseX = x;
        this.lastMouseY = y;
        this.canvas.style.cursor = 'grabbing';
    }
    
    handleMouseUp(event) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.isDragging) {
            // Panning - przesuwanie mapy
            const deltaX = (x - this.lastMouseX) / this.scale;
            const deltaY = (y - this.lastMouseY) / this.scale;
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastMouseX = x;
            this.lastMouseY = y;
            
            this.render();
            return;
        }
        
        const hoveredObject = this.getObjectAt(x, y);
        
        if (hoveredObject !== this.hoveredObject) {
            this.hoveredObject = hoveredObject;
            this.canvas.style.cursor = hoveredObject ? 'pointer' : 'default';
            this.render();
        }
    }
    
    handleWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Zoom factor
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, this.scale * zoomFactor));
        
        if (newScale !== this.scale) {
            // Calculate zoom point relative to center
            const zoomPointX = mouseX - this.centerX;
            const zoomPointY = mouseY - this.centerY;
            
            // Update offset to zoom towards mouse position
            this.offsetX = this.offsetX * zoomFactor - zoomPointX * (zoomFactor - 1);
            this.offsetY = this.offsetY * zoomFactor - zoomPointY * (zoomFactor - 1);
            
            this.scale = newScale;
            this.render();
        }
    }
    
    getObjectAt(x, y) {
        for (let obj of this.objects) {
            if (!obj.layout2D) continue;
            
            // Zastosuj zoom i offset do pozycji obiektu
            const objX = (obj.layout2D.x + this.offsetX) * this.scale;
            const objY = (obj.layout2D.y + this.offsetY) * this.scale;
            const objRadius = obj.displayRadius * this.scale;
            
            const dx = x - objX;
            const dy = y - objY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= objRadius + 5) {
                return obj;
            }
        }
        return null;
    }
    
    getZoneLabelAt(x, y) {
        // Sprawdź czy kliknięto w napis strefy niebezpieczeństwa z zoom i offset
        const dangerZones = this.objects.filter(obj => obj.objectType === 'danger_zone');
        
        for (let zone of dangerZones) {
            const affectedObjects = this.findObjectsInZone(zone);
            if (affectedObjects.length > 0) {
                const bounds = this.calculateZoneBounds(affectedObjects);
                
                // Zastosuj zoom i offset do pozycji napisu
                const centerX = (bounds.centerX + this.offsetX) * this.scale;
                const centerY = (bounds.centerY + this.offsetY) * this.scale;
                const radius = (bounds.radius + 30) * this.scale;
                const labelY = centerY + radius + 50 * this.scale;
                
                // Sprawdź czy kliknięto w obszar napisu (przybliżony prostokąt z zoom)
                const fontSize = Math.max(8, Math.min(16, 12 * this.scale));
                const textWidth = zone.name.length * fontSize * 0.6; // Przybliżona szerokość tekstu
                const textHeight = fontSize * 1.2;
                
                if (x >= centerX - textWidth/2 && 
                    x <= centerX + textWidth/2 &&
                    y >= labelY - textHeight/2 && 
                    y <= labelY + textHeight/2) {
                    return zone;
                }
            }
        }
        return null;
    }
    
    extractDataFromDropdown() {
        console.log('🔍 Próbuję wyciągnąć dane z dropdown...');
        
        // Sprawdź czy istnieje globalna zmienna stars (używana w widoku 3D)
        if (window.stars && window.stars.length > 0) {
            console.log(`📊 Znaleziono ${window.stars.length} obiektów w window.stars`);
            
            // Konwertuj obiekty z stars na format dla widoku 2D
            window.spaceEngineersData = window.stars.map(star => {
                return {
                    name: star.userData.name || 'Nieznany',
                    type: star.userData.type || 'Obiekt',
                    x: star.position.x,
                    y: star.position.y,
                    z: star.position.z,
                    diameter: star.userData.diameter || 1,
                    color: star.material ? star.material.color.getHex() : 0xffffff,
                    objectType: this.determineObjectType(star.userData.type),
                    description: star.userData.description || 'Brak opisu'
                };
            });
            
            console.log(`✅ Skonwertowano dane z window.stars do spaceEngineersData`);
            return true;
        }
        
        console.log('❌ Nie znaleziono danych w window.stars');
        return false;
    }
    
    determineObjectType(type) {
        if (!type) return 'planet';
        
        const typeStr = type.toLowerCase();
        if (typeStr.includes('księżyc') || typeStr.includes('moon')) return 'moon';
        if (typeStr.includes('tunel') || typeStr.includes('wormhole')) return 'wormhole';
        if (typeStr.includes('danger') || typeStr.includes('niebezpiecz')) return 'danger_zone';
        if (typeStr.includes('user') || typeStr.includes('użytkownik')) return 'user_object';
        return 'planet';
    }
    
    createTestData() {
        console.log('🧪 Tworzę dane testowe dla widoku 2D');
        
        // Create test objects based on the CSV structure
        this.objects = [
            {
                name: 'Navia (Test)',
                type: 'Planeta',
                x: 0.5,
                y: 0.5,
                z: 0.5,
                diameter: 120,
                color: 0xFF0000,
                objectType: 'planet',
                description: 'Testowa planeta - dane nie załadowane z CSV',
                distance: Math.sqrt(0.5*0.5 + 0.5*0.5 + 0.5*0.5),
                displayRadius: 15
            },
            {
                name: 'Elyra (Test)',
                type: 'Księżyc',
                x: 16384.5,
                y: 136384.5,
                z: -113615.5,
                diameter: 19,
                color: 0x00FF00,
                objectType: 'moon',
                description: 'Testowy księżyc - dane nie załadowane z CSV',
                distance: Math.sqrt(16384.5*16384.5 + 136384.5*136384.5 + 113615.5*113615.5),
                displayRadius: 12
            },
            {
                name: 'Wormhole Test',
                type: 'Tunel',
                x: 20013596.26,
                y: 1185.94,
                z: 758.1,
                diameter: 2,
                color: 0xFFFFFF,
                objectType: 'wormhole',
                description: 'Testowy wormhole - dane nie załadowane z CSV',
                distance: Math.sqrt(20013596.26*20013596.26 + 1185.94*1185.94 + 758.1*758.1),
                displayRadius: 10
            }
        ];
        
        // Sort by distance from center
        this.objects.sort((a, b) => a.distance - b.distance);
        
        console.log(`✅ Utworzono ${this.objects.length} obiektów testowych`);
        
        // Calculate positions for 2D layout
        this.calculateLayout();
    }
}

// Initialize 2D view
let view2D = null;

function initView2D() {
    console.log('🚀 Inicjalizacja widoku 2D...');
    view2D = new View2D();
    
    // Setup toggle button
    const toggleBtn = document.getElementById('view-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleView);
        console.log('✅ Przycisk 2D/3D podłączony');
    } else {
        console.error('❌ Nie znaleziono przycisku view-toggle-btn');
    }
    
    // Debug - sprawdź stan danych
    console.log('🔍 Stan danych przy inicjalizacji 2D:');
    console.log('- window.spaceEngineersData:', window.spaceEngineersData);
    console.log('- Długość:', window.spaceEngineersData ? window.spaceEngineersData.length : 'undefined');
    
    // Sprawdź dropdown - jeśli ma opcje, to dane są załadowane
    const dropdown = document.getElementById('object-dropdown');
    if (dropdown) {
        console.log('- Dropdown opcje:', dropdown.options.length);
        if (dropdown.options.length > 1) {
            console.log('✅ Dropdown ma opcje - dane prawdopodobnie załadowane');
        }
    }
    
    // Prepare objects if data is already available
    if (window.spaceEngineersData && window.spaceEngineersData.length > 0) {
        console.log('📊 Dane już dostępne - przygotowywanie widoku 2D');
        view2D.prepareObjects();
    } else {
        console.log('⏳ Dane jeszcze nie załadowane - widok 2D będzie przygotowany później');
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

// Animation loop for 2D view
function animate2D() {
    if (view2D && view2D.isActive) {
        view2D.render();
    }
    requestAnimationFrame(animate2D);
}

// Export to global scope
window.initView2D = initView2D;
window.toggleView = toggleView;
window.view2D = view2D;

// Start animation loop
animate2D();
