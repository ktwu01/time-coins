// ========================================
// INTERNATIONALIZATION (i18n) SYSTEM
// ========================================

const translations = {
    en: {
        title: "Time Coins",
        subtitle: "Transform every moment into golden value",
        settings: {
            title: "Configuration",
            timezone: "Time Zone",
            currency: "Currency", 
            hourlyRate: "Hourly Rate",
            startTime: "Work Start Time",
            workHours: "Daily Work Hours",
            updateButton: "Update Settings"
        },
        dashboard: {
            valueGenerator: "Value Generator",
            initializing: "Initializing...",
            dailyProgress: "Daily Progress",
            earnedToday: "Earned Today",
            dailyTarget: "Daily Target",
            timeWorking: "Time Working"
        },
        footer: {
            text: "Transform your time into value • Built with elegance"
        },
        status: {
            workStartsIn: "Work starts in",
            workingFor: "Working for", 
            workComplete: "Work day complete! 🎉"
        },
        milestones: {
            first: "🎉 First milestone achieved!",
            great: "🚀 Great progress milestone!",
            excellent: "💎 Excellent performance!",
            target: "🏅 Daily target achieved!",
            outstanding: "👑 Outstanding achievement!",
            legendary: "🏆 Legendary performance!",
            working: "🎯 Working towards your first milestone!",
            nextMilestone: "Next milestone:",
            toReach: "to reach",
            allComplete: "🌟 All milestones completed! You're a champion!"
        },
        errors: {
            saveSettings: "Failed to save settings. Please try again.",
            loadSettings: "Failed to load settings. Using defaults.",
            invalidInput: "Please enter valid values.",
            cacheUnavailable: "Browser storage unavailable. Settings won't be saved."
        },
        salary: {
            mySalary: "My Real-Time Salary",
            monthlyTotal: "Monthly Total Income",
            monthlyProgress: "Monthly Salary Progress",
            baseIncome: "Base Salary Income",
            workDays: "Work Days This Month",
            overtimeIncome: "Overtime Bonus Income",
            overtimeDays: "Overtime Days This Month",
            todayEarnings: "Today's Earnings",
            perSecond: "Per Second Income",
            perMinute: "Per Minute Income",
            perHour: "Per Hour Income",
            perDay: "Per Workday Income",
            monthLeft: "Remaining This Month",
            days: "days"
        },
        success: {
            settingsSaved: "Settings saved successfully!",
            settingsUpdated: "Settings updated!"
        }
    },
    zh: {
        title: "时间硬币",
        subtitle: "将每一刻都转化为黄金价值",
        settings: {
            title: "配置设置",
            timezone: "时区",
            currency: "货币",
            hourlyRate: "时薪",
            startTime: "工作开始时间", 
            workHours: "每日工作小时",
            updateButton: "更新设置"
        },
        dashboard: {
            valueGenerator: "价值生成器",
            initializing: "初始化中...",
            dailyProgress: "每日进度",
            earnedToday: "今日收入",
            dailyTarget: "每日目标",
            timeWorking: "工作时间"
        },
        footer: {
            text: "将时间转化为价值 • 精心打造"
        },
        status: {
            workStartsIn: "工作将在",
            workingFor: "已工作",
            workComplete: "今日工作完成！🎉"
        },
        milestones: {
            first: "🎉 达成首个里程碑！",
            great: "🚀 进度里程碑达成！",
            excellent: "💎 卓越表现！",
            target: "🏅 每日目标达成！",
            outstanding: "👑 杰出成就！",
            legendary: "🏆 传奇表现！",
            working: "🎯 正在努力达成第一个里程碑！",
            nextMilestone: "下一个里程碑：",
            toReach: "即可达到",
            allComplete: "🌟 所有里程碑都已完成！你是冠军！"
        },
        errors: {
            saveSettings: "保存设置失败，请重试。",
            loadSettings: "加载设置失败，使用默认设置。",
            invalidInput: "请输入有效值。",
            cacheUnavailable: "浏览器存储不可用，设置将不会被保存。"
        },
        salary: {
            mySalary: "我的实时工资",
            monthlyTotal: "本月累计收入",
            monthlyProgress: "本月薪资进度",
            baseIncome: "基本工资收入",
            workDays: "本月工作天数",
            overtimeIncome: "加班福利收入",
            overtimeDays: "本月加班天数",
            todayEarnings: "今日入账工资",
            perSecond: "每秒收入",
            perMinute: "每分钟收入",
            perHour: "每小时收入",
            perDay: "每工作日收入",
            monthLeft: "本月剩余",
            days: "天"
        },
        success: {
            settingsSaved: "设置保存成功！",
            settingsUpdated: "设置已更新！"
        }
    }
};

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.init();
    }

    init() {
        // Load saved language or detect browser language
        const savedLanguage = window.cacheManager?.loadLanguage();
        const browserLanguage = this.detectBrowserLanguage();
        
        this.currentLanguage = savedLanguage || browserLanguage;
        
        console.log('I18n initialized with language:', this.currentLanguage);
        this.updateLanguageButtons();
        this.setupLanguageSwitcher();
    }

    /**
     * Detect browser language
     * @returns {string} - Language code
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        
        // Check if we support this language
        if (browserLang.startsWith('zh')) {
            return 'zh';
        }
        
        // Default to English for unsupported languages
        return 'en';
    }

    /**
     * Get nested translation value
     * @param {string} key - Translation key (e.g., 'settings.title')
     * @param {string} lang - Language code (optional)
     * @returns {string} - Translated text
     */
    t(key, lang = this.currentLanguage) {
        try {
            const keys = key.split('.');
            let value = translations[lang];
            
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    throw new Error(`Translation key not found: ${key}`);
                }
            }
            
            if (typeof value === 'string') {
                return value;
            } else {
                throw new Error(`Translation value is not a string: ${key}`);
            }
        } catch (error) {
            console.warn(`Translation error for key "${key}":`, error.message);
            
            // Try fallback language
            if (lang !== this.fallbackLanguage) {
                return this.t(key, this.fallbackLanguage);
            }
            
            // Return key as fallback
            return key;
        }
    }

    /**
     * Switch to a different language
     * @param {string} language - Language code
     */
    switchLanguage(language) {
        if (!translations[language]) {
            console.error(`Language not supported: ${language}`);
            return;
        }

        this.currentLanguage = language;
        
        // Save to cache
        window.cacheManager?.saveLanguage(language);
        
        // Update UI
        this.updateLanguageButtons();
        this.updateAllTranslations();
        
        // Update page metadata
        this.updatePageMetadata();
        
        console.log('Language switched to:', language);
    }

    /**
     * Update all translation elements on the page
     */
    updateAllTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Handle different element types
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    /**
     * Update language switcher buttons
     */
    updateLanguageButtons() {
        const buttons = document.querySelectorAll('.language-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }

    /**
     * Setup language switcher event listeners
     */
    setupLanguageSwitcher() {
        const buttons = document.querySelectorAll('.language-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const language = btn.dataset.lang;
                this.switchLanguage(language);
                
                // Trigger custom event for other components
                this.dispatchLanguageChangeEvent(language);
            });
        });
    }

    /**
     * Update page metadata based on current language
     */
    updatePageMetadata() {
        const title = this.t('title');
        const titleElement = document.getElementById('pageTitle');
        
        if (titleElement) {
            titleElement.textContent = `${title} - Elegant Edition`;
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    /**
     * Dispatch language change event
     * @param {string} language - New language code
     */
    dispatchLanguageChangeEvent(language) {
        const event = new CustomEvent('languageChanged', {
            detail: { 
                language: language,
                previousLanguage: this.currentLanguage
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get available languages
     * @returns {Array} - Array of language objects
     */
    getAvailableLanguages() {
        return Object.keys(translations).map(code => ({
            code,
            name: translations[code].title || code.toUpperCase(),
            isActive: code === this.currentLanguage
        }));
    }

    /**
     * Format message with variables
     * @param {string} key - Translation key
     * @param {Object} variables - Variables to interpolate
     * @returns {string} - Formatted message
     */
    formatMessage(key, variables = {}) {
        let message = this.t(key);
        
        Object.keys(variables).forEach(variable => {
            const placeholder = `{${variable}}`;
            message = message.replace(new RegExp(placeholder, 'g'), variables[variable]);
        });
        
        return message;
    }

    /**
     * Get current language code
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if a language is supported
     * @param {string} language - Language code to check
     * @returns {boolean} - Support status
     */
    isLanguageSupported(language) {
        return language in translations;
    }
}

// Create global i18n manager instance
window.i18n = new I18nManager();

// Add global translation function for convenience
window.t = (key, variables) => {
    if (variables) {
        return window.i18n.formatMessage(key, variables);
    }
    return window.i18n.t(key);
};