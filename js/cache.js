// ========================================
// CACHE MANAGEMENT SYSTEM
// ========================================

class CacheManager {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            // Test localStorage availability
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this.initialized = true;
            console.log('Cache system initialized successfully');
        } catch (error) {
            console.warn('localStorage not available, cache disabled:', error);
            this.initialized = false;
        }
    }

    /**
     * Save settings with version control and expiry
     * @param {Object} settingsToSave - Settings object to save
     * @returns {boolean} - Success status
     */
    saveSettings(settingsToSave) {
        if (!this.initialized) {
            console.warn('Cache not available, settings not saved');
            return false;
        }

        try {
            const dataToSave = {
                ...settingsToSave,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(dataToSave));
            localStorage.setItem(CACHE_KEYS.LAST_SAVED, new Date().toISOString());
            
            console.log('Settings saved successfully:', dataToSave);
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.clearOldCache();
                // Try again after clearing
                try {
                    localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(dataToSave));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save settings after cache clear:', retryError);
                }
            }
            
            return false;
        }
    }

    /**
     * Load settings with expiry check
     * @returns {Object|null} - Loaded settings or null if not found/expired
     */
    loadSettings() {
        if (!this.initialized) {
            console.warn('Cache not available, using default settings');
            return null;
        }

        try {
            const savedData = localStorage.getItem(CACHE_KEYS.SETTINGS);
            if (!savedData) {
                console.log('No cached settings found');
                return null;
            }

            const parsedData = JSON.parse(savedData);
            
            // Check if cache is expired
            const expiryTime = Date.now() - (CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
            if (parsedData.timestamp && parsedData.timestamp > expiryTime) {
                console.log('Settings loaded from cache:', parsedData);
                return parsedData;
            } else {
                console.log('Cached settings expired, using defaults');
                this.clearSettings();
                return null;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Clear corrupted cache
            this.clearSettings();
            return null;
        }
    }

    /**
     * Save language preference
     * @param {string} language - Language code
     */
    saveLanguage(language) {
        if (!this.initialized) return;
        
        try {
            localStorage.setItem(CACHE_KEYS.LANGUAGE, language);
            console.log('Language saved:', language);
        } catch (error) {
            console.error('Failed to save language:', error);
        }
    }

    /**
     * Load language preference
     * @returns {string|null} - Language code or null
     */
    loadLanguage() {
        if (!this.initialized) return null;
        
        try {
            return localStorage.getItem(CACHE_KEYS.LANGUAGE);
        } catch (error) {
            console.error('Failed to load language:', error);
            return null;
        }
    }

    /**
     * Clear specific settings cache
     */
    clearSettings() {
        if (!this.initialized) return;
        
        try {
            localStorage.removeItem(CACHE_KEYS.SETTINGS);
            localStorage.removeItem(CACHE_KEYS.LAST_SAVED);
            console.log('Settings cache cleared');
        } catch (error) {
            console.error('Failed to clear settings cache:', error);
        }
    }

    /**
     * Clear all cache
     */
    clearCache() {
        if (!this.initialized) return;
        
        try {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('All cache cleared');
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    /**
     * Clear old cache entries to free up space
     */
    clearOldCache() {
        if (!this.initialized) return;
        
        try {
            const keys = Object.keys(localStorage);
            const oldKeys = keys.filter(key => {
                if (key.startsWith('timeCoins_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                        return data.timestamp && data.timestamp < monthAgo;
                    } catch {
                        return true; // Remove corrupted entries
                    }
                }
                return false;
            });
            
            oldKeys.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared ${oldKeys.length} old cache entries`);
        } catch (error) {
            console.error('Failed to clear old cache:', error);
        }
    }

    /**
     * Get cache information for debugging
     * @returns {Object} - Cache statistics
     */
    getCacheInfo() {
        if (!this.initialized) {
            return {
                available: false,
                reason: 'localStorage not available'
            };
        }

        try {
            const lastSaved = localStorage.getItem(CACHE_KEYS.LAST_SAVED);
            const hasSettings = localStorage.getItem(CACHE_KEYS.SETTINGS) !== null;
            const hasLanguage = localStorage.getItem(CACHE_KEYS.LANGUAGE) !== null;
            
            // Calculate approximate storage usage
            let totalSize = 0;
            Object.values(CACHE_KEYS).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                }
            });
            
            return {
                available: true,
                lastSaved: lastSaved ? new Date(lastSaved) : null,
                hasSettings,
                hasLanguage,
                approximateSize: totalSize,
                expiryDate: lastSaved ? 
                    new Date(new Date(lastSaved).getTime() + (CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)) : 
                    null
            };
        } catch (error) {
            console.error('Failed to get cache info:', error);
            return {
                available: false,
                reason: 'Error accessing cache'
            };
        }
    }

    /**
     * Auto-save with debouncing
     * @param {Object} settings - Settings to save
     * @param {number} delay - Delay in milliseconds
     */
    autoSave(settings, delay = CONFIG.AUTO_SAVE_DELAY) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveSettings(settings);
            console.log('Auto-save completed');
        }, delay);
    }

    /**
     * Check if cache is healthy
     * @returns {boolean} - Health status
     */
    isHealthy() {
        if (!this.initialized) return false;
        
        try {
            // Test write and read
            const testKey = '__health_check__';
            const testValue = Date.now().toString();
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            return retrieved === testValue;
        } catch (error) {
            console.error('Cache health check failed:', error);
            return false;
        }
    }
}

// Create global cache manager instance
window.cacheManager = new CacheManager();