// main.js

// Variables are declared globally in HTML

window.onload = function() {
    loadSystemDataCsv('uklad.csv', function(data) {
        spaceEngineersData = data;
        // Dodaj lokalne dane użytkownika
        const localData = window.localDataManager.getLocalData();
        console.log(`🚀 INIT: Załadowano ${data.length} obiektów systemowych i ${localData.length} obiektów użytkownika`);
        
        // Debug - wypisz obiekty użytkownika
        if (localData.length > 0) {
            console.log('📋 Obiekty użytkownika:', localData.map(obj => `${obj.name} (${obj.objectType})`));
        }
        
        spaceEngineersData = spaceEngineersData.concat(localData);
        
        // Załaduj obiekty tymczasowe z temp-objekty.csv
        loadTempObjectsCsv('temp-objekty.csv', function(tempData) {
            console.log(`🔥 INIT: Załadowano ${tempData.length} obiektów tymczasowych`);
            
            // Debug - wypisz obiekty tymczasowe
            if (tempData.length > 0) {
                console.log('🔥 Obiekty tymczasowe:', tempData.map(obj => `${obj.name} (${obj.objectType})`));
            }
            
            spaceEngineersData = spaceEngineersData.concat(tempData);
            
            // WAŻNE: Ustaw dane jako globalną zmienną dla widoku 2D
            window.spaceEngineersData = spaceEngineersData;
            
            console.log(`📊 Łącznie obiektów w spaceEngineersData: ${spaceEngineersData.length}`);
            console.log(`📊 window.spaceEngineersData ustawione:`, window.spaceEngineersData.length);
            init();
        });
    });
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1000, 1e8);
    camera.position.set(10000000, 5000000, 10000000);
    window.camera = camera;

    // Sprawdź czy WebGL jest dostępne, jeśli nie użyj fallback
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        console.log('✅ WebGL renderer zainicjalizowany');
    } catch (error) {
        console.warn('⚠️ WebGL niedostępny, próbuję bez antialiasing...');
        try {
            renderer = new THREE.WebGLRenderer({ antialias: false });
        } catch (error2) {
            console.error('❌ WebGL całkowicie niedostępny:', error2);
            alert('Twoja przeglądarka nie obsługuje WebGL. Aplikacja może nie działać poprawnie.');
            // Próba z Canvas renderer jako ostatnia deska ratunku
            if (THREE.CanvasRenderer) {
                renderer = new THREE.CanvasRenderer();
                console.log('🔄 Używam Canvas renderer jako fallback');
            } else {
                throw new Error('Brak dostępnych rendererów');
            }
        }
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    createStars();
    createAsteroidField();
    createDangerZone();
    createGrid();

    setupControls();
    animate();

    fillDropdownWithObjects();
    wireJumpPanel();
    enableStarHighlighting();
    initializeRoutePlanning();
    
    // Initialize mobile functionality
    initializeMobile();
    
    // Initialize 2D view
    initView2D();
    
    // Initialize user data UI
    if (typeof initializeUserDataUI === 'function') {
        initializeUserDataUI();
    }
    
    // MarkerManager and CoordinateController are initialized automatically
    console.log('✅ Wszystkie moduły zainicjalizowane');

    window.addEventListener('resize', onWindowResize, false);
}

// Funkcja do odświeżania mapy z lokalnymi danymi i obiektami tymczasowymi
function refreshMapWithLocalData() {
    console.log('🔄 Odświeżanie mapy z lokalnymi danymi i obiektami tymczasowymi...');
    
    // Przeładuj dane z CSV i dodaj lokalne dane
    loadSystemDataCsv('uklad.csv', function(data) {
        const localData = window.localDataManager.getLocalData();
        console.log(`📊 Załadowano ${data.length} obiektów systemowych i ${localData.length} obiektów użytkownika`);
        
        spaceEngineersData = data.concat(localData);
        
        // Załaduj obiekty tymczasowe z temp-objekty.csv
        loadTempObjectsCsv('temp-objekty.csv', function(tempData) {
            console.log(`🔥 REFRESH: Załadowano ${tempData.length} obiektów tymczasowych`);
            
            spaceEngineersData = spaceEngineersData.concat(tempData);
            
            // WAŻNE: Ustaw dane jako globalną zmienną dla widoku 2D
            window.spaceEngineersData = spaceEngineersData;
            
            // Wyczyść całą scenę z obiektów (oprócz siatki i osi)
            const objectsToRemove = [];
            scene.traverse(function(child) {
                if ((child.type === 'Mesh' || child.type === 'Group') && child !== gridHelper && !child.userData._isHighlight) {
                    objectsToRemove.push(child);
                }
            });
            
            objectsToRemove.forEach(obj => {
                scene.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
                // Wyczyść również dzieci grup (dla temp-obj)
                if (obj.children) {
                    obj.children.forEach(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => mat.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                }
            });
            
            // Wyczyść tablicę stars
            stars = [];
            
            // Odtwórz wszystkie obiekty na mapie
            createStars();
            
            // Odśwież dropdown z obiektami
            fillDropdownWithObjects();
            
            // Odśwież widok 2D zawsze gdy dane się załadują
            if (window.view2D) {
                console.log('🔄 Odświeżanie widoku 2D po załadowaniu danych...');
                window.view2D.prepareObjects();
                if (window.view2D.isActive) {
                    window.view2D.render();
                    console.log('✅ Widok 2D odświeżony i wyrenderowany');
                } else {
                    console.log('✅ Widok 2D przygotowany (nieaktywny)');
                }
            } else {
                console.error('❌ window.view2D nie istnieje!');
            }
            
            console.log('✅ Mapa została odświeżona z lokalnymi danymi i obiektami tymczasowymi');
        });
    });
}

// Udostępnij funkcję globalnie
window.refreshMapWithLocalData = refreshMapWithLocalData;
