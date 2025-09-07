// markerManager.js - Centralny system zarządzania markerami

class MarkerManager {
    constructor() {
        this.markers = [];
        this.maxMarkers = 10; // Limit markerów
        this.markerIdCounter = 0;
    }

    // Dodaj marker do systemu
    addMarker(mesh, type, name = '', persistent = false) {
        const markerId = ++this.markerIdCounter;
        const marker = {
            id: markerId,
            mesh: mesh,
            type: type, // 'jump', 'route', 'controller', 'custom'
            name: name,
            persistent: persistent, // Czy marker przetrwa globalne czyszczenie
            createdAt: Date.now()
        };

        // Dodaj marker do sceny jeśli nie jest już dodany
        if (!scene.children.includes(mesh)) {
            scene.add(mesh);
        }

        // Oznacz mesh jako zarządzany przez MarkerManager
        mesh.userData.markerId = markerId;
        mesh.userData.markerType = type;

        this.markers.push(marker);

        // Usuń najstarsze markery jeśli przekroczono limit (oprócz persistent)
        this.enforceLimit();

        console.log(`📍 Dodano marker: ${name || type} (ID: ${markerId})`);
        return markerId;
    }

    // Usuń marker po ID
    removeMarker(markerId) {
        const markerIndex = this.markers.findIndex(m => m.id === markerId);
        if (markerIndex === -1) return false;

        const marker = this.markers[markerIndex];
        
        // Usuń z sceny
        if (scene.children.includes(marker.mesh)) {
            scene.remove(marker.mesh);
        }

        // Zwolnij zasoby
        if (marker.mesh.geometry) marker.mesh.geometry.dispose();
        if (marker.mesh.material) {
            if (Array.isArray(marker.mesh.material)) {
                marker.mesh.material.forEach(mat => mat.dispose());
            } else {
                marker.mesh.material.dispose();
            }
        }

        // Usuń z listy
        this.markers.splice(markerIndex, 1);
        
        console.log(`🗑️ Usunięto marker: ${marker.name || marker.type} (ID: ${markerId})`);
        return true;
    }

    // Usuń markery według typu
    removeMarkersByType(type) {
        const markersToRemove = this.markers.filter(m => m.type === type && !m.persistent);
        markersToRemove.forEach(marker => this.removeMarker(marker.id));
        return markersToRemove.length;
    }

    // Wyczyść wszystkie markery (oprócz persistent)
    clearAllMarkers() {
        const markersToRemove = this.markers.filter(m => !m.persistent);
        markersToRemove.forEach(marker => this.removeMarker(marker.id));
        console.log(`🧹 Wyczyszczono ${markersToRemove.length} markerów`);
        return markersToRemove.length;
    }

    // Wyczyść wszystkie markery (włącznie z persistent) - tylko dla specjalnych przypadków
    clearAllMarkersForce() {
        const count = this.markers.length;
        [...this.markers].forEach(marker => this.removeMarker(marker.id));
        console.log(`💥 Wymuszone wyczyszczenie ${count} markerów`);
        return count;
    }

    // Pobierz markery według typu
    getMarkersByType(type) {
        return this.markers.filter(m => m.type === type);
    }

    // Pobierz marker po ID
    getMarkerById(markerId) {
        return this.markers.find(m => m.id === markerId);
    }

    // Pobierz wszystkie markery
    getAllMarkers() {
        return [...this.markers];
    }

    // Wymuszenie limitu markerów
    enforceLimit() {
        const nonPersistentMarkers = this.markers.filter(m => !m.persistent);
        if (nonPersistentMarkers.length > this.maxMarkers) {
            // Usuń najstarsze markery
            const toRemove = nonPersistentMarkers
                .sort((a, b) => a.createdAt - b.createdAt)
                .slice(0, nonPersistentMarkers.length - this.maxMarkers);
            
            toRemove.forEach(marker => this.removeMarker(marker.id));
        }
    }

    // Aktualizuj animacje markerów
    updateAnimations() {
        const time = Date.now() * 0.001;
        
        this.markers.forEach(marker => {
            const mesh = marker.mesh;
            
            // Animacja pulsowania dla różnych typów markerów
            switch (marker.type) {
                case 'jump':
                    // Żółte markery - delikatne pulsowanie
                    mesh.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
                    if (mesh.material.opacity !== undefined) {
                        mesh.material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
                    }
                    break;
                    
                case 'controller':
                    // Cyjan marker - intensywne pulsowanie
                    mesh.scale.setScalar(1 + Math.sin(time * 4) * 0.3);
                    if (mesh.material.opacity !== undefined) {
                        mesh.material.opacity = 0.7 + Math.sin(time * 4) * 0.3;
                    }
                    break;
                    
                case 'route':
                    // Złote markery tras - lekkie, subtelne pulsowanie
                    const pulseScale = 1 + Math.sin(time * 2) * 0.15; // Delikatne pulsowanie rozmiaru (15%)
                    const pulseOpacity = 0.7 + Math.sin(time * 2) * 0.2; // Subtelne pulsowanie przezroczystości
                    
                    mesh.scale.setScalar(pulseScale);
                    if (mesh.material.opacity !== undefined) {
                        mesh.material.opacity = pulseOpacity;
                    }
                    
                    // Delikatny złoty blask
                    if (mesh.material.emissive !== undefined) {
                        const glowIntensity = 0.1 + Math.sin(time * 2) * 0.08; // Subtelny blask
                        mesh.material.emissive.setHex(0x443300); // Delikatny złoty blask
                        mesh.material.emissiveIntensity = glowIntensity;
                    }
                    break;
            }
        });
    }

    // Pobierz statystyki
    getStats() {
        const stats = {
            total: this.markers.length,
            byType: {},
            persistent: this.markers.filter(m => m.persistent).length
        };

        this.markers.forEach(marker => {
            stats.byType[marker.type] = (stats.byType[marker.type] || 0) + 1;
        });

        return stats;
    }
}

// Utwórz globalną instancję
window.markerManager = new MarkerManager();

// Dodaj aktualizację animacji do głównej pętli animacji
const originalAnimate = window.animate;
if (originalAnimate) {
    window.animate = function() {
        originalAnimate();
        if (window.markerManager) {
            window.markerManager.updateAnimations();
        }
    };
}

console.log('✅ MarkerManager zainicjalizowany');
