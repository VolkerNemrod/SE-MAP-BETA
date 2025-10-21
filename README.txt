SE-MAP – Space Engineers 3D Map (Web Version)
====================================================

DEMO Version: https://se-map-beta.macierz.eu/
YouTube pt1: https://youtu.be/1Dc1jhDcPYU
YouTube pt2: https://youtu.be/MGbzPPS-5Ho
Contact: se-map@macierz.eu

Interactive, three-dimensional map of a planetary system inspired by the Space Engineers universe.

Author: VolkerNemrod
License: GNU General Public License v3.0 (GPL-3.0)

Fan project. Not affiliated with, sponsored by, or endorsed by Keen Software House, the owner of Space Engineers game and related trademarks and universe. This project is non-commercial, intended solely for educational and entertainment purposes.

All materials (names, concepts, graphics, references) relating to Space Engineers are property of Keen Software House. The creator of SE-MAP does not claim any rights to them, and the project is made available solely as a tool for the fan community.

For any further use, modification, distribution, or integration with other systems, the GPL-3.0 license terms apply (see below and LICENSE file).

---

WERSJA 21.10.2025 - HISTORIA ZMIAN
===================================

NAPRAWIONE BŁĘDY:
✅ **Panel informacyjny obiektów** - Naprawiono krytyczny błąd uniemożliwiający 
   otwieranie panelu z opisami planet w widoku 3D
   - Usunięto blokadę `!important` z CSS (#side-info-panel)
   - Poprawiono zachowanie panelu przy przełączaniu między widokami 2D/3D
   - Panel jest teraz domyślnie ukryty i pokazuje się po kliknięciu na obiekt

ZMIANY TECHNICZNE:
- style.css: Usunięto `display: none !important;` i `visibility: hidden` z #side-info-panel
- view2d.js: Panel nie jest już automatycznie pokazywany przy powrocie z widoku 2D
- Zaktualizowano wersję cache-busting we wszystkich plikach JS/CSS (v=21.10.2025)

WPŁYW NA UŻYTKOWNIKA:
- Kliknięcie na planetę/księżyc/wormhole w widoku 3D prawidłowo otwiera panel z informacjami
- Przełączanie między widokami 2D i 3D działa poprawnie
- Panel informacyjny nie pojawia się niepotrzebnie

---

DESCRIPTION
===========

SE-MAP is an open-source web application that enables display and interactive 3D navigation through a fan-made planetary system created for a Space Engineers scenario. It supports searching, route planning (jump drive courses), detailed object views, danger zone handling, mobile mode, and extensive parameterization through the `uklad.csv` file.

---

FEATURES
========

CORE FEATURES:
- 3D Map - realistic presentation of planets, moons, wormholes, and danger zones
- 2D View - alternative map view with interactive zoom and panning controls
- Object search and filtering with dropdown and coordinate input
- Responsive interface with full mobile support (touch, gestures, sliding panels)
- Detailed information panel for each object
- Multilingual system with automatic browser language detection (Polish/English)

ADVANCED NAVIGATION:
- **Route Planning** with intelligent obstacle detection and safe distances
- **Route Markers** - small (1km), golden, gently pulsating markers showing START and END points
- **Collision Analysis** - system checks if route passes through planets/moons
- **Safe Distances** - automatic calculation of safety margins
- **GPS Copying** - buttons to copy START/END coordinates to clipboard in Space Engineers format
- **Data Persistence** - coordinates and selected objects don't disappear after route calculation (only after pressing red X)
- **Auto-Framing** - camera automatically centers on the route

MARKER SYSTEM:
- **MarkerManager** - central system managing all markers on the map
- **Different Marker Types**: jump (yellow), route (gold), controller (cyan), custom
- **Pulsating Animations** - each marker type has its own animation
- **Automatic Cleanup** - marker limit with automatic removal of oldest markers
- **Resource Management** - automatic memory release when removing markers

USER DATA MANAGEMENT:
- **CSV Import** - ability to add custom objects from CSV files
- **GPS Format Support** - import points in Space Engineers GPS format
- **File Management** - preview, delete, and export loaded data
- **Examples** - ready example files to download
- **Data Validation** - checking correctness of imported files
- **Map Refresh** - automatic map update after adding/removing data

TEMPORARY OBJECTS (temp-objekty.csv):
- **Automatic Loading** - system automatically loads objects from temp-objekty.csv file
- **Exclamation Marks** - objects displayed as three-dimensional exclamation marks (!)
- **Colors from File** - support for colors defined in Space Engineers GPS format
- **Auto-Refresh** - file refreshed with each new version upload
- **Clickable Objects** - exclamation marks are clickable and show info panel
- **Safety Buffer** - option to add 100m buffer from gravity range end in GPS

POINT CONTROLLER:
- **GPS Copying** - function to copy coordinates in Space Engineers format
- **Notifications** - visual clipboard copy confirmations
- **Fallback** - support for older browsers without Clipboard API

---

USER GUIDE
==========

BASIC NAVIGATION:
1. **Select Object**: Use "-- Select object --" dropdown or enter coordinates/GPS
2. **Jump to Object**: Click "▶ JUMP" to go to selected location
3. **2D/3D View**: Switch between views with "🗺️ 2D" button
4. **Info Panel**: Click on object to see details

2D VIEW CONTROLS:
1. **Mouse Wheel**: Zoom in/out (range: 10% - 500%)
2. **Click & Drag**: Pan/move the view
3. **Control Buttons** (bottom-right corner):
   - `+` Zoom In (increase by 20%)
   - `-` Zoom Out (decrease by 20%)
   - `⟲` Reset (return to initial view)

ROUTE PLANNING:
1. **Start Point**: Enter coordinates, GPS, or object name in "Start" field
2. **End Point**: Enter coordinates, GPS, or object name in "End" field
3. **Calculate Course**: Click "🧭 Calculate Course"
4. **Copy GPS**: Use "📋 START" and "📋 END" buttons to copy coordinates
5. **Clear**: Click red "✖" to clear route and fields

COORDINATE FORMATS:
- **Coordinates**: `1000, 2000, 3000`
- **Space Engineers GPS**: `GPS:Name:1000:2000:3000:#FF0000:`
- **Object Name**: `Navia` (search by name)

DATA MANAGEMENT:
1. **Open Panel**: Click "📁 My Data"
2. **Select File**: Click "Select CSV file" and choose your file
3. **Check Data**: Panel will show number of loaded objects
4. **Manage**: Use Refresh, Export, Clear buttons
5. **Delete File**: Click 🗑️ next to specific file

MOBILE SUPPORT:
- **Touch**: Swipe with finger to rotate map
- **Pinch**: Pinch/spread fingers to zoom
- **Double Tap**: Quick zoom
- **Panel**: Slide info panel up/down

---

FILE STRUCTURE
==============

MAIN FILES:
- index.html – Main page, dependency loading
- main.js – Map startup and data loading
- scene.js – 3D scene rendering, animations, effects
- view2d.js – 2D map view with interactive zoom and panning

INTERFACE & NAVIGATION:
- ui.js – User interface, panels, markers
- navigation.js / navigation2.js – Range calculations, route planning, obstacle detection
- coordinateController.js – Point controller with GPS functions
- userDataUI.js – User data management
- markerManager.js – Central marker management system

DATA & UTILITIES:
- dataLoader.js – CSV parser and data validation
- localData.js – Local user data management
- helpers.js – Helper functions
- mobile.js – Full touch support and mobile optimizations

STYLING:
- style.css – Main application styles
- mobile.css – Responsive and mobile styles
- userDataStyles.css – User data panel styles

LANGUAGES:
- lang/ – Translations folder
  - lang.js – Language management system
  - pl.json – Polish translations
  - en.json – English translations

DATA:
- uklad.csv – System data (planets, moons, wormholes, zones)
- temp-objekty.csv – Temporary objects displayed as exclamation marks
- examples/ – Example CSV files for users
  - example_user_data.csv – Complete example with all columns
  - test_se_gps.csv – Space Engineers GPS format example
  - test_gps.csv – Standard GPS example

LICENSE:
- LICENSE.txt – GNU GPL v3 license text

---

INSTALLATION & SETUP
====================

1. Download all project files to one folder
2. For full functionality, open `index.html` via local web server (e.g., Live Server, command: `npx serve .`)
3. Edit `uklad.csv` to expand your own system
4. Add custom data through "📁 My Data" panel
5. Test on both desktop and mobile devices (NOTE: mobile version still in development)

REQUIREMENTS:
- Modern browser with WebGL support
- JavaScript enabled
- For full functionality: local HTTP server

---

MULTILINGUAL SYSTEM
===================

The application features a multilingual system with automatic browser language detection.

SUPPORTED LANGUAGES:
- Polish (default)
- English

ADDING NEW LANGUAGE:

1. Create new JSON file in `lang/` folder (e.g., `de.json` for German).

2. Copy structure from `lang/pl.json` and translate all values:

```json
{
  "app": {
    "title": "Space Engineers 3D Map",
    "author": "Author: VolkerNemrod, 2025 v.21.10.2025"
  },
  "ui": {
    "buttons": {
      "jump": "▶ JUMP",
      "view2d": "🗺️ 2D",
      "myData": "📁 My Data"
    },
    // ... rest of translations
  }
}
```

3. Add new language to `lang/lang.js` in `supportedLanguages` object:

```javascript
this.supportedLanguages = {
    'pl': { name: 'Polski', flag: '🇵🇱' },
    'en': { name: 'English', flag: '🇺🇸' },
    'de': { name: 'Deutsch', flag: '🇩🇪' }  // New language
};
```

4. Update `detectBrowserLanguage()` method if needed.

TRANSLATION KEY STRUCTURE:

- `app.*` - Application information
- `ui.*` - User interface elements
- `controller.*` - Point controller
- `userData.*` - User data panel
- `navigation.*` - Navigation system

USING TRANSLATIONS IN CODE:

```javascript
// Simple translation
const text = window.t('ui.buttons.jump');

// Translation with variable interpolation
const message = window.t('userData.upload.success', { 
    count: 5, 
    filename: 'data.csv' 
});

// Check if translation exists
if (window.t) {
    element.textContent = window.t('translation.key');
}
```

DYNAMIC UPDATES:

System automatically updates all elements with `data-i18n` attributes 
when language changes. For dynamically created elements, listen to 
`languageChanged` event:

```javascript
window.addEventListener('languageChanged', () => {
    updateMyComponentLanguage();
});
```

---

DATA FORMAT DESCRIPTION
=======================

SYSTEM FILE (uklad.csv):
Each row represents a single space object, zone, or wormhole.

Example line:
```
name;type;x;y;z;diameter;color;objectType;description;resources;poeticDescription;gravityRange;containedObjects;graphicPath
Navia (Kepler-444b);Planet;0.50;0.50;0.50;120;0xFF0000;planet;Rocky planet...;Iron, Nickel;Red planet...;300000;;graf/Kepler-444/Navia.png
```

USER FILES (CSV):
Supported formats for custom data:

STANDARD FORMAT:
```
name;type;x;y;z;diameter;color;description
My Base;Station;1000;2000;3000;5000;0xFF0000;Main operations base
```

SPACE ENGINEERS GPS FORMAT:
```
name;type;seGPS;description
My Base;Station;GPS:My Base:1000:2000:3000:#FF0000:5000;Base with GPS (5km diameter)
```

TEMPORARY OBJECTS FILE (temp-objekty.csv):
Special file for objects displayed as exclamation marks (!):

```
name;type;seGPS;description
Checkpoint;temp-obj;GPS:Checkpoint:137158.17:0.00:119098.11:#FFFFFF:;Mission checkpoint
Alert;temp-obj;GPS:Alert:150000:5000:120000:#FF0000:;Alert zone
```

COLUMNS:
- **name** (required) - Object name
- **type** (optional) - Object type (Station, Base, Outpost, etc.)
- **x, y, z** (required for standard) - Coordinates
- **seGPS** (alternative to x,y,z) - Space Engineers GPS format
- **diameter** (optional) - Diameter in meters
- **color** (optional) - Color in hex format (0xFF0000)
- **description** (optional) - Object description
- **resources** (optional) - Available resources
- **graphicPath** (optional) - Path to object graphic (e.g., graf/Kepler-444/Navia.png)

SPECIAL temp-objekty.csv PROPERTIES:
- **Automatic Loading** - file loaded at application startup
- **Cache Busting** - system automatically refreshes file on each change
- **ObjectType** - all objects automatically receive objectType="temp-obj"
- **Visualization** - objects displayed as three-dimensional exclamation marks
- **Colors** - support for colors from GPS format (#FFFFFF, #FF0000, etc.)
- **Clickable** - objects are clickable and show info panel with GPS
- **Safety Buffer** - checkbox to add 100m buffer from gravity range

SUPPORTED SEPARATORS:
- Semicolon (;) - preferred
- Comma (,) - supported
- Tab - supported

---

MARKER & ANIMATION SYSTEM
=========================

MARKER TYPES:
- **jump** - Yellow destination point markers (gentle pulsing)
- **route** - Gold route markers (subtle pulsing, 1km diameter)
- **controller** - Cyan controller markers (intensive pulsing)
- **custom** - Custom user markers

ANIMATIONS:
- **Size Pulsing** - markers change size over time
- **Opacity Pulsing** - opacity changes for better visibility
- **Glow Effect** - additional glow for route markers

MANAGEMENT:
- **Automatic Cleanup** - limit of 10 markers, oldest are removed
- **Memory Management** - automatic WebGL resource release
- **Central Management** - all markers through MarkerManager

---

ROUTE PLANNING - DETAILS
=========================

COLLISION DETECTION ALGORITHM:
1. **Route Line** - calculate straight line between START and END points
2. **Object Checking** - for each planet/moon in system:
   - Calculate closest point on route line to object center
   - Check if point is within route range (between START and END)
   - Compare distance with object radius + safety margin
3. **Safety Margin** - 100m additional margin for ship
4. **Reporting** - list of all objects on route with distances

SAFE DISTANCES:
- **Planets** - radius × 2.5 (strong gravity)
- **Moons** - radius × 1.5 (moderate gravity)
- **Asteroids** - radius × 0.5 (weak gravity)
