// userDataUI.js
// Interfejs użytkownika do zarządzania lokalnymi danymi

class UserDataUI {
    constructor() {
        this.isVisible = false;
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        // Główny panel
        const panel = document.createElement('div');
        panel.id = 'user-data-panel';
        panel.className = 'user-data-panel hidden';
        this.updatePanelContent(panel);
        
        document.body.appendChild(panel);

        // Przycisk jest już w HTML, tylko sprawdzamy czy istnieje
        const openButton = document.getElementById('open-user-data');
        if (openButton) {
            console.log('Przycisk "Moje dane" znaleziony w HTML');
        } else {
            console.error('Przycisk "Moje dane" nie został znaleziony w HTML');
        }
    }

    bindEvents() {
        // Otwieranie/zamykanie panelu
        const openButton = document.getElementById('open-user-data');
        if (openButton) {
            console.log('✅ Przycisk "Moje dane" znaleziony, dodawanie event listenera...');
            
            // Usuń poprzednie event listenery jeśli istnieją
            openButton.removeEventListener('click', this.handleButtonClick);
            
            // Dodaj nowy event listener
            this.handleButtonClick = (e) => {
                console.log('🖱️ Przycisk "Moje dane" został kliknięty!');
                e.preventDefault();
                e.stopPropagation();
                this.togglePanel();
            };
            
            openButton.addEventListener('click', this.handleButtonClick);
            
            // Dodaj dodatkowe style dla pewności
            openButton.style.pointerEvents = 'auto';
            openButton.style.zIndex = '1000';
            openButton.style.position = 'relative';
            openButton.style.cursor = 'pointer';
            
            console.log('✅ Event listener dodany do przycisku "Moje dane"');
        } else {
            console.error('❌ Przycisk "Moje dane" nie został znaleziony w DOM!');
            // Spróbuj ponownie za chwilę
            setTimeout(() => {
                console.log('🔄 Ponowna próba znalezienia przycisku "Moje dane"...');
                this.bindEvents();
            }, 1000);
            return;
        }

        document.getElementById('close-user-data').addEventListener('click', () => {
            this.hidePanel();
        });

        // Upload pliku
        document.getElementById('csv-file-input').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Przyciski zarządzania
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshDataDisplay();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // Zamykanie panelu po kliknięciu poza nim
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('user-data-panel');
            const openButton = document.getElementById('open-user-data');
            
            if (this.isVisible && 
                !panel.contains(e.target) && 
                !openButton.contains(e.target)) {
                this.hidePanel();
            }
        });

        // Nasłuchuj zmiany języka
        window.addEventListener('languageChanged', () => {
            this.updateLanguage();
        });
    }

    updateLanguage() {
        const panel = document.getElementById('user-data-panel');
        if (panel) {
            this.updatePanelContent(panel);
            this.bindEvents(); // Ponownie podłącz event listenery
            this.refreshDataDisplay(); // Odśwież wyświetlane dane
        }
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        const panel = document.getElementById('user-data-panel');
        panel.classList.remove('hidden');
        this.isVisible = true;
        this.refreshDataDisplay();
    }

    hidePanel() {
        const panel = document.getElementById('user-data-panel');
        panel.classList.add('hidden');
        this.isVisible = false;
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusDiv = document.getElementById('upload-status');
        const t = window.t || ((key) => key);
        statusDiv.innerHTML = `<div class="loading">${t('userData.upload.loading')}</div>`;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target.result;
            const result = window.localDataManager.addCSVData(csvText, file.name);
            
            if (result.success) {
                statusDiv.innerHTML = `
                    <div class="success">
                        ${t('userData.upload.success', { count: result.count, filename: file.name })}
                    </div>
                `;
                this.refreshDataDisplay();
                
                // Odśwież mapę
                if (window.refreshMapWithLocalData) {
                    window.refreshMapWithLocalData();
                }
            } else {
                statusDiv.innerHTML = `
                    <div class="error">
                        ${t('userData.upload.error', { error: result.error })}
                    </div>
                `;
            }
        };

        reader.onerror = () => {
            statusDiv.innerHTML = `<div class="error">${t('userData.upload.fileError')}</div>`;
        };

        reader.readAsText(file, 'UTF-8');
        
        // Wyczyść input
        event.target.value = '';
    }

    refreshDataDisplay() {
        const localData = window.localDataManager.getLocalData();
        const sourceFiles = window.localDataManager.getSourceFiles();
        
        // Aktualizuj licznik
        const countElement = document.getElementById('data-count');
        if (localData.length === 0) {
            countElement.textContent = 'Brak lokalnych danych';
        } else {
            countElement.textContent = `Łącznie: ${localData.length} obiektów z ${sourceFiles.length} plików`;
        }

        // Aktualizuj listę plików
        const filesList = document.getElementById('files-list');
        if (sourceFiles.length === 0) {
            filesList.innerHTML = '<div class="no-files">Nie wgrano jeszcze żadnych plików</div>';
        } else {
            filesList.innerHTML = sourceFiles.map(file => `
                <div class="file-item">
                    <div class="file-info">
                        <strong>${file.name}</strong>
                        <span class="file-stats">${file.count} obiektów</span>
                        <span class="file-date">${new Date(file.addedDate).toLocaleString('pl-PL')}</span>
                    </div>
                    <button class="remove-file-btn" data-filename="${file.name}">🗑️</button>
                </div>
            `).join('');

            // Dodaj event listenery do przycisków usuwania
            filesList.querySelectorAll('.remove-file-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filename = e.target.dataset.filename;
                    this.removeFile(filename);
                });
            });
        }

        // Aktualizuj stan przycisków
        const exportBtn = document.getElementById('export-data');
        const clearBtn = document.getElementById('clear-all-data');
        
        if (localData.length === 0) {
            exportBtn.disabled = true;
            clearBtn.disabled = true;
        } else {
            exportBtn.disabled = false;
            clearBtn.disabled = false;
        }
    }

    removeFile(filename) {
        if (confirm(`Czy na pewno chcesz usunąć wszystkie dane z pliku "${filename}"?`)) {
            const removedCount = window.localDataManager.removeDataByFile(filename);
            
            const statusDiv = document.getElementById('upload-status');
            statusDiv.innerHTML = `
                <div class="success">
                    ✅ Usunięto ${removedCount} obiektów z pliku "${filename}"
                </div>
            `;
            
            this.refreshDataDisplay();
            
            // Odśwież mapę
            if (window.refreshMapWithLocalData) {
                window.refreshMapWithLocalData();
            }
        }
    }

    exportData() {
        const csvData = window.localDataManager.exportToCSV();
        if (!csvData) {
            alert('Brak danych do eksportu');
            return;
        }

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moje_dane_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const statusDiv = document.getElementById('upload-status');
        statusDiv.innerHTML = '<div class="success">✅ Dane zostały wyeksportowane</div>';
    }

    clearAllData() {
        if (confirm('Czy na pewno chcesz usunąć wszystkie lokalne dane? Ta operacja jest nieodwracalna.')) {
            window.localDataManager.clearAllData();
            
            const statusDiv = document.getElementById('upload-status');
            statusDiv.innerHTML = '<div class="success">✅ Wszystkie lokalne dane zostały usunięte</div>';
            
            this.refreshDataDisplay();
            
            // Odśwież mapę
            if (window.refreshMapWithLocalData) {
                window.refreshMapWithLocalData();
            }
        }
    }

    updatePanelContent(panel) {
        const t = window.t || ((key) => key);
        
        panel.innerHTML = `
            <div class="user-data-header">
                <h3 data-i18n="userData.title">${t('userData.title')}</h3>
                <button id="close-user-data" class="close-btn" data-i18n="userData.buttons.close">${t('userData.buttons.close')}</button>
            </div>
            <div class="user-data-content">
                <div class="upload-section">
                    <h4 data-i18n="userData.sections.upload">${t('userData.sections.upload')}</h4>
                    <div class="file-input-wrapper">
                        <input type="file" id="csv-file-input" accept=".csv" />
                        <label for="csv-file-input" class="file-input-label" data-i18n="userData.buttons.selectFile">
                            ${t('userData.buttons.selectFile')}
                        </label>
                    </div>
                    <div class="upload-info">
                        <small>
                            <span data-i18n="userData.upload.requiredColumns">${t('userData.upload.requiredColumns')}</span><br>
                            <span data-i18n="userData.upload.optionalColumns">${t('userData.upload.optionalColumns')}</span><br>
                            <strong data-i18n="userData.upload.newFeature">${t('userData.upload.newFeature')}</strong>
                        </small>
                        <div style="margin-top: 10px;">
                            <strong data-i18n="userData.upload.downloadExamples">${t('userData.upload.downloadExamples')}</strong><br>
                            <a href="examples/example_user_data.csv" download style="color: #00d4ff; text-decoration: none; margin-right: 15px;" data-i18n="userData.upload.fullExample">${t('userData.upload.fullExample')}</a>
                            <a href="examples/test_se_gps.csv" download style="color: #00d4ff; text-decoration: none; margin-right: 15px;" data-i18n="userData.upload.gpsExample">${t('userData.upload.gpsExample')}</a>
                            <a href="examples/test_gps.csv" download style="color: #00d4ff; text-decoration: none;" data-i18n="userData.upload.standardExample">${t('userData.upload.standardExample')}</a>
                        </div>
                    </div>
                    <div id="upload-status" class="upload-status"></div>
                </div>
                
                <div class="data-management">
                    <h4 data-i18n="userData.sections.management">${t('userData.sections.management')}</h4>
                    <div class="data-stats">
                        <span id="data-count" data-i18n="userData.management.noData">${t('userData.management.noData')}</span>
                    </div>
                    <div id="files-list" class="files-list"></div>
                    <div class="management-buttons">
                        <button id="refresh-data" class="btn-secondary" data-i18n="userData.buttons.refresh">${t('userData.buttons.refresh')}</button>
                        <button id="export-data" class="btn-secondary" data-i18n="userData.buttons.export">${t('userData.buttons.export')}</button>
                        <button id="clear-all-data" class="btn-danger" data-i18n="userData.buttons.clearAll">${t('userData.buttons.clearAll')}</button>
                    </div>
                </div>
                
                <div class="help-section">
                    <h4 data-i18n="userData.sections.help">${t('userData.sections.help')}</h4>
                    <details>
                        <summary data-i18n="userData.help.csvFormat">${t('userData.help.csvFormat')}</summary>
                        <div class="help-content">
                            <p data-i18n="userData.help.csvDescription">${t('userData.help.csvDescription')}</p>
                            <ul>
                                <li><strong>name</strong> - <span data-i18n="userData.help.columns.name">${t('userData.help.columns.name')}</span></li>
                                <li><strong>x, y, z</strong> - <span data-i18n="userData.help.columns.coordinates">${t('userData.help.columns.coordinates')}</span></li>
                                <li><strong>seGPS</strong> - <span data-i18n="userData.help.columns.seGPS">${t('userData.help.columns.seGPS')}</span></li>
                                <li><strong>type</strong> - <span data-i18n="userData.help.columns.type">${t('userData.help.columns.type')}</span></li>
                                <li><strong>diameter</strong> - <span data-i18n="userData.help.columns.diameter">${t('userData.help.columns.diameter')}</span></li>
                                <li><strong>color</strong> - <span data-i18n="userData.help.columns.color">${t('userData.help.columns.color')}</span></li>
                                <li><strong>description</strong> - <span data-i18n="userData.help.columns.description">${t('userData.help.columns.description')}</span></li>
                                <li><strong>resources</strong> - <span data-i18n="userData.help.columns.resources">${t('userData.help.columns.resources')}</span></li>
                            </ul>
                            <p><strong data-i18n="userData.help.seGPSFormat">${t('userData.help.seGPSFormat')}</strong></p>
                            <code data-i18n="userData.help.seGPSExample">${t('userData.help.seGPSExample')}</code>
                            <p data-i18n="userData.help.seGPSNote">${t('userData.help.seGPSNote')}</p>
                            <p data-i18n="userData.help.examples">${t('userData.help.examples')}</p>
                            <code>name;type;x;y;z;diameter;color;description<br>
                            Moja baza;Stacja;1000;2000;3000;5000;0xFF0000;Główna baza operacyjna</code><br><br>
                            <code>name;type;seGPS;description<br>
                            Moja baza;Stacja;GPS:Moja baza:1000:2000:3000:#FF0000:5000;Baza z GPS (5km)<br>
                            Outpost;Posterunek;GPS:Outpost:5000:1000:2000:#00FF00:800;Mały posterunek (800m)</code>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }
}

// Inicjalizacja UI po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    // Dodaj małe opóźnienie, żeby upewnić się, że wszystko jest załadowane
    setTimeout(() => {
        window.userDataUI = new UserDataUI();
        console.log('UserDataUI zainicjalizowany:', window.userDataUI);
    }, 100);
});

// Backup inicjalizacja na wypadek problemów z DOMContentLoaded
window.addEventListener('load', () => {
    if (!window.userDataUI) {
        console.log('Backup inicjalizacja UserDataUI...');
        window.userDataUI = new UserDataUI();
    }
});

// Globalna funkcja inicjalizacji dla main.js
function initializeUserDataUI() {
    if (!window.userDataUI) {
        console.log('🔧 Inicjalizacja UserDataUI z main.js...');
        window.userDataUI = new UserDataUI();
    } else {
        console.log('✅ UserDataUI już zainicjalizowany');
        // Sprawdź czy przycisk działa
        const openButton = document.getElementById('open-user-data');
        if (openButton && !openButton.onclick) {
            console.log('🔄 Ponowne podłączenie event listenera...');
            window.userDataUI.bindEvents();
        }
    }
}

// Udostępnij globalnie
window.initializeUserDataUI = initializeUserDataUI;
