SE-MAP – Space Engineers 3D Map (wersja webowa)
===============================================

Wersja DEMO: https://se-map-beta.macierz.eu/
YT: https://www.youtube.com/watch?v=1Dc1jhDcPYU&list=PLdXbPExznPQUsj06RhLhrG6WUmdLTG3ic 
Kontakt: se-map@macierz.eu

Interaktywna, trójwymiarowa mapa układu planetarnego zainspirowana światem Space Engineers.

Autor: VolkerNemrod
Licencja: GNU General Public License v3.0 (GPL-3.0)

Projekt fanowski. Nie jest w żaden sposób powiązany, sponsorowany ani wspierany przez Keen Software House, właściciela gry Space Engineers oraz praw do znaków towarowych i uniwersum gry. Projekt ma charakter niekomercyjny, przeznaczony wyłącznie do użytku edukacyjnego i rozrywkowego.

Wszelkie materiały (nazwy, koncepcje, grafiki, odniesienia) nawiązujące do Space Engineers są własnością Keen Software House. Twórca SE-MAP nie rości sobie do nich praw, a projekt udostępniany jest wyłącznie jako narzędzie pomocnicze dla społeczności fanowskiej.

W przypadku dalszego wykorzystywania, modyfikacji, rozpowszechniania lub integracji projektu z innymi systemami, obowiązuje treść licencji GPL-3.0 (patrz poniżej oraz plik LICENSE).

---

OPIS
====

SE-MAP to webowa aplikacja open source, umożliwiająca wyświetlanie oraz interaktywną nawigację trójwymiarową po fanowskim układzie planetarnym stworzonym na potrzeby scenariusza w Space Engineers. Obsługuje wyszukiwanie, planowanie tras (kursów „jump drive"), szczegółowe podglądy obiektów, obsługę stref niebezpiecznych, tryb mobilny oraz szeroką parametryzację przez plik `uklad.csv`.

---

FUNKCJONALNOŚCI
===============

PODSTAWOWE FUNKCJE:
- Trójwymiarowa mapa - realistyczna prezentacja planet, księżyców, wormhole i niebezpiecznych stref
- Widok 2D - alternatywny widok mapy w stylu Elite Dangerous z funkcjami zoom i panning
- Wyszukiwanie oraz filtrowanie obiektów z dropdown i wpisywaniem współrzędnych
- Interfejs responsywny z pełnym wsparciem mobilnym (obsługa dotyku, gestów, paneli slajdowanych)
- Szczegółowy panel informacyjny każdego obiektu
- System wielojęzyczny z automatyczną detekcją języka przeglądarki (Polski/Angielski)

ZAAWANSOWANE FUNKCJE NAWIGACJI:
- **Wyznaczanie kursów** z inteligentną detekcją przeszkód i bezpiecznych dystansów
- **Markery tras** - małe (1km), złote, lekko pulsujące markery pokazujące punkty START i END
- **Analiza kolizji** - system sprawdza czy trasa przechodzi przez planety/księżyce
- **Bezpieczne dystanse** - automatyczne obliczanie marginesów bezpieczeństwa
- **Kopiowanie GPS** - przyciski do kopiowania współrzędnych START/END do schowka w formacie Space Engineers
- **Zachowanie danych** - współrzędne i wybrane obiekty nie znikają po obliczeniu trasy (tylko po wciśnięciu czerwonego X)
- **Automatyczne kadrowanie** - kamera automatycznie centruje się na trasie

SYSTEM MARKERÓW:
- **MarkerManager** - centralny system zarządzania wszystkimi markerami na mapie
- **Różne typy markerów**: jump (żółte), route (złote), controller (cyjan), custom
- **Animacje pulsowania** - każdy typ markera ma własną animację
- **Automatyczne czyszczenie** - limit markerów z automatycznym usuwaniem najstarszych
- **Zarządzanie zasobami** - automatyczne zwalnianie pamięci przy usuwaniu markerów

ZARZĄDZANIE DANYMI UŻYTKOWNIKA:
- **Import CSV** - możliwość dodawania własnych obiektów z plików CSV
- **Obsługa formatów GPS** - import punktów w formacie Space Engineers GPS
- **Zarządzanie plikami** - podgląd, usuwanie i eksport załadowanych danych
- **Przykłady** - gotowe pliki przykładowe do pobrania
- **Walidacja danych** - sprawdzanie poprawności importowanych plików
- **Odświeżanie mapy** - automatyczna aktualizacja mapy po dodaniu/usunięciu danych

OBIEKTY TYMCZASOWE (temp-objekty.csv):
- **Automatyczne ładowanie** - system automatycznie ładuje obiekty z pliku temp-objekty.csv
- **Znaki wykrzyknika** - obiekty wyświetlane jako trójwymiarowe znaki wykrzyknika (!)
- **Kolory z pliku** - obsługa kolorów zdefiniowanych w formacie Space Engineers GPS
- **Automatyczne odświeżanie** - plik jest odświeżany przy każdym wgraniu nowej wersji
- **Klikalne obiekty** - wykrzykniki są klikalne i pokazują panel informacyjny
- **Bufor bezpieczeństwa** - opcja dodania 100m buforu od końca zasięgu grawitacji w GPS

KONTROLER PUNKTU:
- **Kopiowanie GPS** - funkcja kopiowania współrzędnych w formacie Space Engineers
- **Powiadomienia** - wizualne potwierdzenia kopiowania do schowka
- **Fallback** - wsparcie dla starszych przeglądarek bez Clipboard API

---

INSTRUKCJA UŻYTKOWANIA
======================

PODSTAWOWA NAWIGACJA:
1. **Wybór obiektu**: Użyj dropdown "-- Wybierz obiekt --" lub wpisz współrzędne/GPS
2. **Skok do obiektu**: Kliknij "▶ SKOK" aby przejść do wybranego miejsca
3. **Widok 2D/3D**: Przełączaj między widokami przyciskiem "🗺️ 2D"
4. **Panel informacyjny**: Kliknij na obiekt aby zobaczyć szczegóły

PLANOWANIE TRAS:
1. **Punkt startu**: Wpisz współrzędne, GPS lub nazwę obiektu w polu "Start"
2. **Punkt końca**: Wpisz współrzędne, GPS lub nazwę obiektu w polu "Koniec"
3. **Oblicz kurs**: Kliknij "🧭 Oblicz kurs"
4. **Kopiuj GPS**: Użyj przycisków "📋 START" i "📋 END" aby skopiować współrzędne
5. **Czyszczenie**: Kliknij czerwony "✖" aby wyczyścić trasę i pola

FORMATY WSPÓŁRZĘDNYCH:
- **Współrzędne**: `1000, 2000, 3000`
- **GPS Space Engineers**: `GPS:Nazwa:1000:2000:3000:#FF0000:`
- **Nazwa obiektu**: `Navia` (wyszukiwanie po nazwie)

ZARZĄDZANIE DANYMI:
1. **Otwórz panel**: Kliknij "📁 Moje dane"
2. **Wybierz plik**: Kliknij "Wybierz plik CSV" i wybierz swój plik
3. **Sprawdź dane**: Panel pokaże liczbę załadowanych obiektów
4. **Zarządzaj**: Używaj przycisków Odśwież, Eksportuj, Wyczyść
5. **Usuń plik**: Kliknij 🗑️ przy konkretnym pliku

OBSŁUGA MOBILNA:
- **Dotyk**: Przeciągaj palcem aby obracać mapę
- **Pinch**: Ściśnij/rozciągnij palce aby zoomować
- **Podwójne dotknięcie**: Szybki zoom
- **Panel**: Przesuń panel informacyjny w górę/dół

---

STRUKTURA PLIKÓW
================

PLIKI GŁÓWNE:
- index.html – Główna strona, ładowanie zależności
- main.js – Uruchamianie mapy i ładowanie danych
- scene.js – Renderowanie sceny 3D, animacje, efekty
- view2d.js – Widok 2D mapy z funkcjami zoom i panning

INTERFEJS I NAWIGACJA:
- ui.js – Interfejs użytkownika, panele, markery
- navigation.js / navigation2.js – Obliczanie zasięgów, planowanie trasy, detekcja przeszkód
- coordinateController.js – Kontroler punktu z funkcjami GPS
- userDataUI.js – Zarządzanie danymi użytkownika
- markerManager.js – Centralny system zarządzania markerami

DANE I POMOCNICZE:
- dataLoader.js – Parser i walidacja danych CSV
- localData.js – Zarządzanie lokalnymi danymi użytkownika
- helpers.js – Funkcje pomocnicze
- mobile.js – Pełne wsparcie dotyku i optymalizacje mobilne

STYLIZACJA:
- style.css – Główne style aplikacji
- mobile.css – Style responsywne i mobilne
- userDataStyles.css – Style panelu danych użytkownika

JĘZYKI:
- lang/ – Folder z plikami tłumaczeń
  - lang.js – System zarządzania językami
  - pl.json – Tłumaczenia polskie
  - en.json – Tłumaczenia angielskie

DANE:
- uklad.csv – Dane układu (planety, księżyce, wormhole, strefy)
- temp-objekty.csv – Obiekty tymczasowe wyświetlane jako wykrzykniki
- examples/ – Przykładowe pliki CSV dla użytkowników
  - example_user_data.csv – Pełny przykład z wszystkimi kolumnami
  - test_se_gps.csv – Przykład z formatem GPS Space Engineers
  - test_gps.csv – Standardowy przykład GPS

LICENCJA:
- LICENSE.txt – Treść licencji GNU GPL v3

---

INSTRUKCJA URUCHOMIENIA
=======================

1. Pobierz wszystkie pliki projektu do jednego folderu
2. Dla pełnego działania otwórz `index.html` poprzez lokalny serwer web (np. Live Server, polecenie: `npx serve .`)
3. Edytuj `uklad.csv`, aby rozszerzyć własny układ
4. Dodaj własne dane przez panel "📁 Moje dane"
5. Testuj zarówno na komputerze, jak i urządzeniu mobilnym (UWAGA! wersja mobilna jeszcze nie gotowa)

WYMAGANIA:
- Nowoczesna przeglądarka z obsługą WebGL
- JavaScript włączony
- Dla pełnej funkcjonalności: lokalny serwer HTTP

---

SYSTEM WIELOJĘZYCZNY
====================

Aplikacja obsługuje system wielojęzyczny z automatyczną detekcją języka przeglądarki.

OBSŁUGIWANE JĘZYKI:
- Polski (domyślny)
- Angielski

DODAWANIE NOWEGO JĘZYKA:

1. Utwórz nowy plik JSON w folderze `lang/` (np. `de.json` dla niemieckiego).

2. Skopiuj strukturę z `lang/pl.json` i przetłumacz wszystkie wartości:

```json
{
  "app": {
    "title": "Space Engineers 3D Map",
    "author": "Autor: VolkerNemrod, 2025 v.16.08.25"
  },
  "ui": {
    "buttons": {
      "jump": "▶ SPRUNG",
      "view2d": "🗺️ 2D",
      "myData": "📁 Meine Daten"
    },
    // ... reszta tłumaczeń
  }
}
```

3. Dodaj nowy język do `lang/lang.js` w obiekcie `supportedLanguages`:

```javascript
this.supportedLanguages = {
    'pl': { name: 'Polski', flag: '🇵🇱' },
    'en': { name: 'English', flag: '🇺🇸' },
    'de': { name: 'Deutsch', flag: '🇩🇪' }  // Nowy język
};
```

4. Zaktualizuj metodę `detectBrowserLanguage()` jeśli potrzeba.

STRUKTURA KLUCZY TŁUMACZEŃ:

- `app.*` - Informacje o aplikacji
- `ui.*` - Elementy interfejsu użytkownika
- `controller.*` - Kontroler punktu
- `userData.*` - Panel danych użytkownika
- `navigation.*` - System nawigacji

UŻYWANIE TŁUMACZEŃ W KODZIE:

```javascript
// Proste tłumaczenie
const text = window.t('ui.buttons.jump');

// Tłumaczenie z interpolacją zmiennych
const message = window.t('userData.upload.success', { 
    count: 5, 
    filename: 'data.csv' 
});

// Sprawdzenie czy tłumaczenie istnieje
if (window.t) {
    element.textContent = window.t('klucz.tlumaczenia');
}
```

AKTUALIZACJA DYNAMICZNA:

System automatycznie aktualizuje wszystkie elementy z atrybutami `data-i18n` 
przy zmianie języka. Dla elementów tworzonych dynamicznie należy nasłuchiwać 
zdarzenia `languageChanged`:

```javascript
window.addEventListener('languageChanged', () => {
    updateMyComponentLanguage();
});
```

---

OPIS FORMATU DANYCH
===================

PLIK SYSTEMOWY (uklad.csv):
Każdy wiersz reprezentuje pojedynczy obiekt kosmiczny, strefę lub wormhole.

Przykładowa linia:
```
name;type;x;y;z;diameter;color;objectType;description;resources;poeticDescription;gravityRange;containedObjects
Navia (Kepler-444b);Planeta;0.50;0.50;0.50;120;0xFF0000;planet;Planeta skalista...;Żelazo, Nikiel;Czerwona planeta...;300000;
```

PLIKI UŻYTKOWNIKA (CSV):
Obsługiwane formaty dla własnych danych:

STANDARDOWY FORMAT:
```
name;type;x;y;z;diameter;color;description
Moja Baza;Stacja;1000;2000;3000;5000;0xFF0000;Główna baza operacyjna
```

FORMAT GPS SPACE ENGINEERS:
```
name;type;seGPS;description
Moja Baza;Stacja;GPS:Moja Baza:1000:2000:3000:#FF0000:5000;Baza z GPS (5km średnica)
```

PLIK OBIEKTÓW TYMCZASOWYCH (temp-objekty.csv):
Specjalny plik dla obiektów wyświetlanych jako wykrzykniki (!):

```
name;type;seGPS;description
Punkt Kontrolny;temp-obj;GPS:Punkt Kontrolny:137158.17:0.00:119098.11:#FFFFFF:;Punkt kontrolny misji
Alarm;temp-obj;GPS:Alarm:150000:5000:120000:#FF0000:;Strefa alarmowa
```

KOLUMNY:
- **name** (wymagane) - Nazwa obiektu
- **type** (opcjonalne) - Typ obiektu (Stacja, Baza, Posterunek, itp.)
- **x, y, z** (wymagane dla standardowego) - Współrzędne
- **seGPS** (alternatywa dla x,y,z) - Format GPS Space Engineers
- **diameter** (opcjonalne) - Średnica w metrach
- **color** (opcjonalne) - Kolor w formacie hex (0xFF0000)
- **description** (opcjonalne) - Opis obiektu
- **resources** (opcjonalne) - Dostępne surowce

SPECJALNE WŁAŚCIWOŚCI temp-objekty.csv:
- **Automatyczne ładowanie** - plik ładowany przy starcie aplikacji
- **Cache busting** - system automatycznie odświeża plik przy każdej zmianie
- **ObjectType** - wszystkie obiekty automatycznie otrzymują objectType="temp-obj"
- **Wizualizacja** - obiekty wyświetlane jako trójwymiarowe znaki wykrzyknika
- **Kolory** - obsługa kolorów z formatu GPS (#FFFFFF, #FF0000, itp.)
- **Kliknięcie** - obiekty są klikalne i pokazują panel informacyjny z GPS
- **Bufor bezpieczeństwa** - checkbox do dodania 100m buforu od zasięgu grawitacji

OBSŁUGIWANE SEPARATORY:
- Średnik (;) - preferowany
- Przecinek (,) - obsługiwany
- Tabulator - obsługiwany

---

SYSTEM MARKERÓW I ANIMACJI
==========================

TYPY MARKERÓW:
- **jump** - Żółte markery punktów docelowych (delikatne pulsowanie)
- **route** - Złote markery tras (subtelne pulsowanie, 1km średnica)
- **controller** - Cyjan markery kontrolera (intensywne pulsowanie)
- **custom** - Niestandardowe markery użytkownika

ANIMACJE:
- **Pulsowanie rozmiaru** - markery zmieniają wielkość w czasie
- **Pulsowanie przezroczystości** - zmiana opacity dla lepszej widoczności
- **Efekt świecenia** - dodatkowy blask dla markerów tras

ZARZĄDZANIE:
- **Automatyczne czyszczenie** - limit 10 markerów, najstarsze są usuwane
- **Zarządzanie pamięcią** - automatyczne zwalnianie zasobów WebGL
- **Centralne zarządzanie** - wszystkie markery przez MarkerManager

---

PLANOWANIE TRAS - SZCZEGÓŁY
===========================

ALGORYTM DETEKCJI KOLIZJI:
1. **Linia trasy** - obliczenie prostej między punktami START i END
2. **Sprawdzenie obiektów** - dla każdej planety/księżyca w systemie:
   - Obliczenie najbliższego punktu na linii trasy do centrum obiektu
   - Sprawdzenie czy punkt jest w zasięgu trasy (między START a END)
   - Porównanie odległości z promieniem obiektu + margines bezpieczeństwa
3. **Margines bezpieczeństwa** - 100m dodatkowy margines dla statku
4. **Raportowanie** - lista wszystkich obiektów na trasie z odległościami

BEZPIECZNE DYSTANSE:
- **Planety** - promień × 2.5 (silna grawitacja)
- **Księżyce** - promień × 1.5 (umiarkowana grawitacja)  
- **Asteroidy** - promień × 0.5 (słaba grawitacja)
- **Inne obiekty** - promień × 0.8 (domyślny zasięg)

FUNKCJE GPS:
- **Format SE** - `GPS:Nazwa:X:Y:Z:#Kolor:`
- **Kopiowanie** - automatyczne kopiowanie do schowka systemowego
- **Powiadomienia** - wizualne potwierdzenie kopiowania
- **Fallback** - wsparcie starszych przeglądarek

---

UWAGI TECHNICZNE I ROZWOJOWE
============================

WIDOK 2D:
- Aktualnie używa logarytmicznej skali dla rozmiarów obiektów
- UWAGA NA PRZYSZŁOŚĆ: Warto wprowadzić bardziej proporcjonalne wielkości obiektów w widoku 2D
  bazujące na rzeczywistych średnicach z danych CSV, aby lepiej odzwierciedlić różnice
  między planetami i księżycami różnych rozmiarów

WIDOK 3D:
- Pełne wsparcie dla proporcjonalnych rozmiarów obiektów
- Realistyczne odległości i skale
- Optymalizacja renderowania dla dużej liczby obiektów

SYSTEM TŁUMACZEŃ:
- Hierarchiczna struktura JSON z fallback do polskiego
- Automatyczna detekcja języka przeglądarki
- Interpolacja zmiennych w tłumaczeniach
- Event-driven aktualizacja interfejsu

WYDAJNOŚĆ:
- **WebGL** - wykorzystanie akceleracji sprzętowej
- **Zarządzanie pamięcią** - automatyczne czyszczenie nieużywanych zasobów
- **Optymalizacja mobilna** - dostosowane renderowanie dla urządzeń mobilnych
- **Lazy loading** - ładowanie danych na żądanie

KOMPATYBILNOŚĆ:
- **Nowoczesne przeglądarki** - Chrome, Firefox, Safari, Edge
- **Urządzenia mobilne** - iOS Safari, Android Chrome
- **Fallback** - graceful degradation dla starszych przeglądarek

---

ROZWIĄZYWANIE PROBLEMÓW
======================

CZĘSTE PROBLEMY:

**Przycisk "Moje dane" nie działa:**
- Sprawdź konsolę przeglądarki (F12)
- Upewnij się, że JavaScript jest włączony
- Spróbuj odświeżyć stronę (Ctrl+F5)

**Nie można załadować pliku CSV:**
- Sprawdź format pliku (UTF-8, separatory)
- Upewnij się, że wymagane kolumny są obecne
- Sprawdź przykładowe pliki w folderze examples/

**Mapa nie ładuje się:**
- Sprawdź czy używasz lokalnego serwera HTTP
- Sprawdź konsolę na błędy WebGL
- Spróbuj innej przeglądarki

**Problemy z wydajnością:**
- Zmniejsz liczbę obiektów na mapie
- Wyczyść stare markery przyciskiem X
- Zamknij inne karty przeglądarki

**Problemy mobilne:**
- Sprawdź czy dotyk jest włączony
- Spróbuj obrócić urządzenie
- Sprawdź czy masz wystarczająco pamięci

**Serwer cache'uje stare pliki:**
- Problem: Serwer pamięta stare wersje plików JS/CSS mimo zmian
- Rozwiązanie: Pliki mają parametry cache-busting (?v=07.09.2025)
- Jeśli problem nadal występuje: Zmień wersję w index.html na nowszą
- Alternatywnie: Użyj trybu incognito lub wyczyść cache serwera
- Dla deweloperów: Restartuj lokalny serwer HTTP

---

PRAWA AUTORSKIE, OGRANICZENIA I UWAGI
=====================================

- Projekt SE-MAP jest udostępniany na licencji GNU GPL v3 (pełna treść: patrz plik LICENSE), z zachowaniem wymogu zachowania informacji o autorze i licencji przy wszelkiej publikacji, modyfikacji, czy dystrybucji.
- W projekcie wykorzystano jedynie własny kod, narzędzia open source (np. THREE.js) oraz materiały tekstowe zgodne ze "wszystkimi prawami zastrzeżonymi" Space Engineers przez Keen Software House.
- Wszelkie odniesienia do gry Space Engineers są wykorzystywane wyłącznie w celach fanowskich i nie stanowią naruszenia praw autorskich ani nie są związane z działalnością komercyjną.
- Projekt nie generuje zysków, nie jest podpięty do żadnych komercyjnych rozwiązań, sklepów, ani systemów monetyzacji.
- Wszelkie roszczenia dotyczące naruszenia własności intelektualnej należy kierować na adres kontaktowy autora; na żądanie odpowiednich podmiotów materiały mogą zostać zmodyfikowane/usunięte.

---

LICENSE – GNU GENERAL PUBLIC LICENSE (GPL v3)
==============================================

SE-MAP – Space Engineers 3D Map  
Copyright (C) [2025] VolkerNemrod

Niniejszy program jest wolnym oprogramowaniem: możesz go rozpowszechniać dalej i/lub modyfikować na warunkach GNU General Public License (wersja 3), opublikowanej przez Free Software Foundation.

Niniejszy program rozpowszechniany jest z nadzieją, że będzie użyteczny, 
ale BEZ JAKIEJKOLWIEK GWARANCJI, nawet domyślnej gwarancji przydatności handlowej albo przydatności do określonego celu. 
Zobacz szczegóły w Licencji GNU GPL.

Pełny tekst licencji GNU GPL v3 znajdziesz w pliku LICENSE lub pod adresem: https://www.gnu.org/licenses/gpl-3.0.html

W przypadku udostępniania, kopiowania lub modyfikacji projektu, należy zachować informację o autorze, powyższy zapis, oraz treść pliku LICENSE w repozytorium lub dystrybucji.

---

HISTORIA ZMIAN

WERSJA 15.09.25:
- ✅ Dodano system obiektów tymczasowych (temp-objekty.csv)
- ✅ Obiekty wyświetlane jako trójwymiarowe znaki wykrzyknika (!)
- ✅ Automatyczne ładowanie i odświeżanie pliku temp-objekty.csv z cache busting
- ✅ Obsługa kolorów z formatu Space Engineers GPS (#FFFFFF, #FF0000, itp.)
- ✅ Naprawiono kliknięcie obiektów temp-obj (recursive raycaster intersection)
- ✅ Dodano checkbox buforu bezpieczeństwa +100m od zasięgu grawitacji w GPS
- ✅ Inteligentne obliczanie bezpiecznych współrzędnych na podstawie kierunku kamery
- ✅ Rozszerzona obsługa formatu seGPS w uklad.csv
- ✅ Aktualizacja dokumentacji z opisem nowych funkcji

WERSJA 16.08.25:
- ✅ Dodano zaawansowany system planowania tras z detekcją kolizji
- ✅ Implementowano MarkerManager - centralny system zarządzania markerami
- ✅ Dodano małe (1km), złote, pulsujące markery tras
- ✅ Zachowanie współrzędnych po obliczeniu trasy (czyszczenie tylko przyciskiem X)
- ✅ Funkcje kopiowania GPS do schowka w formacie Space Engineers
- ✅ Panel zarządzania danymi użytkownika z importem/eksportem CSV
- ✅ Obsługa formatów GPS Space Engineers w importowanych danych
- ✅ Przykładowe pliki CSV dla użytkowników
- ✅ Poprawki wydajności i zarządzania pamięcią
- ✅ Rozszerzona dokumentacja i instrukcje użytkowania
==============

WERSJA 16.08.25:
- ✅ Dodano zaawansowany system planowania tras z detekcją kolizji
- ✅ Implementowano MarkerManager - centralny system zarządzania markerami
- ✅ Dodano małe (1km), złote, pulsujące markery tras
- ✅ Zachowanie współrzędnych po obliczeniu trasy (czyszczenie tylko przyciskiem X)
- ✅ Funkcje kopiowania GPS do schowka w formacie Space Engineers
- ✅ Panel zarządzania danymi użytkownika z importem/eksportem CSV
- ✅ Obsługa formatów GPS Space Engineers w importowanych danych
- ✅ Przykładowe pliki CSV dla użytkowników
- ✅ Poprawki wydajności i zarządzania pamięcią
- ✅ Rozszerzona dokumentacja i instrukcje użytkowania

---

Miłego korzystania!
