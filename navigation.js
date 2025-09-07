// navigation.js

function getGravityRange(obj) {
    // Check if custom gravity range is defined in CSV (in km, convert to meters)
    if (obj.gravityRange && !isNaN(parseFloat(obj.gravityRange))) {
        return parseFloat(obj.gravityRange) * 1000; // Convert km to meters
    }
    
    // Default gravity ranges based on Space Engineers specifications
    if (obj.objectType === 'planet') return 40000; // 40 km
    if (obj.objectType === 'moon') return 20000;   // 20 km
    if (obj.objectType === 'danger_zone') return 0; // Danger zones don't have gravity, only visual boundary
    return 10000; // 10 km for other objects
}

window.getGravityRange = getGravityRange;