// ========================================
// CURRENCY MANAGEMENT SYSTEM
// ========================================

class CurrencyManager {
    constructor() {
        this.currencies = [];
        this.fallbackCurrencies = [
            { symbol: '$', code: 'USD', name: 'US Dollar', nameCN: '美元', flag: '🇺🇸' },
            { symbol: '€', code: 'EUR', name: 'Euro', nameCN: '欧元', flag: '🇪🇺' },
            { symbol: '£', code: 'GBP', name: 'British Pound', nameCN: '英镑', flag: '🇬🇧' },
            { symbol: '¥', code: 'JPY', name: 'Japanese Yen', nameCN: '日元', flag: '🇯🇵' },
            { symbol: '¥', code: 'CNY', name: 'Chinese Yuan', nameCN: '人民币', flag: '🇨🇳' },
            { symbol: '₹', code: 'INR', name: 'Indian Rupee', nameCN: '印度卢比', flag: '🇮🇳' },
            { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', nameCN: '加元', flag: '🇨🇦' },
            { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', nameCN: '澳元', flag: '🇦🇺' },
            { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc', nameCN: '瑞士法郎', flag: '🇨🇭' },
            { symbol: 'kr', code: 'SEK', name: 'Swedish Krona', nameCN: '瑞典克朗', flag: '🇸🇪' },
            { symbol: 'kr', code: 'NOK', name: 'Norwegian Krone', nameCN: '挪威克朗', flag: '🇳🇴' },
            { symbol: 'kr', code: 'DKK', name: 'Danish Krone', nameCN: '丹麦克朗', flag: '🇩🇰' },
            { symbol: 'zł', code: 'PLN', name: 'Polish Złoty', nameCN: '波兰兹罗提', flag: '🇵🇱' },
            { symbol: 'Kč', code: 'CZK', name: 'Czech Koruna', nameCN: '捷克克朗', flag: '🇨🇿' },
            { symbol: '₽', code: 'RUB', name: 'Russian Ruble', nameCN: '俄罗斯卢布', flag: '🇷🇺' },
            { symbol: '₩', code: 'KRW', name: 'South Korean Won', nameCN: '韩元', flag: '🇰🇷' },
            { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar', nameCN: '新加坡元', flag: '🇸🇬' },
            { symbol: 'HK$', code: 'HKD', name: 'Hong Kong Dollar', nameCN: '港币', flag: '🇭🇰' },
            { symbol: 'NT$', code: 'TWD', name: 'Taiwan Dollar', nameCN: '新台币', flag: '🇹🇼' },
            { symbol: '฿', code: 'THB', name: 'Thai Baht', nameCN: '泰铢', flag: '🇹🇭' },
            { symbol: 'Rp', code: 'IDR', name: 'Indonesian Rupiah', nameCN: '印尼盾', flag: '🇮🇩' },
            { symbol: 'RM', code: 'MYR', name: 'Malaysian Ringgit', nameCN: '马来西亚林吉特', flag: '🇲🇾' },
            { symbol: '₱', code: 'PHP', name: 'Philippine Peso', nameCN: '菲律宾比索', flag: '🇵🇭' },
            { symbol: '₪', code: 'ILS', name: 'Israeli Shekel', nameCN: '以色列谢克尔', flag: '🇮🇱' },
            { symbol: 'AED', code: 'AED', name: 'UAE Dirham', nameCN: '阿联酋迪拉姆', flag: '🇦🇪' },
            { symbol: 'SAR', code: 'SAR', name: 'Saudi Riyal', nameCN: '沙特里亚尔', flag: '🇸🇦' },
            { symbol: 'R', code: 'ZAR', name: 'South African Rand', nameCN: '南非兰特', flag: '🇿🇦' },
            { symbol: 'R$', code: 'BRL', name: 'Brazilian Real', nameCN: '巴西雷亚尔', flag: '🇧🇷' },
            { symbol: '$', code: 'MXN', name: 'Mexican Peso', nameCN: '墨西哥比索', flag: '🇲🇽' },
            { symbol: '$', code: 'ARS', name: 'Argentine Peso', nameCN: '阿根廷比索', flag: '🇦🇷' },
            { symbol: '₺', code: 'TRY', name: 'Turkish Lira', nameCN: '土耳其里拉', flag: '🇹🇷' },
            { symbol: '₴', code: 'UAH', name: 'Ukrainian Hryvnia', nameCN: '乌克兰格里夫纳', flag: '🇺🇦' },
            { symbol: 'NZ$', code: 'NZD', name: 'New Zealand Dollar', nameCN: '新西兰元', flag: '🇳🇿' }
        ];
        this.initialized = false;
    }

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

    async loadCurrencies() {
        try {
            const response = await fetch('./data/currencies.json');
            if (response.ok) {
                this.currencies = await response.json();
                console.log('Currencies loaded from external file');
                return;
            }
            throw new Error('External currency file not available');
        } catch (error) {
            console.warn('Could not load external currencies:', error.message);
            this.loadFallbackCurrencies();
        }
    }

    loadFallbackCurrencies() {
        this.currencies = [...this.fallbackCurrencies];
        console.log('Using fallback currency list');
    }

    populateCurrencySelect() {
        const currencySelect = document.getElementById('currency');
        if (!currencySelect) {
            console.error('Currency select element not found');
            return;
        }

        currencySelect.innerHTML = '';
        const currentLanguage = window.i18n ? window.i18n.getCurrentLanguage() : 'en';

        this.currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.symbol;
            
            const displayName = currentLanguage === 'zh' && currency.nameCN ? 
                currency.nameCN : currency.name;
            
            option.textContent = `${currency.flag} ${currency.symbol} ${currency.code} - ${displayName}`;
            option.setAttribute('data-code', currency.code);
            option.setAttribute('data-flag', currency.flag);
            option.setAttribute('data-name', currency.name);
            option.setAttribute('data-name-cn', currency.nameCN || currency.name);
            currencySelect.appendChild(option);
        });

        const defaultCurrency = CONFIG.DEFAULT_SETTINGS.currency;
        const defaultOption = Array.from(currencySelect.options).find(
            option => option.value === defaultCurrency
        );
        
        if (defaultOption) {
            currencySelect.value = defaultCurrency;
        } else {
            currencySelect.selectedIndex = 0;
        }

        console.log(`Currency select populated with ${this.currencies.length} currencies (${currentLanguage})`);
    }

    getCurrencyBySymbol(symbol) {
        return this.currencies.find(currency => currency.symbol === symbol) || null;
    }

    getCurrencyByCode(code) {
        return this.currencies.find(currency => currency.code === code) || null;
    }

    formatAmount(amount, currencySymbol, options = {}) {
        const { decimals = 2, showSymbol = true, locale = 'en-US' } = options;

        try {
            const currency = this.getCurrencyBySymbol(currencySymbol);
            
            if (currency && currency.code) {
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

        const formattedAmount = amount.toFixed(decimals);
        return showSymbol ? `${currencySymbol}${formattedAmount}` : formattedAmount;
    }

    getCurrencyByLocation() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            const locationCurrencyMap = {
                'America/New_York': 'USD', 'America/Los_Angeles': 'USD', 'America/Chicago': 'USD',
                'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
                'Europe/London': 'GBP', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR',
                'Europe/Rome': 'EUR', 'Europe/Madrid': 'EUR',
                'Asia/Tokyo': 'JPY', 'Asia/Shanghai': 'CNY', 'Asia/Hong_Kong': 'HKD',
                'Asia/Singapore': 'SGD', 'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD'
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

    updateLanguageDisplay() {
        this.populateCurrencySelect();
        console.log('Currency display updated for language change');
    }

    isReady() {
        return this.initialized && this.currencies.length > 0;
    }

    getStats() {
        return {
            totalCurrencies: this.currencies.length,
            initialized: this.initialized,
            hasFallback: this.currencies === this.fallbackCurrencies
        };
    }
}

// Create global currency manager instance
window.currencyManager = new CurrencyManager();