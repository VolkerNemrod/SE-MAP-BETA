// coordinateController.js - Moduł sterowania znacznikiem na mapie 3D

class CoordinateController {
    constructor() {
        this.isActive = false;
        this.isPanelOpen = false;
        this.marker = null;
        this.markerId = null;
        
        // Pozycja markera
        this.position = { x: 0, y: 0, z: 0 };
        
        // Prędkości (m/s)
        this.speeds = [1, 10, 100, 1000, 10000, 100000];
        this.currentSpeedIndex = 2; // Domyślnie 100 m/s
        
        // Tryby kamery
        this.cameraMode = 'free'; // 'follow', 'free', 'center'
        
        // Sterowanie
        this.keys = {};
        this.lastUpdateTime = 0;
        
        // Elementy UI
        this.panel = null;
        this.coordInputs = {};
        
        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        console.log('🎯 CoordinateController zainicjalizowany');
    }

    createUI() {
        // Przycisk w top-bar
        this.createToggleButton();
        
        // Panel kontrolera
        this.createControlPanel();
    }

    createToggleButton() {
        const topBar = document.getElementById('top-bar');
        
        // Create second row container if it doesn't exist
        let secondRow = topBar.querySelector('.menu-row-2');
        if (!secondRow) {
            secondRow = document.createElement('div');
            secondRow.className = 'menu-row-2';
            topBar.appendChild(secondRow);
        }
        
        const button = document.createElement('button');
        button.id = 'coordinate-controller-btn';
        button.innerHTML = '🎯 Kontroler';
        button.style.cssText = `
            background: #101f13;
            color: #93ffd2;
            font-weight: 700;
            border: 1.6px solid #13fd87;
            border-radius: 6px;
            padding: 3px 12px;
            margin-left: 6px;
            margin-right: 2px;
            cursor: pointer;
            transition: background 0.14s, color 0.12s;
            font-size: 0.9em;
            text-shadow: 0 0 6px #19ff97;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#18ffcc22';
            button.style.color = '#fff';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#101f13';
            button.style.color = '#93ffd2';
        });
        
        button.addEventListener('click', () => {
            this.togglePanel();
        });
        
        // Add to second row
        secondRow.appendChild(button);
    }

    createControlPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'coordinate-controller-panel';
        this.panel.style.cssText = `
            position: fixed;
            right: 0;
            top: 86px;
            width: 380px;
            max-width: 40vw;
            min-width: 300px;
            background: rgba(18,44,32,0.95);
            border-left: 2px solid #17ffb2;
            border-bottom: 2px double #00f385;
            padding: 16px;
            z-index: 15;
            border-radius: 16px 0 0 16px;
            box-shadow: -4px 8px 20px #002c1370;
            font-family: 'Fira Mono','Consolas',monospace;
            font-size: 1em;
            display: none;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // Nagłówek
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #13fd87;
        `;
        
        const title = document.createElement('h3');
        title.textContent = window.t ? window.t('controller.title') : '🎯 Kontroler Punktu';
        title.setAttribute('data-i18n', 'controller.title');
        title.style.cssText = `
            margin: 0;
            color: #fffacd;
            font-family: 'Orbitron','Fira Mono','Consolas',monospace;
            font-size: 1.2em;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✖';
        closeBtn.style.cssText = `
            background: #2f1313;
            color: #ff9393;
            border: 1px solid #fd3636;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 0.9em;
        `;
        closeBtn.addEventListener('click', () => this.closePanel());
        
        header.appendChild(title);
        header.appendChild(closeBtn);

        // Przyciski akcji (na górze)
        const actionSection = this.createActionSection();

        // Koordynaty
        const coordSection = this.createCoordinateSection();
        
        // Prędkość
        const speedSection = this.createSpeedSection();
        
        // Tryby kamery
        const cameraSection = this.createCameraSection();
        
        // Instrukcje (na dole)
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            background: rgba(0,100,100,0.2);
            border: 1px solid #00ffcc;
            border-radius: 6px;
            padding: 12px;
            margin-top: 16px;
            color: #b2ffd6;
            font-size: 0.9em;
            line-height: 1.4;
        `;
        
        // Ustaw domyślną zawartość instrukcji
        const instructionsContent = window.t ? this.getInstructionsHTML() : `
            <strong>Sterowanie:</strong><br>
            <span style="color: #00ffcc;">WASD</span> - ruch po płaszczyźnie XZ<br>
            <span style="color: #00ffcc;">SPACE</span> - w górę (Y+)<br>
            <span style="color: #00ffcc;">C</span> - w dół (Y-)<br>
            <span style="color: #ffcc00;">Kółko myszy nad panelem</span> - wielkość punktu (1-500km)<br>
            <em>Sterowanie aktywne tylko gdy panel otwarty</em>
        `;
        instructions.innerHTML = instructionsContent;
        this.instructionsElement = instructions;

        this.panel.appendChild(header);
        this.panel.appendChild(actionSection);
        this.panel.appendChild(coordSection);
        this.panel.appendChild(speedSection);
        this.panel.appendChild(cameraSection);
        this.panel.appendChild(instructions);
        
        document.body.appendChild(this.panel);
    }

    createCoordinateSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            padding: 12px;
            background: rgba(0,80,40,0.2);
            border-radius: 6px;
            border-left: 3px solid #00ff80;
        `;

        const title = document.createElement('div');
        title.textContent = window.t ? window.t('controller.sections.coordinates') : 'Koordynaty:';
        title.setAttribute('data-i18n', 'controller.sections.coordinates');
        title.style.cssText = `
            color: #fffacd;
            font-weight: bold;
            margin-bottom: 8px;
        `;

        const coordGrid = document.createElement('div');
        coordGrid.style.cssText = `
            display: grid;
            grid-template-columns: 20px 1fr 60px;
            gap: 8px;
            align-items: center;
        `;

        ['X', 'Y', 'Z'].forEach(axis => {
            const label = document.createElement('span');
            label.textContent = axis + ':';
            label.style.cssText = `color: #9fa; font-weight: bold;`;

            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.value = '0.00';
            input.style.cssText = `
                background: #13281b;
                color: #aaffaa;
                border: 1px solid #13fd87;
                border-radius: 4px;
                padding: 4px 6px;
                font-family: 'Fira Mono', monospace;
                font-size: 0.9em;
            `;
            
            input.addEventListener('change', () => {
                this.updatePositionFromInput(axis.toLowerCase(), parseFloat(input.value) || 0);
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.updatePositionFromInput(axis.toLowerCase(), parseFloat(input.value) || 0);
                }
            });

            const unit = document.createElement('span');
            unit.textContent = 'm';
            unit.style.cssText = `color: #9af; font-size: 0.8em;`;

            this.coordInputs[axis.toLowerCase()] = input;

            coordGrid.appendChild(label);
            coordGrid.appendChild(input);
            coordGrid.appendChild(unit);
        });

        const pasteBtn = document.createElement('button');
        pasteBtn.innerHTML = window.t ? window.t('controller.buttons.pasteGPS') : '📥 COPY FROM CLIPBOARD';
        pasteBtn.setAttribute('data-i18n', 'controller.buttons.pasteGPS');
        pasteBtn.style.cssText = `
            background: #131f20;
            color: #93d2ff;
            border: 1px solid #1387fd;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            margin-top: 8px;
            font-size: 0.9em;
            width: 100%;
        `;
        pasteBtn.addEventListener('click', () => this.pasteGPSFromClipboard());

        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = window.t ? window.t('controller.buttons.copyGPS') : '📋 COPY GPS';
        copyBtn.setAttribute('data-i18n', 'controller.buttons.copyGPS');
        copyBtn.style.cssText = `
            background: #101f13;
            color: #93ffd2;
            border: 1px solid #13fd87;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            margin-top: 4px;
            font-size: 0.9em;
            width: 100%;
        `;
        copyBtn.addEventListener('click', () => this.copyGPSCoordinates());

        section.appendChild(title);
        section.appendChild(coordGrid);
        section.appendChild(pasteBtn);
        section.appendChild(copyBtn);
        
        return section;
    }

    createSpeedSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            padding: 12px;
            background: rgba(80,40,0,0.2);
            border-radius: 6px;
            border-left: 3px solid #ff8000;
        `;

        const title = document.createElement('div');
        title.textContent = window.t ? window.t('controller.sections.speed') : 'Prędkość ruchu:';
        title.setAttribute('data-i18n', 'controller.sections.speed');
        title.style.cssText = `
            color: #fffacd;
            font-weight: bold;
            margin-bottom: 8px;
        `;

        const speedGrid = document.createElement('div');
        speedGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
        `;

        this.speeds.forEach((speed, index) => {
            const btn = document.createElement('button');
            const speedText = speed >= 1000 ? `${speed/1000}km/s` : `${speed}m/s`;
            btn.textContent = speedText;
            btn.style.cssText = `
                background: ${index === this.currentSpeedIndex ? '#18ffcc22' : '#13281b'};
                color: ${index === this.currentSpeedIndex ? '#fff' : '#aaffaa'};
                border: 1px solid #13fd87;
                border-radius: 4px;
                padding: 4px 6px;
                cursor: pointer;
                font-size: 0.8em;
                transition: all 0.2s;
            `;
            
            btn.addEventListener('click', () => {
                this.setSpeed(index);
                this.updateSpeedButtons();
            });
            
            speedGrid.appendChild(btn);
        });

        section.appendChild(title);
        section.appendChild(speedGrid);
        
        this.speedButtons = speedGrid.children;
        return section;
    }

    createCameraSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            padding: 12px;
            background: rgba(40,0,80,0.2);
            border-radius: 6px;
            border-left: 3px solid #8000ff;
        `;

        const title = document.createElement('div');
        title.textContent = window.t ? window.t('controller.sections.camera') : 'Tryb kamery:';
        title.setAttribute('data-i18n', 'controller.sections.camera');
        title.style.cssText = `
            color: #fffacd;
            font-weight: bold;
            margin-bottom: 8px;
        `;

        const modes = [
            { 
                id: 'follow', 
                label: window.t ? window.t('controller.camera.follow') : '👁️ Śledź punkt', 
                desc: window.t ? window.t('controller.camera.followDesc') : 'Kamera podąża za punktem' 
            },
            { 
                id: 'free', 
                label: window.t ? window.t('controller.camera.free') : '🖱️ Wolna kamera', 
                desc: window.t ? window.t('controller.camera.freeDesc') : 'Normalne sterowanie myszką' 
            },
            { 
                id: 'center', 
                label: window.t ? window.t('controller.camera.center') : '🎯 Centruj na punkt', 
                desc: window.t ? window.t('controller.camera.centerDesc') : 'Skok kamery do punktu' 
            }
        ];

        modes.forEach(mode => {
            const btn = document.createElement('button');
            btn.innerHTML = mode.label;
            btn.title = mode.desc;
            btn.style.cssText = `
                background: ${mode.id === this.cameraMode ? '#18ffcc22' : '#13281b'};
                color: ${mode.id === this.cameraMode ? '#fff' : '#aaffaa'};
                border: 1px solid #13fd87;
                border-radius: 4px;
                padding: 6px 8px;
                cursor: pointer;
                font-size: 0.85em;
                margin: 2px;
                width: calc(100% - 4px);
                text-align: left;
            `;
            
            btn.addEventListener('click', () => {
                this.setCameraMode(mode.id);
                this.updateCameraButtons();
            });
            
            section.appendChild(btn);
        });

        section.appendChild(title);
        this.cameraButtons = Array.from(section.children).slice(1);
        return section;
    }

    createActionSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: space-between;
            margin-bottom: 16px;
        `;

        const activateBtn = document.createElement('button');
        activateBtn.innerHTML = '▶️ Aktywuj';
        activateBtn.style.cssText = `
            background: #101f13;
            color: #93ffd2;
            border: 1px solid #13fd87;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: bold;
            flex: 1;
        `;
        activateBtn.addEventListener('click', () => this.toggleController());

        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '🔄 Reset (0,0,0)';
        resetBtn.style.cssText = `
            background: #2f2f13;
            color: #ffff93;
            border: 1px solid #fdfd36;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
            flex: 1;
        `;
        resetBtn.addEventListener('click', () => this.resetPosition());

        section.appendChild(activateBtn);
        section.appendChild(resetBtn);
        
        this.activateBtn = activateBtn;
        return section;
    }

    setupEventListeners() {
        // Sterowanie klawiaturą
        document.addEventListener('keydown', (e) => {
            if (!this.isActive || !this.isPanelOpen) return;
            
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd', ' ', 'c'].includes(key)) {
                this.keys[key] = true;
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (!this.isActive) return;
            
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd', ' ', 'c'].includes(key)) {
                this.keys[key] = false;
                e.preventDefault();
            }
        });

        // Kontrola wielkości punktu kółkiem myszy (tylko gdy mysz jest nad panelem)
        this.panel.addEventListener('wheel', (e) => {
            if (!this.isActive || !this.isPanelOpen || !this.marker) return;
            
            e.preventDefault();
            
            // Pobierz obecną wielkość
            const currentScale = this.marker.geometry.parameters.radius;
            const scaleChange = e.deltaY > 0 ? 0.9 : 1.1; // Zmniejsz lub zwiększ o 10%
            const newScale = Math.max(1000, Math.min(500000, currentScale * scaleChange)); // Limit 1km - 500km
            
            // Utwórz nową geometrię z nową wielkością
            const oldGeometry = this.marker.geometry;
            this.marker.geometry = new THREE.SphereGeometry(newScale, 16, 16);
            oldGeometry.dispose();
            
            console.log(`🎯 Zmieniono wielkość punktu na: ${(newScale/1000).toFixed(1)}km`);
            
            // Pokaż powiadomienie o zmianie wielkości
            this.showNotification(`🎯 Wielkość punktu: ${(newScale/1000).toFixed(1)}km`);
        });

        // Aktualizacja pozycji
        this.startUpdateLoop();
        
        // Nasłuchuj zmiany języka
        window.addEventListener('languageChanged', () => {
            this.updateLanguage();
        });
    }
    
    getInstructionsHTML() {
        if (!window.t) return '';
        
        return `
            <strong>${window.t('controller.instructions.title')}</strong><br>
            <span style="color: #00ffcc;">WASD</span> - ${window.t('controller.instructions.wasd')}<br>
            <span style="color: #00ffcc;">SPACE</span> - ${window.t('controller.instructions.space')}<br>
            <span style="color: #00ffcc;">C</span> - ${window.t('controller.instructions.c')}<br>
            <span style="color: #ffcc00;">${window.t('controller.instructions.mouse')}</span> - ${window.t('controller.instructions.mouseDesc')}<br>
            <em>${window.t('controller.instructions.note')}</em>
        `;
    }

    updateLanguage() {
        // Aktualizuj tytuł panelu
        const title = this.panel.querySelector('[data-i18n="controller.title"]');
        if (title && window.t) {
            title.textContent = window.t('controller.title');
        }
        
        // Aktualizuj sekcje
        const coordTitle = this.panel.querySelector('[data-i18n="controller.sections.coordinates"]');
        if (coordTitle && window.t) {
            coordTitle.textContent = window.t('controller.sections.coordinates');
        }
        
        const speedTitle = this.panel.querySelector('[data-i18n="controller.sections.speed"]');
        if (speedTitle && window.t) {
            speedTitle.textContent = window.t('controller.sections.speed');
        }
        
        const cameraTitle = this.panel.querySelector('[data-i18n="controller.sections.camera"]');
        if (cameraTitle && window.t) {
            cameraTitle.textContent = window.t('controller.sections.camera');
        }
        
        // Aktualizuj instrukcje
        if (this.instructionsElement && window.t) {
            this.instructionsElement.innerHTML = this.getInstructionsHTML();
        }
        
        // Aktualizuj przyciski kamery
        if (this.cameraButtons && window.t) {
            const modes = ['follow', 'free', 'center'];
            this.cameraButtons.forEach((btn, index) => {
                const modeId = modes[index];
                btn.innerHTML = window.t(`controller.camera.${modeId}`);
                btn.title = window.t(`controller.camera.${modeId}Desc`);
            });
        }
        
        // Aktualizuj przyciski GPS
        const pasteBtn = this.panel.querySelector('[data-i18n="controller.buttons.pasteGPS"]');
        if (pasteBtn && window.t) {
            pasteBtn.innerHTML = window.t('controller.buttons.pasteGPS');
        }
        
        const copyBtn = this.panel.querySelector('[data-i18n="controller.buttons.copyGPS"]');
        if (copyBtn && window.t) {
            copyBtn.innerHTML = window.t('controller.buttons.copyGPS');
        }
        
        // Aktualizuj przyciski
        if (window.t) {
            if (this.isActive) {
                this.activateBtn.innerHTML = window.t('controller.buttons.deactivate');
            } else {
                this.activateBtn.innerHTML = window.t('controller.buttons.activate');
            }
        }
    }

    startUpdateLoop() {
        const update = () => {
            if (this.isActive) {
                this.updateMovement();
                this.updateCamera();
            }
            requestAnimationFrame(update);
        };
        update();
    }

    updateMovement() {
        if (!this.isPanelOpen) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        
        if (deltaTime > 0.1) return; // Skip large time jumps
        
        const speed = this.speeds[this.currentSpeedIndex] * deltaTime;
        let moved = false;

        // Pobierz kierunki kamery dla ruchu względnego
        const cameraDirection = new THREE.Vector3();
        const cameraRight = new THREE.Vector3();
        
        camera.getWorldDirection(cameraDirection);
        cameraRight.crossVectors(cameraDirection, camera.up).normalize();
        
        // Ruch w płaszczyźnie XZ względem kamery
        if (this.keys['w']) {
            this.position.x += cameraDirection.x * speed;
            this.position.z += cameraDirection.z * speed;
            moved = true;
        }
        if (this.keys['s']) {
            this.position.x -= cameraDirection.x * speed;
            this.position.z -= cameraDirection.z * speed;
            moved = true;
        }
        if (this.keys['a']) {
            this.position.x -= cameraRight.x * speed;
            this.position.z -= cameraRight.z * speed;
            moved = true;
        }
        if (this.keys['d']) {
            this.position.x += cameraRight.x * speed;
            this.position.z += cameraRight.z * speed;
            moved = true;
        }
        
        // Ruch w osi Y (absolutny)
        if (this.keys[' ']) {
            this.position.y += speed;
            moved = true;
        }
        if (this.keys['c']) {
            this.position.y -= speed;
            moved = true;
        }

        if (moved) {
            this.updateMarkerPosition();
            this.updateCoordinateInputs();
        }
    }

    updateCamera() {
        if (this.cameraMode === 'follow' && this.marker) {
            // Kamera podąża za markerem
            const targetPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
            window.target.copy(targetPos);
            
            // Zachowaj obecną odległość i kąty kamery
            if (window.spherical && window.offset) {
                window.offset.setFromSpherical(window.spherical);
                camera.position.copy(window.target).add(window.offset);
                camera.lookAt(window.target);
            }
        }
    }

    togglePanel() {
        this.isPanelOpen = !this.isPanelOpen;
        this.panel.style.display = this.isPanelOpen ? 'block' : 'none';
        
        if (this.isPanelOpen) {
            this.lastUpdateTime = performance.now();
        }
    }

    closePanel() {
        this.isPanelOpen = false;
        this.panel.style.display = 'none';
    }

    toggleController() {
        if (this.isActive) {
            this.deactivateController();
        } else {
            this.activateController();
        }
    }

    activateController() {
        this.isActive = true;
        this.createMarker();
        this.activateBtn.innerHTML = '⏹️ Wyłącz';
        this.activateBtn.style.background = '#2f1313';
        this.activateBtn.style.color = '#ff9393';
        this.activateBtn.style.borderColor = '#fd3636';
        this.lastUpdateTime = performance.now();
        console.log('🎯 Kontroler aktywowany');
    }

    deactivateController() {
        this.isActive = false;
        this.removeMarker();
        this.activateBtn.innerHTML = '▶️ Aktywuj';
        this.activateBtn.style.background = '#101f13';
        this.activateBtn.style.color = '#93ffd2';
        this.activateBtn.style.borderColor = '#13fd87';
        console.log('🎯 Kontroler wyłączony');
    }

    createMarker() {
        if (this.marker) this.removeMarker();
        
        const geometry = new THREE.SphereGeometry(75000, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.marker = new THREE.Mesh(geometry, material);
        this.marker.position.set(this.position.x, this.position.y, this.position.z);
        
        // Dodaj do MarkerManager jako persistent
        this.markerId = window.markerManager.addMarker(
            this.marker, 
            'controller', 
            'Punkt Kontrolny', 
            true // persistent
        );
    }

    removeMarker() {
        if (this.markerId) {
            window.markerManager.removeMarker(this.markerId);
            this.markerId = null;
            this.marker = null;
        }
    }

    updateMarkerPosition() {
        if (this.marker) {
            this.marker.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    updateCoordinateInputs() {
        this.coordInputs.x.value = this.position.x.toFixed(2);
        this.coordInputs.y.value = this.position.y.toFixed(2);
        this.coordInputs.z.value = this.position.z.toFixed(2);
    }

    updatePositionFromInput(axis, value) {
        this.position[axis] = value;
        this.updateMarkerPosition();
        
        if (this.cameraMode === 'center') {
            this.centerCameraOnMarker();
        }
    }

    setSpeed(index) {
        this.currentSpeedIndex = index;
    }

    updateSpeedButtons() {
        Array.from(this.speedButtons).forEach((btn, index) => {
            if (index === this.currentSpeedIndex) {
                btn.style.background = '#18ffcc22';
                btn.style.color = '#fff';
            } else {
                btn.style.background = '#13281b';
                btn.style.color = '#aaffaa';
            }
        });
    }

    setCameraMode(mode) {
        this.cameraMode = mode;
        
        if (mode === 'center') {
            this.centerCameraOnMarker();
        }
    }

    updateCameraButtons() {
        this.cameraButtons.forEach((btn, index) => {
            const modes = ['follow', 'free', 'center'];
            if (modes[index] === this.cameraMode) {
                btn.style.background = '#18ffcc22';
                btn.style.color = '#fff';
            } else {
                btn.style.background = '#13281b';
                btn.style.color = '#aaffaa';
            }
        });
    }

    centerCameraOnMarker() {
        if (this.marker && typeof animateCameraTo === 'function') {
            animateCameraTo(this.position, 1.0);
        }
    }

    resetPosition() {
        this.position = { x: 0, y: 0, z: 0 };
        this.updateMarkerPosition();
        this.updateCoordinateInputs();
        
        if (this.cameraMode === 'center') {
            this.centerCameraOnMarker();
        }
    }

    pasteGPSFromClipboard() {
        // Sprawdź czy przeglądarka obsługuje Clipboard API
        if (!navigator.clipboard) {
            this.showNotification('❌ Przeglądarka nie obsługuje odczytu schowka');
            return;
        }

        navigator.clipboard.readText().then(clipboardText => {
            console.log('📥 Odczytano ze schowka:', clipboardText);
            
            // Regex do parsowania formatu GPS Space Engineers
            // Format: GPS:nazwa:x:y:z:#kolor:
            const gpsRegex = /GPS:([^:]+):(-?\d+\.?\d*):(-?\d+\.?\d*):(-?\d+\.?\d*):/;
            const match = clipboardText.match(gpsRegex);
            
            if (match) {
                const [, name, x, y, z] = match;
                
                // Konwertuj koordynaty na liczby
                const newX = parseFloat(x);
                const newY = parseFloat(y);
                const newZ = parseFloat(z);
                
                // Sprawdź czy koordynaty są prawidłowe
                if (isNaN(newX) || isNaN(newY) || isNaN(newZ)) {
                    this.showNotification('❌ Nieprawidłowe koordynaty GPS');
                    return;
                }
                
                // Ustaw nowe koordynaty
                this.position.x = newX;
                this.position.y = newY;
                this.position.z = newZ;
                
                // Aktualizuj UI i marker
                this.updateCoordinateInputs();
                this.updateMarkerPosition();
                
                // Jeśli tryb center jest aktywny, przenieś kamerę
                if (this.cameraMode === 'center') {
                    this.centerCameraOnMarker();
                }
                
                // Pokaż powiadomienie z nazwą punktu
                const cleanName = name.trim();
                this.showNotification(`📥 Załadowano GPS: ${cleanName}`);
                console.log(`🎯 Załadowano koordynaty GPS: ${cleanName} (${newX}, ${newY}, ${newZ})`);
                
            } else {
                // Sprawdź czy to może być inny format GPS
                if (clipboardText.includes('GPS:')) {
                    this.showNotification('❌ Nieprawidłowy format GPS Space Engineers');
                    console.log('❌ Nie udało się sparsować GPS:', clipboardText);
                } else {
                    this.showNotification('❌ Schowek nie zawiera danych GPS');
                }
            }
            
        }).catch(err => {
            console.error('❌ Błąd odczytu schowka:', err);
            this.showNotification('❌ Błąd odczytu schowka');
        });
    }

    copyGPSCoordinates() {
        const gpsString = `GPS:Punkt Kontrolny:${this.position.x.toFixed(2)}:${this.position.y.toFixed(2)}:${this.position.z.toFixed(2)}:#FFFFFF:`;
        
        // Kopiuj do schowka
        if (navigator.clipboard) {
            navigator.clipboard.writeText(gpsString).then(() => {
                console.log('📋 Koordynaty GPS skopiowane do schowka:', gpsString);
                // Pokaż krótkie powiadomienie
                this.showNotification('📋 Skopiowano GPS do schowka!');
            }).catch(err => {
                console.error('❌ Błąd kopiowania do schowka:', err);
                this.fallbackCopyToClipboard(gpsString);
            });
        } else {
            this.fallbackCopyToClipboard(gpsString);
        }
    }

    fallbackCopyToClipboard(text) {
        // Fallback dla starszych przeglądarek
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
            console.log('📋 Koordynaty GPS skopiowane (fallback):', text);
            this.showNotification('📋 Skopiowano GPS do schowka!');
        } catch (err) {
            console.error('❌ Błąd kopiowania (fallback):', err);
            this.showNotification('❌ Błąd kopiowania do schowka');
        }
        
        document.body.removeChild(textArea);
    }

    showNotification(message) {
        // Utwórz tymczasowe powiadomienie
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: rgba(0,255,0,0.9);
            color: #000;
            padding: 8px 16px;
            border-radius: 4px;
            font-family: 'Fira Mono', monospace;
            font-size: 0.9em;
            z-index: 9999;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Dodaj animację CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(100%); }
                20% { opacity: 1; transform: translateX(0); }
                80% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Usuń po 2 sekundach
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2000);
    }
}

// Utwórz globalną instancję
window.coordinateController = new CoordinateController();

console.log('✅ CoordinateController załadowany');
