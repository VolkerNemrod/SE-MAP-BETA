// helpers.js

// Formatowanie dużych liczb z separatorami tysięcy (dla czytelności w UI)
function formatNumber(n) {
    return Number(n).toLocaleString('pl-PL');
}

// Zaokrąglanie do 2 miejsc po przecinku
function round2(x) {
    return Math.round((Number(x) + Number.EPSILON) * 100) / 100;
}

// Zamiana liczby lub hex na string koloru "#rrggbb"
function colorToHexString(color) {
    return "#" + color.toString(16).padStart(6, '0');
}

// Przeliczanie metrów na kilometry z formatowaniem
function metersToKm(m) {
    return (Number(m) / 1000).toLocaleString('pl-PL') + " km";
}

// Szybka walidacja czy dane pole to liczba
function isNumber(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}

// Zamiana tekstu na liczbę z kropką jako separator dziesiętny
function parseNumber(val) {
    return parseFloat((val || "").replace(",", "."));
}

// Export functions to global scope
window.formatNumber = formatNumber;
window.round2 = round2;
window.colorToHexString = colorToHexString;
window.metersToKm = metersToKm;
window.isNumber = isNumber;
window.parseNumber = parseNumber;