// ========================================
// CURRENCY MANAGEMENT SYSTEM
// ========================================

class CurrencyManager {
    constructor() {
        this.currencies = [];
        this.fallbackCurrencies = [
            { symbol: '$', code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
            { symbol: '€', code: 'EUR', name: 'Euro', flag: '🇪🇺' },
            { symbol: '£', code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
            { symbol: '¥', code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
            { symbol: '¥', code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
            { symbol: '₹', code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
            { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
            { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
            { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
            { symbol: 'kr', code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
            { symbol: 'kr', code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
            { symbol: 'kr', code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
            { symbol: 'zł', code: 'PLN', name: 'Polish Złoty', flag: '🇵🇱' },
            { symbol: 'Kč', code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
            { symbol: '₽', code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
            { symbol: '₩', code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
            { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
            { symbol: 'HK$', code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
            { symbol: 'NT$', code: 'TWD', name: 'Taiwan Dollar', flag: '🇹🇼' },
            { symbol: '฿', code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
            { symbol: 'Rp', code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
            { symbol: 'RM', code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
            { symbol: '₱', code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
            { symbol: '₪', code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱' },
            { symbol: 'AED', code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
            { symbol: 'SAR', code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
            { symbol: 'R', code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
            { symbol: 'R$', code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
            { symbol: '$', code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
            { symbol: '$', code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷' }
        ];
        this.initialized = false;
    }

    /**
     * Initialize currency system
     */
    async init() {
        try {
            await this.loadCurrencies();
            this.populateCurrencySelect();
            this.initialized = true;
            console.log('Currency system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize currency system:', error);
            this.loadFallbackCurrencies();
            this.initialized = true;
        }
    }

    /**
     * Load currencies from external file or API
     */
    async loadCurrencies() {
        try {
            // Try to load from external JSON file first
            const response = await fetch('./data/currencies.json');
            if (response.ok) {
                this.currencies = await response.json();
                console.log('Currencies loaded from external file');
                return;
            }
            throw new Error('External currency file not available');
        } catch (error) {
            console.warn('Could not load external currencies:', error.message);
            // Use fallback currencies
            this.loadFallbackCurrencies();
        }
    }

    /**
     * Load fallback currency list
     */
    loadFallbackCurrencies() {
        this.currencies = [...this.fallbackCurrencies];
        console.log('Using fallback currency list');
    }

    /**
     * Populate currency select dropdown
     */
    populateCurrencySelect() {
        const currencySelect = document.getElementById('currency');
        if (!currencySelect) {
            console.error('Currency select element not found');
            return;
        }

        // Clear existing options
        currencySelect.innerHTML = '';

        // Add currencies to select
        this.currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.symbol;
            option.textContent = `${currency.flag} ${currency.symbol} ${currency.code} - ${currency.name}`;
            option.setAttribute('data-code', currency.code);
            option.setAttribute('data-flag', currency.flag);
            option.setAttribute('data-name', currency.name);
            currencySelect.appendChild(option);
        });

        // Set default selection
        const defaultCurrency = CONFIG.DEFAULT_SETTINGS.currency;
        const defaultOption = Array.from(currencySelect.options).find(
            option => option.value === defaultCurrency
        );
        
        if (defaultOption) {
            currencySelect.value = defaultCurrency;
        } else {
            // Fallback to first option
            currencySelect.selectedIndex = 0;
        }

        console.log(`Currency select populated with ${this.currencies.length} currencies`);
    }

    /**
     * Get currency information by symbol
     * @param {string} symbol - Currency symbol
     * @returns {Object|null} - Currency object or null
     */
    getCurrencyBySymbol(symbol) {
        return this.currencies.find(currency => currency.symbol === symbol) || null;
    }

    /**
     * Get currency information by code
     * @param {string} code - Currency code (e.g., 'USD')
     * @returns {Object|null} - Currency object or null
     */
    getCurrencyByCode(code) {
        return this.currencies.find(currency => currency.code === code) || null;
    }

    /**
     * Format amount with currency
     * @param {number} amount - Amount to format
     * @param {string} currencySymbol - Currency symbol
     * @param {Object} options - Formatting options
     * @returns {string} - Formatted currency string
     */
    formatAmount(amount, currencySymbol, options = {}) {
        const {
            decimals = 2,
            showSymbol = true,
            locale = 'en-US'
        } = options;

        try {
            const currency = this.getCurrencyBySymbol(currencySymbol);
            
            if (currency && currency.code) {
                // Use Intl.NumberFormat for proper localization
                const formatter = new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currency.code,
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
                
                return formatter.format(amount);
            }
        } catch (error) {
            console.warn('Failed to format with Intl.NumberFormat:', error);
        }

        // Fallback formatting
        const formattedAmount = amount.toFixed(decimals);
        return showSymbol ? `${currencySymbol}${formattedAmount}` : formattedAmount;
    }

    /**
     * Get all available currencies
     * @returns {Array} - Array of currency objects
     */
    getAllCurrencies() {
        return [...this.currencies];
    }

    /**
     * Search currencies by name or code
     * @param {string} query - Search query
     * @returns {Array} - Matching currencies
     */
    searchCurrencies(query) {
        if (!query || query.length < 2) {
            return this.currencies;
        }

        const searchTerm = query.toLowerCase();
        return this.currencies.filter(currency => 
            currency.name.toLowerCase().includes(searchTerm) ||
            currency.code.toLowerCase().includes(searchTerm) ||
            currency.symbol.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Get popular currencies (subset of most commonly used)
     * @returns {Array} - Popular currencies
     */
    getPopularCurrencies() {
        const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD'];
        return this.currencies.filter(currency => 
            popularCodes.includes(currency.code)
        );
    }

    /**
     * Validate currency symbol
     * @param {string} symbol - Currency symbol to validate
     * @returns {boolean} - Validation result
     */
    isValidCurrency(symbol) {
        return this.currencies.some(currency => currency.symbol === symbol);
    }

    /**
     * Get currency by user's location (simplified)
     * @returns {Object|null} - Currency object based on location
     */
    getCurrencyByLocation() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            // Simple mapping of timezones to currencies
            const locationCurrencyMap = {
                'America/New_York': 'USD',
                'America/Los_Angeles': 'USD',
                'America/Chicago': 'USD',
                'America/Toronto': 'CAD',
                'America/Vancouver': 'CAD',
                'Europe/London': 'GBP',
                'Europe/Paris': 'EUR',
                'Europe/Berlin': 'EUR',
                'Europe/Rome': 'EUR',
                'Europe/Madrid': 'EUR',
                'Asia/Tokyo': 'JPY',
                'Asia/Shanghai': 'CNY',
                'Asia/Hong_Kong': 'HKD',
                'Asia/Singapore': 'SGD',
                'Australia/Sydney': 'AUD',
                'Australia/Melbourne': 'AUD'
            };

            const currencyCode = locationCurrencyMap[timezone];
            if (currencyCode) {
                return this.getCurrencyByCode(currencyCode);
            }
        } catch (error) {
            console.warn('Failed to get currency by location:', error);
        }
        
        return null;
    }

    /**
     * Update currency selection based on user preference or location
     */
    autoSelectCurrency() {
        const currencySelect = document.getElementById('currency');
        if (!currencySelect) return;

        // Try location-based selection first
        const locationCurrency = this.getCurrencyByLocation();
        if (locationCurrency) {
            currencySelect.value = locationCurrency.symbol;
            console.log('Auto-selected currency based on location:', locationCurrency.code);
            return;
        }

        // Fallback to USD
        const usdCurrency = this.getCurrencyByCode('USD');
        if (usdCurrency) {
            currencySelect.value = usdCurrency.symbol;
            console.log('Auto-selected default currency: USD');
        }
    }

    /**
     * Check if currency system is ready
     * @returns {boolean} - Ready status
     */
    isReady() {
        return this.initialized && this.currencies.length > 0;
    }

    /**
     * Get currency statistics
     * @returns {Object} - Currency system statistics
     */
    getStats() {
        return {
            totalCurrencies: this.currencies.length,
            initialized: this.initialized,
            hasFallback: this.currencies === this.fallbackCurrencies,
            popularCount: this.getPopularCurrencies().length
        };
    }
}

// Create global currency manager instance
window.currencyManager = new CurrencyManager();