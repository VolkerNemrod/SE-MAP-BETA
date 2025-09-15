// scene.js

// Variables are declared in main.js

// Synchronizacja układu sferycznego kamery
function syncCameraSpherical() {
    if (!window.target || !window.spherical || !window.offset) return;
    window.offset.copy(camera.position).sub(window.target);
    window.spherical.setFromVector3(window.offset);
    const minDistance = 1000; // Zmniejszono z 50km do 1km dla lepszego przybliżania
    const maxDistance = 80000000;
    window.spherical.radius = Math.max(minDistance, Math.min(maxDistance, window.spherical.radius));
    window.offset.setFromSpherical(window.spherical);
    camera.position.copy(window.target).add(window.offset);
    camera.lookAt(window.target);
}

function setupControls() {
    // Initialize control variables
    window.target = new THREE.Vector3(0, 0, 0);
    window.spherical = new THREE.Spherical();
    window.offset = new THREE.Vector3();

    syncCameraSpherical();

    const minDistance = 1000; // Zmniejszono z 50km do 1km dla lepszego przybliżania
    const maxDistance = 80000000;

    // Mouse down event
    renderer.domElement.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseButton = event.button;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        event.preventDefault();
    });

    // Mouse move event
    renderer.domElement.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        if (mouseButton === 0) { // Left mouse button - rotate
            window.spherical.theta -= deltaMove.x * 0.01;
            window.spherical.phi += deltaMove.y * 0.01;
            window.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, window.spherical.phi));
            
            window.offset.setFromSpherical(window.spherical);
            camera.position.copy(window.target).add(window.offset);
            camera.lookAt(window.target);
        } else if (mouseButton === 2) { // Right mouse button - pan
            const distance = camera.position.distanceTo(window.target);
            const basePanSpeed = distance * 0.0005;
            const minPanSpeed = 1000;
            const panSpeed = Math.max(minPanSpeed, basePanSpeed);
            
            const panLeft = new THREE.Vector3();
            const panUp = new THREE.Vector3();
            panLeft.setFromMatrixColumn(camera.matrix, 0);
            panUp.setFromMatrixColumn(camera.matrix, 1);
            
            panLeft.multiplyScalar(-deltaMove.x * panSpeed);
            panUp.multiplyScalar(deltaMove.y * panSpeed);
            
            camera.position.add(panLeft).add(panUp);
            window.target.add(panLeft).add(panUp);
            syncCameraSpherical();
        }

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    });

    // Mouse up event
    renderer.domElement.addEventListener('mouseup', () => { 
        isMouseDown = false; 
    });

    // Mouse leave event
    renderer.domElement.addEventListener('mouseleave', () => { 
        isMouseDown = false; 
    });

    // Wheel event for zoom
    renderer.domElement.addEventListener('wheel', (event) => {
        let zoomSpeed = 0.1;
        if (event.deltaY > 0) {
            window.spherical.radius *= (1 + zoomSpeed);
        } else {
            window.spherical.radius *= (1 - zoomSpeed);
        }
        
        window.spherical.radius = Math.max(minDistance, Math.min(maxDistance, window.spherical.radius));
        window.offset.setFromSpherical(window.spherical);
        camera.position.copy(window.target).add(window.offset);
        camera.lookAt(window.target);
        
        event.preventDefault();
        event.stopPropagation();
    }, { passive: false });

    // Disable context menu
    renderer.domElement.addEventListener('contextmenu', (event) => { 
        event.preventDefault(); 
    });
}

function createStars() {
    stars = [];
    spaceEngineersData.forEach(obj => {
        let geometry, material, objMesh;
        const radius = (obj.diameter * 1000) / 2;
        
        // Debug - wypisz informacje o obiekcie
        console.log(`Tworzenie obiektu: ${obj.name}, objectType: "${obj.objectType}", isUserData: ${obj.isUserData}`);
        
        switch(obj.objectType) {
            case 'planet':
                geometry = new THREE.SphereGeometry(radius, 32, 32);
                material = new THREE.MeshBasicMaterial({ 
                    color: obj.color,
                    transparent: false
                });
                break;
            case 'moon':
                geometry = new THREE.SphereGeometry(radius, 24, 24);
                material = new THREE.MeshBasicMaterial({ 
                    color: obj.color,
                    transparent: false
                });
                break;
            case 'wormhole':
                geometry = new THREE.TorusGeometry(radius, radius * 0.3, 16, 32);
                material = new THREE.MeshBasicMaterial({ 
                    color: obj.color, 
                    transparent: true, 
                    opacity: 0.8 
                });
                break;
            case 'danger_zone':
                // For danger zones, use a larger radius to properly encompass contained objects
                // Pertam zone needs ~250km radius to contain Torvion and Phrygia
                const dangerRadius = obj.name === 'Strefa Pertam' ? 250000 : radius;
                geometry = new THREE.SphereGeometry(dangerRadius, 32, 32);
                material = new THREE.MeshBasicMaterial({ 
                    color: obj.color, 
                    transparent: true, 
                    opacity: 0.15,
                    wireframe: true 
                });
                break;
            case 'user_object':
                // Obiekty użytkownika jako sześciany wireframe z fallbackiem
                console.log(`✅ TWORZENIE SZEŚCIANU dla: ${obj.name}`);
                try {
                    geometry = new THREE.BoxGeometry(radius * 2, radius * 2, radius * 2);
                    material = new THREE.MeshBasicMaterial({ 
                        color: obj.color,
                        wireframe: true,
                        transparent: false,
                        depthTest: true,
                        depthWrite: true
                    });
                } catch (error) {
                    console.warn(`⚠️ BoxGeometry nie działa, używam wireframe sphere dla: ${obj.name}`);
                    // Fallback do wireframe sphere jeśli BoxGeometry nie działa
                    geometry = new THREE.SphereGeometry(radius, 8, 8);
                    material = new THREE.MeshBasicMaterial({ 
                        color: obj.color,
                        wireframe: true,
                        transparent: false,
                        depthTest: true,
                        depthWrite: true
                    });
                }
                break;
            case 'temp-obj':
                // Obiekty tymczasowe jako znaki wykrzyknika (!)
                console.log(`🔥 TWORZENIE WYKRZYKNIKA dla: ${obj.name}`);
                
                // Tworzenie grupy dla całego wykrzyknika
                objMesh = new THREE.Group();
                
                // Główny słupek wykrzyknika (cylinder)
                const exclamationHeight = radius * 4; // Wysokość wykrzyknika
                const exclamationWidth = radius * 0.3; // Szerokość słupka
                const stickGeometry = new THREE.CylinderGeometry(exclamationWidth, exclamationWidth, exclamationHeight, 8);
                const stickMaterial = new THREE.MeshBasicMaterial({ 
                    color: obj.color,
                    transparent: false,
                    depthTest: true,
                    depthWrite: true
                });
                const stickMesh = new THREE.Mesh(stickGeometry, stickMaterial);
                stickMesh.position.y = exclamationHeight * 0.3; // Przesuń w górę
                
                // Kropka na dole wykrzyknika (sphere)
                const dotRadius = exclamationWidth * 1.5;
                const dotGeometry = new THREE.SphereGeometry(dotRadius, 8, 8);
                const dotMaterial = new THREE.MeshBasicMaterial({ 
                    color: obj.color,
                    transparent: false,
                    depthTest: true,
                    depthWrite: true
                });
                const dotMesh = new THREE.Mesh(dotGeometry, dotMaterial);
                dotMesh.position.y = -exclamationHeight * 0.4; // Przesuń w dół
                
                // Dodaj części do grupy
                objMesh.add(stickMesh);
                objMesh.add(dotMesh);
                
                // Nie używamy geometry i material dla grup
                geometry = null;
                material = null;
                break;
            default:
                console.log(`⚠️ Nieznany objectType: "${obj.objectType}" dla ${obj.name} - używam domyślnej kuli`);
                geometry = new THREE.SphereGeometry(radius, 32, 32);
                material = new THREE.MeshBasicMaterial({ color: obj.color });
        }
        
        // Dodatkowa logika dla obiektów użytkownika (fallback)
        if (obj.isUserData === true && obj.objectType !== 'user_object') {
            console.log(`🔄 FALLBACK: Obiekt ${obj.name} ma isUserData=true ale objectType="${obj.objectType}" - zmieniam na sześcian`);
            geometry = new THREE.BoxGeometry(radius * 2, radius * 2, radius * 2);
            material = new THREE.MeshBasicMaterial({ 
                color: obj.color,
                wireframe: true,
                transparent: false,
                depthTest: true,
                depthWrite: true
            });
        }
        
        // Tworzenie obiektu - może być Mesh lub Group
        if (obj.objectType === 'temp-obj') {
            // objMesh już został utworzony jako Group w switch case dla temp-obj
            // Nie rób nic - objMesh jest już gotowy
        } else if (obj.objectType === 'user_object') {
            // objMesh już został utworzony w switch case dla user_object
            if (!objMesh) {
                objMesh = new THREE.Mesh(geometry, material);
            }
        } else {
            objMesh = new THREE.Mesh(geometry, material);
        }
        
        objMesh.position.set(obj.x, obj.y, obj.z);
        objMesh.userData = obj;
        objMesh.userData.position = { x: obj.x, y: obj.y, z: obj.z };
        
        // Oznacz obiekty użytkownika
        if (obj.isUserData) {
            objMesh.userData.isUserData = true;
        }
        
        
        // Add particle effect for wormholes
        if (obj.objectType === 'wormhole') {
            const particleGeometry = new THREE.SphereGeometry(radius * 2, 16, 16);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: obj.color, 
                transparent: true, 
                opacity: 0.2, 
                wireframe: true 
            });
            const particles = new THREE.Mesh(particleGeometry, particleMaterial);
            particles.position.copy(objMesh.position);
            scene.add(particles);
            objMesh.userData.animate = true;
        }
        
        scene.add(objMesh);
        stars.push(objMesh);
    });
}

function createAsteroidField() { 
    // Placeholder for asteroid field creation
}

function createDangerZone() { 
    // Placeholder for danger zone creation
}

function createGrid() {
    const size = 50000000;
    const divisions = 100;
    gridHelper = new THREE.GridHelper(size, divisions, 0x00ff00, 0x003300);
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);

    const axesSize = size / 2;
    const axesHelper = new THREE.AxesHelper(axesSize);
    axesHelper.position.set(0, 0, 0);
    scene.add(axesHelper);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Animate asteroids
    asteroids.forEach(asteroid => {
        if (asteroid.userData.rotationSpeed) {
            asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
            asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
            asteroid.rotation.z += asteroid.userData.rotationSpeed.z;
        }
    });
    
    // Animate wormholes
    stars.forEach(star => {
        if (star.userData.animate && star.userData.objectType === 'wormhole') {
            star.rotation.x += 0.01;
            star.rotation.y += 0.005;
            star.rotation.z += 0.008;
        }
    });
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function enableStarHighlighting() {
    renderer.domElement.addEventListener('click', function(event) {
        // Prevent camera controls from interfering with click detection
        if (isMouseDown) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const mouseVec = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVec, camera);
        const intersects = raycaster.intersectObjects(stars, true);
        
        // Remove previous highlights
        scene.children = scene.children.filter(obj => !obj.userData || !obj.userData._isHighlight);
        
        if (intersects.length > 0) {
            // Find the best object to select - prioritize user objects, then non-danger zones
            let selectedObject = null;
            let hitData = null;
            
            // Helper function to get object data (handles Groups like temp-obj)
            const getObjectData = (mesh) => {
                // Sprawdź czy mesh ma userData z danymi obiektu
                if (mesh.userData && mesh.userData.name) {
                    return { mesh: mesh, data: mesh.userData };
                }
                // Sprawdź czy parent (grupa) ma userData z danymi obiektu
                if (mesh.parent && mesh.parent.userData && mesh.parent.userData.name) {
                    return { mesh: mesh.parent, data: mesh.parent.userData };
                }
                return null;
            };
            
            // First priority: user objects and temp-obj
            for (let i = 0; i < intersects.length; i++) {
                const candidate = intersects[i].object;
                const objData = getObjectData(candidate);
                if (objData && (objData.data.isUserData || objData.data.objectType === 'user_object' || objData.data.objectType === 'temp-obj')) {
                    selectedObject = objData.mesh;
                    hitData = objData.data;
                    break;
                }
            }
            
            // Second priority: non-danger zones
            if (!selectedObject) {
                for (let i = 0; i < intersects.length; i++) {
                    const candidate = intersects[i].object;
                    const objData = getObjectData(candidate);
                    if (objData && objData.data.objectType !== 'danger_zone') {
                        selectedObject = objData.mesh;
                        hitData = objData.data;
                        break;
                    }
                }
            }
            
            // Last resort: use the first object (which could be a danger zone)
            if (!selectedObject) {
                const candidate = intersects[0].object;
                const objData = getObjectData(candidate);
                if (objData) {
                    selectedObject = objData.mesh;
                    hitData = objData.data;
                } else {
                    selectedObject = candidate;
                    hitData = candidate.userData;
                }
            }
            
            const hit = selectedObject;
            const hitUserData = hitData || hit.userData;
            const objectRadius = (hitUserData.diameter * 1000) / 2;
            
            // Oblicz zasięg grawitacji na podstawie danych z CSV lub wartości domyślnych
            let gravityRadius;
            if (hitUserData.gravityRange && hitUserData.gravityRange !== '') {
                // Użyj wartości z CSV (w kilometrach, konwertuj na metry)
                gravityRadius = parseFloat(hitUserData.gravityRange) * 1000;
            } else {
                // Wartości domyślne: 40 km dla planet, 5 km dla księżyców
                if (hitUserData.objectType === 'planet') {
                    gravityRadius = 40000; // 40 km
                } else if (hitUserData.objectType === 'moon') {
                    gravityRadius = 5000;  // 5 km
                } else {
                    gravityRadius = 40000; // domyślnie 40 km dla innych obiektów
                }
            }
            
            const highlightRadius = objectRadius + gravityRadius;
            const highlightGeom = new THREE.SphereGeometry(highlightRadius, 32, 32);
            const highlightMat = new THREE.MeshBasicMaterial({ 
                color: hitUserData.color, 
                transparent: true, 
                opacity: 0.25, 
                wireframe: true 
            });
            const highlight = new THREE.Mesh(highlightGeom, highlightMat);
            highlight.position.copy(hit.position);
            highlight.userData._isHighlight = true;
            scene.add(highlight);
            
            if (typeof showObjectInfo === 'function') {
                showObjectInfo(hitUserData);
            }
        } else {
            if (typeof clearObjectInfo === 'function') {
                clearObjectInfo();
            }
        }
    });
}

// Export functions to global scope
window.setupControls = setupControls;
window.createStars = createStars;
window.createAsteroidField = createAsteroidField;
window.createDangerZone = createDangerZone;
window.createGrid = createGrid;
window.animate = animate;
window.onWindowResize = onWindowResize;
window.enableStarHighlighting = enableStarHighlighting;
window.syncCameraSpherical = syncCameraSpherical;
