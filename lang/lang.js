// lang.js - System zarządzania językami

class LanguageManager {
    constructor() {
        this.currentLang = 'pl';
        this.translations = {};
        this.supportedLanguages = {
            'pl': { name: 'Polski', flag: '🇵🇱' },
            'en': { name: 'English', flag: '🇺🇸' }
        };
        
        this.init();
    }

    async init() {
        // Wykryj język przeglądarki
        const browserLang = this.detectBrowserLanguage();
        
        // Sprawdź zapisane preferencje
        const savedLang = localStorage.getItem('app-language');
        
        // Ustaw język (priorytet: zapisane > przeglądarka > domyślny)
        this.currentLang = savedLang || browserLang || 'pl';
        
        // Załaduj tłumaczenia
        await this.loadTranslations();
        
        // Utwórz przełącznik języka
        this.createLanguageSelector();
        
        // Zastosuj tłumaczenia
        this.applyTranslations();
        
        console.log(`🌍 Język ustawiony na: ${this.currentLang}`);
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language.substring(0, 2).toLowerCase();
        const supportedLangs = Object.keys(this.supportedLanguages);
        
        return supportedLangs.includes(browserLang) ? browserLang : 'pl';
    }

    async loadTranslations() {
        try {
            // Zawsze załaduj polski jako fallback
            if (!this.translations['pl']) {
                const plResponse = await fetch('lang/pl.json');
                this.translations['pl'] = await plResponse.json();
            }
            
            // Załaduj wybrany język jeśli nie jest polski
            if (this.currentLang !== 'pl' && !this.translations[this.currentLang]) {
                const response = await fetch(`lang/${this.currentLang}.json`);
                this.translations[this.currentLang] = await response.json();
            }
        } catch (error) {
            console.error('❌ Błąd ładowania tłumaczeń:', error);
            this.currentLang = 'pl'; // Fallback do polskiego
        }
    }

    // Główna funkcja tłumaczenia
    t(key, variables = {}) {
        const translation = this.getTranslation(key);
        
        // Interpolacja zmiennych
        return this.interpolate(translation, variables);
    }

    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLang];
        
        // Przejdź przez hierarchię kluczy
        for (const k of keys) {
            if (translation && typeof translation === 'object' && translation[k] !== undefined) {
                translation = translation[k];
            } else {
                // Fallback do polskiego
                translation = this.translations['pl'];
                for (const k2 of keys) {
                    if (translation && typeof translation === 'object' && translation[k2] !== undefined) {
                        translation = translation[k2];
                    } else {
                        console.warn(`⚠️ Brak tłumaczenia dla klucza: ${key}`);
                        return key; // Zwróć klucz jeśli nie ma tłumaczenia
                    }
                }
                break;
            }
        }
        
        return typeof translation === 'string' ? translation : key;
    }

    interpolate(text, variables) {
        if (typeof text !== 'string') return text;
        
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    async changeLanguage(newLang) {
        if (!this.supportedLanguages[newLang]) {
            console.error(`❌ Nieobsługiwany język: ${newLang}`);
            return;
        }

        this.currentLang = newLang;
        localStorage.setItem('app-language', newLang);
        
        // Załaduj tłumaczenia jeśli nie są załadowane
        await this.loadTranslations();
        
        // Zastosuj nowe tłumaczenia
        this.applyTranslations();
        
        // Aktualizuj przełącznik
        this.updateLanguageSelector();
        
        console.log(`🌍 Język zmieniony na: ${newLang}`);
    }

    createLanguageSelector() {
        const topBar = document.getElementById('top-bar');
        if (!topBar) return;

        // Sprawdź czy przełącznik już istnieje
        if (document.getElementById('language-selector')) return;

        // Znajdź lub utwórz drugi rząd menu
        let secondRow = topBar.querySelector('.menu-row-2');
        if (!secondRow) {
            secondRow = document.createElement('div');
            secondRow.className = 'menu-row-2';
            topBar.appendChild(secondRow);
        }

        const selector = document.createElement('select');
        selector.id = 'language-selector';
        selector.style.cssText = `
            background: #101f13;
            color: #93ffd2;
            border: 1.6px solid #13fd87;
            border-radius: 6px;
            padding: 3px 8px;
            margin-left: 6px;
            cursor: pointer;
            font-size: 0.9em;
            font-family: inherit;
        `;

        // Dodaj opcje języków
        Object.entries(this.supportedLanguages).forEach(([code, info]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${info.flag} ${info.name}`;
            if (code === this.currentLang) {
                option.selected = true;
            }
            selector.appendChild(option);
        });

        // Event listener
        selector.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Dodaj do drugiej linii menu
        secondRow.appendChild(selector);
    }

    updateLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLang;
        }
    }

    applyTranslations() {
        // Aktualizuj tytuł strony
        document.title = this.t('app.title');

        // Aktualizuj elementy z data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Aktualizuj elementy z data-i18n-html (dla HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });

        // Powiadom inne moduły o zmianie języka
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLang } 
        }));
    }

    // Metoda pomocnicza do formatowania liczb zgodnie z locale
    formatNumber(num, options = {}) {
        const locale = this.currentLang === 'pl' ? 'pl-PL' : 'en-US';
        return new Intl.NumberFormat(locale, {
            maximumFractionDigits: 2,
            ...options
        }).format(num);
    }

    // Metoda pomocnicza do formatowania dat
    formatDate(date, options = {}) {
        const locale = this.currentLang === 'pl' ? 'pl-PL' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        }).format(date);
    }
}

// Inicjalizacja globalnego managera języków
window.languageManager = new LanguageManager();

// Globalna funkcja tłumaczenia dla wygody
window.t = (key, variables) => window.languageManager.t(key, variables);

console.log('✅ LanguageManager załadowany');
