SE-MAP – Space Engineers 3D Map (wersja webowa)
===============================================

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

- Trójwymiarowa mapa - realistyczna prezentacja planet, księżyców, wormhole i niebezpiecznych stref.
- Widok 2D - alternatywny widok mapy w stylu Elite Dangerous z funkcjami zoom i panning.
- Wyszukiwanie oraz filtrowanie obiektów.
- Wyznaczanie kursów z uwzględnieniem przeszkód i bezpiecznych dystansów.
- Interfejs responsywny z pełnym wsparciem mobilnym (obsługa dotyku, gestów, paneli slajdowanych).
- Szczegółowy panel informacyjny każdego obiektu.
- Łatwa edycja i rozszerzalność danych (CSV).
- System wielojęzyczny z automatyczną detekcją języka przeglądarki (Polski/Angielski).
- Kontroler Punktu z funkcją kopiowania GPS z Space Engineers.
- Zarządzanie danymi użytkownika z importem/eksportem CSV.

---

STRUKTURA PLIKÓW
================

- index.html – Główna strona, ładowanie zależności.
- main.js – Uruchamianie mapy i ładowanie danych.
- scene.js – Renderowanie sceny 3D, animacje, efekty.
- view2d.js – Widok 2D mapy z funkcjami zoom i panning.
- ui.js – Interfejs użytkownika, panele, markery.
- navigation.js / navigation2.js – Obliczanie zasięgów, planowanie trasy, detekcja przeszkód.
- coordinateController.js – Kontroler punktu z funkcjami GPS.
- userDataUI.js – Zarządzanie danymi użytkownika.
- dataLoader.js – Parser i walidacja danych CSV.
- helpers.js – Funkcje pomocnicze.
- style.css, mobile.css, userDataStyles.css – Stylizacja, responsywność.
- mobile.js – Pełne wsparcie dotyku i optymalizacje mobilne.
- lang/ – Folder z plikami tłumaczeń.
  - lang.js – System zarządzania językami.
  - pl.json – Tłumaczenia polskie.
  - en.json – Tłumaczenia angielskie.
- uklad.csv – Dane układu (planety, księżyce, wormhole, strefy).
- LICENSE – Treść licencji GNU GPL v3.

---

INSTRUKCJA URUCHOMIENIA
=======================

1. Pobierz wszystkie pliki projektu do jednego folderu.
2. Dla pełnego działania otwórz `index.html` poprzez lokalny serwer web (np. Live Server, polecenie: `npx serve .`)
3. Edytuj `uklad.csv`, aby rozszerzyć własny układ.
4. Testuj zarówno na komputerze, jak i urządzeniu mobilnym.

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

Każdy wiersz w pliku `uklad.csv` reprezentuje pojedynczy obiekt kosmiczny, strefę lub wormhole.  
Przykładowa linia:

name;type;x;y;z;diameter;color;objectType;description;resources;poeticDescription;gravityRange;containedObjects
Navia (Kepler-444b);Planeta;0.50;0.50;0.50;120;0xFF0000;planet;...

Szczegółowa dokumentacja znajduje się w kodzie oraz komentarzach.

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

SYSTEM TŁUMACZEŃ:
- Hierarchiczna struktura JSON z fallback do polskiego
- Automatyczna detekcja języka przeglądarki
- Interpolacja zmiennych w tłumaczeniach
- Event-driven aktualizacja interfejsu

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

Miłego korzystania!
