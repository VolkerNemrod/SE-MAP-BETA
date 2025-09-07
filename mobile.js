// mobile.js - Mobile touch controls and optimizations for SE-MAP

let isMobile = false;
let touchState = {
    isTouching: false,
    touchCount: 0,
    lastTouchDistance: 0,
    lastTouchCenter: { x: 0, y: 0 },
    gestureStartDistance: 0,
    gestureStartCenter: { x: 0, y: 0 },
    panStartTime: 0,
    lastTapTime: 0,
    tapCount: 0
};

// Initialize mobile functionality
function initializeMobile() {
    isMobile = detectMobile();
    
    if (isMobile) {
        setupMobileLayout();
        setupTouchControls();
        setupMobilePanels();
        setTimeout(showMobileHints, 1000);
        optimizeForMobile();
    }
}

// Detect if device is mobile
function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768) ||
           ('ontouchstart' in window);
}

// Setup mobile-specific layout modifications
function setupMobileLayout() {
    const topBar = document.getElementById('top-bar');
    
    // Create mobile navigation row
    const navRow = document.createElement('div');
    navRow.className = 'mobile-nav-row';
    
    // Move controls to mobile row
    const dropdown = document.getElementById('object-dropdown');
    const coordsInput = document.getElementById('coords-input');
    const jumpBtn = document.getElementById('jump-btn');
    
    navRow.appendChild(dropdown);
    navRow.appendChild(coordsInput);
    navRow.appendChild(jumpBtn);
    
    topBar.appendChild(navRow);
    
    // Wait for route planning to be initialized, then modify for mobile
    setTimeout(() => {
        const routeSection = document.getElementById('route-section');
        if (routeSection) {
            setupMobileRouteSection(routeSection);
        }
    }, 100);
}

// Setup mobile route section layout
function setupMobileRouteSection(routeSection) {
    // Don't reorganize the DOM structure - just add mobile CSS classes
    // This preserves the autocomplete functionality
    
    const startInput = document.getElementById('route-start');
    const endInput = document.getElementById('route-end');
    const calculateBtn = document.getElementById('calculate-route-btn');
    const clearBtn = document.getElementById('clear-route-btn');
    
    if (!startInput || !endInput || !calculateBtn || !clearBtn) {
        console.log('Route inputs not ready yet, retrying...');
        setTimeout(() => setupMobileRouteSection(routeSection), 200);
        return;
    }
    
    // Find and preserve autocomplete wrappers
    const startWrapper = startInput.parentElement;
    const endWrapper = endInput.parentElement;
    
    // Add mobile classes to wrappers if they exist
    if (startWrapper && startWrapper.style.position === 'relative') {
        startWrapper.style.flex = '1';
        startWrapper.style.minWidth = '120px';
    }
    
    if (endWrapper && endWrapper.style.position === 'relative') {
        endWrapper.style.flex = '1';
        endWrapper.style.minWidth = '120px';
    }
    
    // Add mobile-friendly styling without breaking the DOM structure
    routeSection.style.flexWrap = 'wrap';
    routeSection.style.gap = '8px';
    
    // Group inputs and buttons visually with CSS
    const allElements = Array.from(routeSection.children);
    allElements.forEach((el, index) => {
        if (index === 0) { // Label
            el.style.width = '100%';
            el.style.marginBottom = '4px';
        } else if (el.tagName === 'DIV' && el.style.position === 'relative') { // Autocomplete wrappers
            el.style.flex = '1';
            el.style.minWidth = '120px';
        } else if (el.tagName === 'INPUT') { // Direct inputs
            el.style.flex = '1';
            el.style.minWidth = '120px';
        } else if (el.tagName === 'BUTTON') { // Buttons
            el.style.flexShrink = '0';
        }
    });
    
    // Ensure clear button works on mobile
    clearBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof clearRoute === 'function') {
            clearRoute();
        }
    }, { passive: false });
    
    // Also handle other buttons for mobile
    calculateBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    }, { passive: false });
}

// Setup touch controls for 3D navigation
function setupTouchControls() {
    const canvas = renderer.domElement;
    
    // Remove existing mouse events for mobile
    canvas.style.touchAction = 'none';
    
    // Touch start
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    // Touch move
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Touch end
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent context menu on long press
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Handle touch start events
function handleTouchStart(event) {
    event.preventDefault();
    
    const touches = event.touches;
    touchState.touchCount = touches.length;
    touchState.isTouching = true;
    touchState.panStartTime = Date.now();
    
    if (touches.length === 1) {
        // Single touch - rotation or tap
        const touch = touches[0];
        touchState.lastTouchCenter = { x: touch.clientX, y: touch.clientY };
        
        // Check for double tap
        const now = Date.now();
        if (now - touchState.lastTapTime < 300) {
            touchState.tapCount++;
            if (touchState.tapCount === 2) {
                handleDoubleTap(touch);
                touchState.tapCount = 0;
            }
        } else {
            touchState.tapCount = 1;
        }
        touchState.lastTapTime = now;
        
    } else if (touches.length === 2) {
        // Two fingers - pinch zoom or pan
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        touchState.gestureStartDistance = getTouchDistance(touch1, touch2);
        touchState.gestureStartCenter = getTouchCenter(touch1, touch2);
        touchState.lastTouchDistance = touchState.gestureStartDistance;
        touchState.lastTouchCenter = touchState.gestureStartCenter;
    }
    
    // Visual feedback
    if (touches.length === 1) {
        showTouchFeedback(touches[0]);
    }
}

// Handle touch move events
function handleTouchMove(event) {
    event.preventDefault();
    
    if (!touchState.isTouching) return;
    
    const touches = event.touches;
    
    if (touches.length === 1 && touchState.touchCount === 1) {
        // Single finger rotation
        const touch = touches[0];
        const deltaX = touch.clientX - touchState.lastTouchCenter.x;
        const deltaY = touch.clientY - touchState.lastTouchCenter.y;
        
        // Rotate camera
        if (window.spherical) {
            window.spherical.theta -= deltaX * 0.01;
            window.spherical.phi += deltaY * 0.01;
            window.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, window.spherical.phi));
            
            window.offset.setFromSpherical(window.spherical);
            camera.position.copy(window.target).add(window.offset);
            camera.lookAt(window.target);
        }
        
        touchState.lastTouchCenter = { x: touch.clientX, y: touch.clientY };
        
    } else if (touches.length === 2) {
        // Two finger gestures
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        const currentDistance = getTouchDistance(touch1, touch2);
        const currentCenter = getTouchCenter(touch1, touch2);
        
        // Pinch to zoom
        const scaleChange = currentDistance / touchState.lastTouchDistance;
        if (Math.abs(scaleChange - 1) > 0.01) {
            if (window.spherical) {
                if (scaleChange > 1) {
                    window.spherical.radius *= 0.95; // Zoom in
                } else {
                    window.spherical.radius *= 1.05; // Zoom out
                }
                
                const minDistance = 1000; // Zmniejszono z 50km do 1km dla lepszego przybliżania
                const maxDistance = 80000000;
                window.spherical.radius = Math.max(minDistance, Math.min(maxDistance, window.spherical.radius));
                
                window.offset.setFromSpherical(window.spherical);
                camera.position.copy(window.target).add(window.offset);
                camera.lookAt(window.target);
            }
        }
        
        // Two finger pan
        const centerDeltaX = currentCenter.x - touchState.lastTouchCenter.x;
        const centerDeltaY = currentCenter.y - touchState.lastTouchCenter.y;
        
        if (Math.abs(centerDeltaX) > 15 || Math.abs(centerDeltaY) > 15) {
            const distance = camera.position.distanceTo(window.target);
            const basePanSpeed = distance * 0.0002; // Much lower multiplier
            const minPanSpeed = 500; // Lower minimum speed
            const panSpeed = Math.max(minPanSpeed, basePanSpeed);
            
            const panLeft = new THREE.Vector3();
            const panUp = new THREE.Vector3();
            panLeft.setFromMatrixColumn(camera.matrix, 0);
            panUp.setFromMatrixColumn(camera.matrix, 1);
            
            panLeft.multiplyScalar(-centerDeltaX * panSpeed * 0.3); // Additional damping
            panUp.multiplyScalar(centerDeltaY * panSpeed * 0.3); // Additional damping
            
            camera.position.add(panLeft).add(panUp);
            window.target.add(panLeft).add(panUp);
            
            if (typeof syncCameraSpherical === 'function') {
                syncCameraSpherical();
            }
        }
        
        touchState.lastTouchDistance = currentDistance;
        touchState.lastTouchCenter = currentCenter;
    }
}

// Handle touch end events
function handleTouchEnd(event) {
    event.preventDefault();
    
    const touches = event.touches;
    
    if (touches.length === 0) {
        touchState.isTouching = false;
        touchState.touchCount = 0;
        
        // Handle tap (short touch without movement)
        const touchDuration = Date.now() - touchState.panStartTime;
        if (touchDuration < 200 && touchState.tapCount === 1) {
            setTimeout(() => {
                if (touchState.tapCount === 1) {
                    handleSingleTap(event.changedTouches[0]);
                    touchState.tapCount = 0;
                }
            }, 250);
        }
    } else {
        touchState.touchCount = touches.length;
    }
}

// Handle single tap - object selection
function handleSingleTap(touch) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    
    const mouseVec = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(stars);
    
    // Remove previous highlights
    scene.children = scene.children.filter(obj => !obj.userData || !obj.userData._isHighlight);
    
    if (intersects.length > 0) {
        // Find the best object to select
        let selectedObject = null;
        for (let i = 0; i < intersects.length; i++) {
            const candidate = intersects[i].object;
            if (candidate.userData.objectType !== 'danger_zone') {
                selectedObject = candidate;
                break;
            }
        }
        if (!selectedObject) {
            selectedObject = intersects[0].object;
        }
        
        const hit = selectedObject;
        const objectRadius = (hit.userData.diameter * 1000) / 2;
        const gravityRadius = (typeof getGravityRange === 'function' ? getGravityRange(hit.userData) : 40000);
        const highlightRadius = objectRadius + gravityRadius;
        const highlightGeom = new THREE.SphereGeometry(highlightRadius, 32, 32);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: hit.userData.color, 
            transparent: true, 
            opacity: 0.25, 
            wireframe: true 
        });
        const highlight = new THREE.Mesh(highlightGeom, highlightMat);
        highlight.position.copy(hit.position);
        highlight.userData._isHighlight = true;
        scene.add(highlight);
        
        if (typeof showObjectInfo === 'function') {
            showObjectInfo(hit.userData);
            showMobilePanel();
        }
    } else {
        if (typeof clearObjectInfo === 'function') {
            clearObjectInfo();
            hideMobilePanel();
        }
    }
}

// Handle double tap - jump to location
function handleDoubleTap(touch) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    
    const mouseVec = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(stars);
    
    if (intersects.length > 0) {
        const hit = intersects[0].object;
        const targetPos = { x: hit.position.x, y: hit.position.y, z: hit.position.z };
        
        if (typeof animateCameraTo === 'function') {
            animateCameraTo(targetPos);
        }
    }
}

// Setup mobile panels with slide-up functionality
function setupMobilePanels() {
    const infoPanel = document.getElementById('side-info-panel');
    
    // Create mobile panel header
    const header = document.createElement('div');
    header.className = 'mobile-panel-header';
    
    const title = document.createElement('span');
    title.className = 'mobile-panel-title';
    title.textContent = 'Informacje o obiekcie';
    
    const toggle = document.createElement('span');
    toggle.className = 'mobile-panel-toggle';
    toggle.innerHTML = '▲';
    
    header.appendChild(title);
    header.appendChild(toggle);
    
    // Insert header at the beginning
    infoPanel.insertBefore(header, infoPanel.firstChild);
    
    // Add header click handler
    header.addEventListener('click', toggleMobilePanel);
    
    // Initially hide panel
    infoPanel.classList.add('mobile-hidden');
}

// Show mobile panel
function showMobilePanel() {
    const panel = document.getElementById('side-info-panel');
    panel.style.display = 'block';
    panel.classList.remove('mobile-hidden');
    panel.classList.add('mobile-visible');
    
    const toggle = panel.querySelector('.mobile-panel-toggle');
    if (toggle) {
        toggle.classList.add('expanded');
    }
}

// Hide mobile panel
function hideMobilePanel() {
    const panel = document.getElementById('side-info-panel');
    panel.classList.remove('mobile-visible');
    panel.classList.add('mobile-hidden');
    
    const toggle = panel.querySelector('.mobile-panel-toggle');
    if (toggle) {
        toggle.classList.remove('expanded');
    }
}

// Toggle mobile panel visibility
function toggleMobilePanel() {
    const panel = document.getElementById('side-info-panel');
    
    if (panel.classList.contains('mobile-visible')) {
        hideMobilePanel();
    } else {
        showMobilePanel();
    }
}

// Show mobile control hints
function showMobileHints() {
    const hint = document.createElement('div');
    hint.className = 'mobile-controls-hint';
    hint.innerHTML = `
        🎯 Dotknij obiekt aby zobaczyć info<br>
        👆 1 palec = obracanie<br>
        ✌️ 2 palce = zoom (ściśnij/rozciągnij) + przesuwanie (przesuń jednocześnie)<br>
        👆👆 Podwójne dotknięcie = skok do obiektu<br>
        <small style="color: #9af;">Dotknij aby zamknąć tę podpowiedź</small>
    `;
    
    document.body.appendChild(hint);
    
    // Allow manual dismissal
    hint.addEventListener('click', () => {
        if (hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }
    });
    
    // Remove hint after longer time
    setTimeout(() => {
        if (hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }
    }, 12000); // 12 seconds instead of 5
}

// Show touch feedback animation
function showTouchFeedback(touch) {
    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback';
    feedback.style.left = (touch.clientX - 30) + 'px';
    feedback.style.top = (touch.clientY - 30) + 'px';
    
    document.body.appendChild(feedback);
    
    // Remove after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 600);
}

// Optimize performance for mobile
function optimizeForMobile() {
    // Reduce rendering quality slightly for better performance
    if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    // Optimize controls for touch
    const canvas = renderer.domElement;
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.mozUserSelect = 'none';
}

// Utility functions
function getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touch1, touch2) {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
}

// Handle orientation change
function handleOrientationChange() {
    setTimeout(() => {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }, 100);
}

// Event listeners
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// Export functions to global scope
window.initializeMobile = initializeMobile;
window.detectMobile = detectMobile;
window.showMobilePanel = showMobilePanel;
window.hideMobilePanel = hideMobilePanel;
