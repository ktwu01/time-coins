// ========================================
// MAIN APPLICATION LOGIC
// ========================================

class TimeCoinsApp {
    constructor() {
        this.updateInterval = null;
        this.isInitialized = false;
        this.autoSaveTimeout = null;
        this.lastEarnings = 0;
        this.currentDisplayedMilestone = null;
        
        // Initialize global state if it doesn't exist
        if (!window.TimeCoinsApp) {
            window.TimeCoinsApp = {
                settings: { ...CONFIG.DEFAULT_SETTINGS },
                currentLanguage: 'en',
                lastMilestone: 0,
                currentDisplayedMilestone: null,
                coinAnimationInterval: null,
                hasUnsavedChanges: false
            };
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Time Coins App...');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize subsystems in order
            await this.initializeSubsystems();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load and apply settings
            await this.loadSettings();
            
            // Setup timezone selection
            this.setupTimezoneSelect();
            
            // Setup automatic updates
            this.startUpdateLoop();
            
            // Initial update
            this.updateDisplay();
            
            this.isInitialized = true;
            console.log('Time Coins App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all subsystems
     */
    async initializeSubsystems() {
        try {
            // Currency manager
            if (window.currencyManager) {
                await window.currencyManager.init();
            }

            // Animation manager
            if (window.animationManager) {
                window.animationManager.init();
            }

            // I18n is initialized automatically
            // Cache manager is initialized automatically
            
            console.log('All subsystems initialized');
        } catch (error) {
            console.error('Failed to initialize subsystems:', error);
            throw error;
        }
    }

    /**
     * Setup timezone select dropdown
     */
    setupTimezoneSelect() {
        const timezoneSelect = document.getElementById('timezone');
        if (!timezoneSelect) {
            console.warn('Timezone select element not found');
            return;
        }

        try {
            // Clear existing options
            timezoneSelect.innerHTML = '';

            // Group timezones by region
            const groupedTimezones = {};
            CONFIG.TIMEZONES.forEach(tz => {
                if (!groupedTimezones[tz.group]) {
                    groupedTimezones[tz.group] = [];
                }
                groupedTimezones[tz.group].push(tz);
            });

            // Add grouped options
            Object.keys(groupedTimezones).forEach(group => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = group;
                
                groupedTimezones[group].forEach(tz => {
                    const option = document.createElement('option');
                    option.value = tz.value;
                    option.textContent = tz.label;
                    optgroup.appendChild(option);
                });
                
                timezoneSelect.appendChild(optgroup);
            });

            // Set default to user's timezone
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const option = timezoneSelect.querySelector(`option[value="${userTimezone}"]`);
            if (option) {
                timezoneSelect.value = userTimezone;
                window.TimeCoinsApp.settings.timezone = userTimezone;
            }
            
            console.log('Timezone select populated successfully');
        } catch (error) {
            console.error('Failed to setup timezone select:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        try {
            // Update button
            const updateBtn = document.getElementById('updateBtn');
            if (updateBtn) {
                updateBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.updateSettings();
                });
            }

            // Settings inputs with auto-save
            const inputs = ['timezone', 'currency', 'hourlyRate', 'startTime', 'workHours'];
            inputs.forEach(inputId => {
                const element = document.getElementById(inputId);
                if (element) {
                    // Immediate change handler
                    element.addEventListener('change', () => {
                        window.TimeCoinsApp.hasUnsavedChanges = true;
                        console.log('Settings changed, marking as unsaved');
                    });
                    
                    // Auto-save with debounce
                    element.addEventListener('input', this.debounce(() => {
                        this.autoSaveSettings();
                    }, CONFIG.AUTO_SAVE_DELAY));
                }
            });

            // Language change handler
            window.addEventListener('languageChanged', (event) => {
                this.onLanguageChanged(event.detail);
            });

            // Page visibility change
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.onPageHidden();
                } else {
                    this.onPageVisible();
                }
            });

            // Before unload warning
            window.addEventListener('beforeunload', (e) => {
                if (this.shouldWarnBeforeUnload()) {
                    const message = 'You have unsaved changes or are currently working. Are you sure you want to leave?';
                    e.preventDefault();
                    e.returnValue = message;
                    return message;
                }
            });

            // Global error handler
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                this.handleError(event.error);
            });
            
            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Failed to setup event listeners:', error);
        }
    }

    /**
     * Load settings from cache or use defaults
     */
    async loadSettings() {
        try {
            const cachedSettings = window.cacheManager?.loadSettings();
            
            if (cachedSettings) {
                // Merge with defaults to ensure all properties exist
                window.TimeCoinsApp.settings = { 
                    ...CONFIG.DEFAULT_SETTINGS, 
                    ...cachedSettings 
                };
                
                // Apply to UI
                this.applySettingsToUI(window.TimeCoinsApp.settings);
                console.log('Settings loaded from cache:', window.TimeCoinsApp.settings);
            } else {
                // Use defaults
                window.TimeCoinsApp.settings = { ...CONFIG.DEFAULT_SETTINGS };
                
                // Auto-detect timezone and currency
                this.autoDetectSettings();
                
                // Save defaults
                this.saveSettings();
                console.log('Using default settings:', window.TimeCoinsApp.settings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            window.TimeCoinsApp.settings = { ...CONFIG.DEFAULT_SETTINGS };
        }
    }

    /**
     * Auto-detect user settings based on location/browser
     */
    autoDetectSettings() {
        try {
            // Auto-detect timezone
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            window.TimeCoinsApp.settings.timezone = userTimezone;

            // Auto-detect currency based on timezone/location
            if (window.currencyManager && window.currencyManager.isReady()) {
                const locationCurrency = window.currencyManager.getCurrencyByLocation();
                if (locationCurrency) {
                    window.TimeCoinsApp.settings.currency = locationCurrency.symbol;
                }
            }
            
            console.log('Auto-detection complete');
        } catch (error) {
            console.error('Failed to auto-detect settings:', error);
        }
    }

    /**
     * Apply settings to UI elements
     * @param {Object} settings - Settings object
     */
    applySettingsToUI(settings) {
        try {
            const fields = {
                'timezone': settings.timezone,
                'currency': settings.currency,
                'hourlyRate': settings.hourlyRate,
                'startTime': settings.startTime,
                'workHours': settings.workHours
            };

            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value !== undefined) {
                    element.value = value;
                }
            });
            
            console.log('Settings applied to UI');
        } catch (error) {
            console.error('Failed to apply settings to UI:', error);
        }
    }

    /**
     * Update settings from UI inputs
     */
    updateSettings() {
        try {
            // Get values from UI
            const newSettings = {
                timezone: document.getElementById('timezone')?.value || CONFIG.DEFAULT_SETTINGS.timezone,
                currency: document.getElementById('currency')?.value || CONFIG.DEFAULT_SETTINGS.currency,
                hourlyRate: parseFloat(document.getElementById('hourlyRate')?.value) || CONFIG.DEFAULT_SETTINGS.hourlyRate,
                startTime: document.getElementById('startTime')?.value || CONFIG.DEFAULT_SETTINGS.startTime,
                workHours: parseFloat(document.getElementById('workHours')?.value) || CONFIG.DEFAULT_SETTINGS.workHours
            };

            // Validate settings
            if (!this.validateSettings(newSettings)) {
                this.showError('Please enter valid values for all fields.');
                return;
            }

            // Update global settings
            window.TimeCoinsApp.settings = newSettings;
            
            // Save to cache
            const saveSuccess = this.saveSettings();
            
            // Update UI feedback
            this.showSettingsUpdateFeedback(saveSuccess);
            
            // Clear unsaved changes flag
            window.TimeCoinsApp.hasUnsavedChanges = false;
            
            // Update display immediately
            this.updateDisplay();
            
            console.log('Settings updated:', newSettings);
            
        } catch (error) {
            console.error('Failed to update settings:', error);
            this.showError('Failed to save settings. Please try again.');
        }
    }

    /**
     * Auto-save settings with debouncing
     */
    autoSaveSettings() {
        try {
            this.updateSettings();
            console.log('Auto-save completed');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    /**
     * Save settings to cache
     * @returns {boolean} - Success status
     */
    saveSettings() {
        if (window.cacheManager) {
            return window.cacheManager.saveSettings(window.TimeCoinsApp.settings);
        }
        console.warn('Cache manager not available');
        return false;
    }

    /**
     * Validate settings object
     * @param {Object} settings - Settings to validate
     * @returns {boolean} - Validation result
     */
    validateSettings(settings) {
        return (
            settings.hourlyRate > 0 &&
            settings.workHours > 0 && settings.workHours <= 24 &&
            settings.startTime && settings.startTime.match(/^\d{2}:\d{2}$/) &&
            settings.timezone && settings.currency
        );
    }

    /**
     * Show settings update feedback
     * @param {boolean} saveSuccess - Whether save was successful
     */
    showSettingsUpdateFeedback(saveSuccess) {
        const btn = document.getElementById('updateBtn');
        if (!btn) return;

        const originalHTML = btn.innerHTML;
        
        if (saveSuccess) {
            const successText = window.i18n ? window.i18n.t('success.settingsSaved') : 'Settings Saved!';
            btn.innerHTML = `<i class="fas fa-check mr-2"></i>${successText}`;
            if (window.animationManager) {
                window.animationManager.animateButton(btn, null, 2000);
            }
        } else {
            btn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Save Failed!';
            btn.classList.add('bg-red-500');
        }
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-red-500');
        }, 2000);
    }

    /**
     * Start the main update loop
     */
    startUpdateLoop() {
        // Clear any existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Start new interval
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, CONFIG.UPDATE_INTERVAL);

        console.log('Update loop started');
    }

    /**
     * Stop the main update loop
     */
    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Update loop stopped');
        }
    }

    /**
     * Main display update function
     */
    updateDisplay() {
        try {
            const earnings = this.calculateCurrentEarnings();
            const workingTime = this.calculateWorkingTime();
            const progress = this.calculateProgress();
            const dailyTarget = this.calculateDailyTarget();

            // Debug logging for troubleshooting
            console.log('Display Update:', {
                earnings: earnings.toFixed(2),
                workingTime,
                progress: progress.toFixed(1),
                dailyTarget: dailyTarget.toFixed(2)
            });

            // Update earnings display with consistent formatting
            const earningsText = this.formatCurrency(earnings);
            const earningsEl = document.getElementById('currentEarnings');
            if (earningsEl && earningsEl.textContent !== earningsText) {
                earningsEl.textContent = earningsText;
            }

            // Update daily target
            const targetText = this.formatCurrency(dailyTarget);
            const targetEl = document.getElementById('totalTarget');
            if (targetEl && targetEl.textContent !== targetText) {
                targetEl.textContent = targetText;
            }

            // Update working time
            const workingTimeText = this.formatTime(workingTime);
            const workingTimeEl = document.getElementById('workingTime');
            if (workingTimeEl && workingTimeEl.textContent !== workingTimeText) {
                workingTimeEl.textContent = workingTimeText;
            }

            // Update progress bar only if value changed significantly
            const currentProgress = Math.round(progress);
            const progressPercentEl = document.getElementById('progressPercent');
            const currentDisplayedProgress = progressPercentEl ? 
                parseInt(progressPercentEl.textContent.replace('%', '')) : 0;
            
            if (Math.abs(currentProgress - currentDisplayedProgress) >= 1) {
                const progressFill = document.getElementById('progressFill');
                if (progressFill && progressPercentEl) {
                    progressFill.style.width = `${Math.min(currentProgress, 100)}%`;
                    progressPercentEl.textContent = `${currentProgress}%`;
                }
            }

            // Update status message
            this.updateStatusMessage();

            // Check for milestones only if earnings changed significantly
            if (Math.abs(earnings - this.lastEarnings) >= 0.01) {
                this.checkMilestones(earnings);
            }

            // Store last earnings for comparison
            this.lastEarnings = earnings;

        } catch (error) {
            console.error('Error updating display:', error);
        }
    }

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @returns {string} - Formatted currency string
     */
    formatCurrency(amount) {
        try {
            if (window.currencyManager && window.currencyManager.isReady()) {
                return window.currencyManager.formatAmount(
                    amount, 
                    window.TimeCoinsApp.settings.currency
                );
            }
        } catch (error) {
            console.warn('Currency formatting failed, using fallback:', error);
        }
        
        // Fallback formatting
        return `${window.TimeCoinsApp.settings.currency}${amount.toFixed(2)}`;
    }

    /**
     * Calculate current earnings
     * @returns {number} - Current earnings amount
     */
    calculateCurrentEarnings() {
        try {
            const currentTimeStr = this.getCurrentTimeInTimezone();
            const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
            const currentTime = currentHour * 60 + currentMinute;
            
            const workStartMinutes = this.parseTimeString(window.TimeCoinsApp.settings.startTime);
            const workEndMinutes = workStartMinutes + (window.TimeCoinsApp.settings.workHours * 60);
            
            let earnings = 0;
            
            if (currentTime >= workStartMinutes && currentTime <= workEndMinutes) {
                const workingMinutes = Math.max(0, currentTime - workStartMinutes);
                earnings = (workingMinutes / 60) * window.TimeCoinsApp.settings.hourlyRate;
            } else if (currentTime > workEndMinutes) {
                earnings = window.TimeCoinsApp.settings.hourlyRate * window.TimeCoinsApp.settings.workHours;
            }
            
            // Ensure earnings are reasonable and not negative
            earnings = Math.max(0, Math.min(earnings, window.TimeCoinsApp.settings.hourlyRate * window.TimeCoinsApp.settings.workHours));
            
            return earnings;
        } catch (error) {
            console.error('Error calculating earnings:', error);
            return 0;
        }
    }

    /**
     * Calculate working time in minutes
     * @returns {number} - Working time in minutes
     */
    calculateWorkingTime() {
        try {
            const currentTimeStr = this.getCurrentTimeInTimezone();
            const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
            const currentTime = currentHour * 60 + currentMinute;
            
            const workStartMinutes = this.parseTimeString(window.TimeCoinsApp.settings.startTime);
            const workEndMinutes = workStartMinutes + (window.TimeCoinsApp.settings.workHours * 60);
            
            let workingMinutes = 0;
            
            if (currentTime < workStartMinutes) {
                workingMinutes = 0;
            } else if (currentTime <= workEndMinutes) {
                workingMinutes = Math.max(0, currentTime - workStartMinutes);
            } else {
                workingMinutes = window.TimeCoinsApp.settings.workHours * 60;
            }
            
            // Ensure working time is reasonable
            workingMinutes = Math.max(0, Math.min(workingMinutes, window.TimeCoinsApp.settings.workHours * 60));
            
            return workingMinutes;
        } catch (error) {
            console.error('Error calculating working time:', error);
            return 0;
        }
    }

    /**
     * Calculate progress percentage
     * @returns {number} - Progress percentage (0-100)
     */
    calculateProgress() {
        try {
            const workingMinutes = this.calculateWorkingTime();
            const totalWorkMinutes = window.TimeCoinsApp.settings.workHours * 60;
            return Math.min(100, (workingMinutes / totalWorkMinutes) * 100);
        } catch (error) {
            console.error('Error calculating progress:', error);
            return 0;
        }
    }

    /**
     * Calculate daily target amount
     * @returns {number} - Daily target earnings
     */
    calculateDailyTarget() {
        return window.TimeCoinsApp.settings.hourlyRate * window.TimeCoinsApp.settings.workHours;
    }

    /**
     * Update status message display
     */
    updateStatusMessage() {
        try {
            const currentTimeStr = this.getCurrentTimeInTimezone();
            const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
            const currentTime = currentHour * 60 + currentMinute;
            
            const workStartMinutes = this.parseTimeString(window.TimeCoinsApp.settings.startTime);
            const workEndMinutes = workStartMinutes + (window.TimeCoinsApp.settings.workHours * 60);
            
            let statusMessage = '';
            
            if (currentTime < workStartMinutes) {
                const minutesUntilWork = workStartMinutes - currentTime;
                const statusKey = window.i18n ? 'status.workStartsIn' : 'Work starts in';
                const statusText = window.i18n ? window.i18n.t(statusKey) : statusKey;
                statusMessage = `${statusText} ${this.formatTime(minutesUntilWork)}`;
            } else if (currentTime <= workEndMinutes) {
                const workingMinutes = currentTime - workStartMinutes;
                const statusKey = window.i18n ? 'status.workingFor' : 'Working for';
                const statusText = window.i18n ? window.i18n.t(statusKey) : statusKey;
                statusMessage = `${statusText} ${this.formatTime(workingMinutes)}`;
            } else {
                const statusKey = window.i18n ? 'status.workComplete' : 'Work day complete! 🎉';
                statusMessage = window.i18n ? window.i18n.t(statusKey) : statusKey;
            }
            
            const timeZoneAbbr = new Date().toLocaleTimeString("en-US", {
                timeZone: window.TimeCoinsApp.settings.timezone,
                timeZoneName: 'short'
            }).split(' ').pop();
            
            const timeDisplayEl = document.getElementById('timeDisplay');
            if (timeDisplayEl) {
                timeDisplayEl.innerHTML = `
                    <div class="text-lg font-semibold text-white">${statusMessage}</div>
                    <div class="text-sm text-gray-400 mt-1">${currentTimeStr} ${timeZoneAbbr}</div>
                `;
            }
        } catch (error) {
            console.error('Error updating status message:', error);
        }
    }

    /**
     * Check and handle milestones
     * @param {number} earnings - Current earnings
     */
    checkMilestones(earnings) {
        try {
            // Only check milestones if earnings are positive and reasonable
            if (earnings <= 0 || earnings > 10000) {
                const milestoneEl = document.getElementById('milestone');
                if (milestoneEl) {
                    milestoneEl.classList.add('hidden');
                }
                return;
            }

            // Find the highest achieved milestone
            const achievedMilestone = CONFIG.MILESTONES
                .filter(m => earnings >= m.amount)
                .sort((a, b) => b.amount - a.amount)[0]; // Get highest achieved
            
            // Only update milestone display if it's different from current
            const shouldUpdateMilestone = !this.currentDisplayedMilestone || 
                (achievedMilestone && achievedMilestone.amount !== this.currentDisplayedMilestone.amount) ||
                (!achievedMilestone && this.currentDisplayedMilestone);

            if (shouldUpdateMilestone) {
                if (achievedMilestone) {
                    console.log('Milestone achieved:', achievedMilestone.amount, 'Current earnings:', earnings.toFixed(2));
                    this.displayMilestone(achievedMilestone, earnings);
                    
                    // Only trigger celebration if this is a NEW milestone
                    if (!this.currentDisplayedMilestone || 
                        achievedMilestone.amount > this.currentDisplayedMilestone.amount) {
                        if (window.animationManager) {
                            window.animationManager.celebrateMilestone(achievedMilestone.amount);
                        }
                    }
                    
                    this.currentDisplayedMilestone = achievedMilestone;
                } else {
                    // Show progress towards first milestone
                    this.showMilestoneProgress(earnings);
                    this.currentDisplayedMilestone = null;
                }
            }
        } catch (error) {
            console.error('Error checking milestones:', error);
        }
    }

    /**
     * Display milestone achievement
     * @param {Object} milestone - Milestone object
     * @param {number} currentEarnings - Current earnings
     */
    displayMilestone(milestone, currentEarnings) {
        try {
            const milestoneEl = document.getElementById('milestone');
            const milestoneTextEl = document.getElementById('milestoneText');
            const milestoneProgressEl = document.getElementById('milestoneProgress');
            
            if (!milestoneEl || !milestoneTextEl || !milestoneProgressEl) return;

            const milestoneKey = window.i18n ? milestone.messageKey : 'Milestone achieved!';
            const milestoneText = window.i18n ? window.i18n.t(milestoneKey) : milestoneKey;
            const currencyText = this.formatCurrency(milestone.amount);
            
            milestoneTextEl.textContent = `${milestoneText} ${currencyText}`;
            
            // Show next milestone or completion message
            const nextMilestone = CONFIG.MILESTONES.find(m => m.amount > currentEarnings);
            if (nextMilestone) {
                const remaining = nextMilestone.amount - currentEarnings;
                const remainingText = this.formatCurrency(remaining);
                const nextText = this.formatCurrency(nextMilestone.amount);
                
                const nextMilestoneKey = window.i18n ? 'milestones.nextMilestone' : 'Next milestone:';
                const toReachKey = window.i18n ? 'milestones.toReach' : 'to reach';
                const nextMilestoneText = window.i18n ? window.i18n.t(nextMilestoneKey) : nextMilestoneKey;
                const toReachText = window.i18n ? window.i18n.t(toReachKey) : toReachKey;
                
                milestoneProgressEl.textContent = 
                    `${nextMilestoneText} ${remainingText} ${toReachText} ${nextText}`;
            } else {
                const allCompleteKey = window.i18n ? 'milestones.allComplete' : '🌟 All milestones completed! You\'re a champion!';
                milestoneProgressEl.textContent = window.i18n ? window.i18n.t(allCompleteKey) : allCompleteKey;
            }
            
            milestoneEl.classList.remove('hidden');
        } catch (error) {
            console.error('Error displaying milestone:', error);
        }
    }

    /**
     * Show progress towards first milestone
     * @param {number} earnings - Current earnings
     */
    showMilestoneProgress(earnings) {
        try {
            const milestoneEl = document.getElementById('milestone');
            const milestoneTextEl = document.getElementById('milestoneText');
            const milestoneProgressEl = document.getElementById('milestoneProgress');
            
            if (!milestoneEl || !milestoneTextEl || !milestoneProgressEl) return;

            const firstMilestone = CONFIG.MILESTONES[0];
            const remaining = firstMilestone.amount - earnings;
            
            const remainingText = this.formatCurrency(remaining);
            const targetText = this.formatCurrency(firstMilestone.amount);
            
            const workingKey = window.i18n ? 'milestones.working' : '🎯 Working towards your first milestone!';
            const toReachKey = window.i18n ? 'milestones.toReach' : 'to reach';
            const workingText = window.i18n ? window.i18n.t(workingKey) : workingKey;
            const toReachText = window.i18n ? window.i18n.t(toReachKey) : toReachKey;
            
            milestoneTextEl.textContent = workingText;
            milestoneProgressEl.textContent = `${remainingText} ${toReachText} ${targetText}`;
            
            milestoneEl.classList.remove('hidden');
        } catch (error) {
            console.error('Error showing milestone progress:', error);
        }
    }

    /**
     * Utility functions
     */
    getCurrentTimeInTimezone() {
        try {
            return new Date().toLocaleString("en-US", {
                timeZone: window.TimeCoinsApp.settings.timezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error getting current time:', error);
            // Fallback to local time
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        }
    }

    parseTimeString(timeStr) {
        try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        } catch (error) {
            console.error('Error parsing time string:', error);
            return 0;
        }
    }

    formatTime(minutes) {
        try {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}:${mins.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return '0:00';
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Event handlers
     */
    onLanguageChanged(detail) {
        try {
            console.log('Language changed to:', detail.language);
            
            // Update currency display with new language
            if (window.currencyManager) {
                window.currencyManager.updateLanguageDisplay();
            }
            
            // Update milestone display with new language
            this.checkMilestones(this.lastEarnings);
            this.updateStatusMessage();
        } catch (error) {
            console.error('Error handling language change:', error);
        }
    }

    onPageHidden() {
        try {
            // Add a small delay to prevent rapid toggling
            clearTimeout(this.pageVisibilityTimeout);
            this.pageVisibilityTimeout = setTimeout(() => {
                // Pause animations to save resources
                if (window.animationManager && !document.hidden) return; // Double check
                if (window.animationManager) {
                    window.animationManager.pause();
                }
                console.log('Page hidden, animations paused');
            }, 500); // 500ms delay
        } catch (error) {
            console.error('Error handling page hidden:', error);
        }
    }

    onPageVisible() {
        try {
            // Clear any pending hide timeout
            clearTimeout(this.pageVisibilityTimeout);
            
            // Add a small delay to prevent rapid toggling
            setTimeout(() => {
                if (document.hidden) return; // Double check page is still visible
                
                // Resume animations
                if (window.animationManager) {
                    window.animationManager.resume();
                }
                // Force update display
                this.updateDisplay();
                console.log('Page visible, animations resumed');
            }, 100); // Small delay to ensure page is stable
        } catch (error) {
            console.error('Error handling page visible:', error);
        }
    }

    shouldWarnBeforeUnload() {
        try {
            return window.TimeCoinsApp.hasUnsavedChanges || this.calculateWorkingTime() > 0;
        } catch (error) {
            console.error('Error checking unload warning:', error);
            return false;
        }
    }

    /**
     * Error handling
     */
    handleError(error) {
        console.error('Application error:', error);
        // Show user-friendly error message
        this.showError('An error occurred. Please refresh the page if problems persist.');
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show error in UI
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="glass-dark rounded-2xl p-8 text-center max-w-md mx-auto mt-20">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h2 class="text-2xl font-semibold mb-4 text-white">Application Error</h2>
                    <p class="text-gray-300 mb-4">Failed to initialize the application. Please refresh the page.</p>
                    <button onclick="window.location.reload()" class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                        <i class="fas fa-refresh mr-2"></i>
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    showError(message) {
        try {
            console.error('User error:', message);
            
            // Create a simple toast notification
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 max-w-sm';
            toast.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);
            
            // Allow manual dismissal
            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
            
        } catch (error) {
            console.error('Error showing error message:', error);
            // Ultimate fallback
            alert(message);
        }
    }

    /**
     * Public API methods
     */
    
    /**
     * Manually trigger settings update
     */
    manualUpdate() {
        try {
            this.updateSettings();
            this.updateDisplay();
            console.log('Manual update completed');
        } catch (error) {
            console.error('Manual update failed:', error);
            this.showError('Update failed. Please try again.');
        }
    }

    /**
     * Get current application state
     * @returns {Object} - Current state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            settings: window.TimeCoinsApp.settings,
            currentEarnings: this.calculateCurrentEarnings(),
            workingTime: this.calculateWorkingTime(),
            progress: this.calculateProgress(),
            dailyTarget: this.calculateDailyTarget(),
            hasUnsavedChanges: window.TimeCoinsApp.hasUnsavedChanges
        };
    }

    /**
     * Reset application to defaults
     */
    resetToDefaults() {
        try {
            if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
                // Clear cache
                if (window.cacheManager) {
                    window.cacheManager.clearCache();
                }
                
                // Reset settings
                window.TimeCoinsApp.settings = { ...CONFIG.DEFAULT_SETTINGS };
                
                // Apply to UI
                this.applySettingsToUI(window.TimeCoinsApp.settings);
                
                // Auto-detect settings
                this.autoDetectSettings();
                
                // Save new settings
                this.saveSettings();
                
                // Update display
                this.updateDisplay();
                
                console.log('Application reset to defaults');
                this.showSuccess('Settings reset to defaults successfully!');
            }
        } catch (error) {
            console.error('Error resetting to defaults:', error);
            this.showError('Failed to reset settings. Please try again.');
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        try {
            // Create a simple toast notification
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 max-w-sm';
            toast.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 3000);
            
            // Allow manual dismissal
            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
            
        } catch (error) {
            console.error('Error showing success message:', error);
        }
    }

    /**
     * Cleanup
     */
    cleanup() {
        try {
            this.stopUpdateLoop();
            
            if (window.animationManager) {
                window.animationManager.cleanup();
            }
            
            if (this.autoSaveTimeout) {
                clearTimeout(this.autoSaveTimeout);
            }
            
            console.log('Application cleaned up');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    /**
     * Debug and development helpers
     */
    getDebugInfo() {
        try {
            return {
                isInitialized: this.isInitialized,
                settings: window.TimeCoinsApp.settings,
                currentEarnings: this.calculateCurrentEarnings(),
                workingTime: this.calculateWorkingTime(),
                progress: this.calculateProgress(),
                cacheInfo: window.cacheManager?.getCacheInfo(),
                animationStats: window.animationManager?.getStats(),
                currencyStats: window.currencyManager?.getStats(),
                i18nLanguage: window.i18n?.getCurrentLanguage(),
                lastEarnings: this.lastEarnings,
                hasUnsavedChanges: window.TimeCoinsApp.hasUnsavedChanges
            };
        } catch (error) {
            console.error('Error getting debug info:', error);
            return { error: error.message };
        }
    }
}

// Initialize the application
const app = new TimeCoinsApp();

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init().catch(error => {
            console.error('Failed to initialize app:', error);
        });
    });
} else {
    app.init().catch(error => {
        console.error('Failed to initialize app:', error);
    });
}

// Expose to global scope for debugging and external access
window.timeCoinsApp = app;

// Development debug tools
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '127.0.0.1:3000') {
    window.timeCoinsDebug = {
        app,
        getDebugInfo: () => app.getDebugInfo(),
        getState: () => app.getState(),
        settings: () => window.TimeCoinsApp.settings,
        forceUpdate: () => app.updateDisplay(),
        manualUpdate: () => app.manualUpdate(),
        clearCache: () => window.cacheManager?.clearCache(),
        resetToDefaults: () => app.resetToDefaults(),
        celebrateMilestone: (amount) => window.animationManager?.celebrateMilestone(amount),
        
        // Quick test functions
        testEarnings: (amount) => {
            window.TimeCoinsApp.settings.hourlyRate = amount;
            app.updateDisplay();
        },
        testMilestone: (amount) => {
            app.checkMilestones(amount);
        },
        
        // New debugging functions
        getCurrentCalculations: () => {
            const currentTimeStr = app.getCurrentTimeInTimezone();
            const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
            const currentTime = currentHour * 60 + currentMinute;
            const workStartMinutes = app.parseTimeString(window.TimeCoinsApp.settings.startTime);
            const workEndMinutes = workStartMinutes + (window.TimeCoinsApp.settings.workHours * 60);
            
            return {
                currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
                currentTimeMinutes: currentTime,
                workStartMinutes,
                workEndMinutes,
                workStartTime: app.formatTime(workStartMinutes),
                workEndTime: app.formatTime(workEndMinutes),
                isWorking: currentTime >= workStartMinutes && currentTime <= workEndMinutes,
                earnings: app.calculateCurrentEarnings(),
                workingTime: app.calculateWorkingTime(),
                progress: app.calculateProgress(),
                settings: window.TimeCoinsApp.settings
            };
        },
        
        fixMilestones: () => {
            app.currentDisplayedMilestone = null;
            app.checkMilestones(app.calculateCurrentEarnings());
        },
        
        // System status
        systemStatus: () => ({
            cacheManager: !!window.cacheManager,
            currencyManager: !!window.currencyManager,
            animationManager: !!window.animationManager,
            i18n: !!window.i18n,
            appInitialized: app.isInitialized
        })
    };
    
    console.log('🚀 Time Coins Debug Tools Available:');
    console.log('📊 window.timeCoinsDebug.getDebugInfo() - Get full debug information');
    console.log('⚙️ window.timeCoinsDebug.getState() - Get current application state');
    console.log('🔄 window.timeCoinsDebug.forceUpdate() - Force display update');
    console.log('💰 window.timeCoinsDebug.testEarnings(50) - Test with specific earnings');
    console.log('🏆 window.timeCoinsDebug.testMilestone(100) - Test milestone display');
    console.log('🗑️ window.timeCoinsDebug.clearCache() - Clear all cached data');
    console.log('🔧 window.timeCoinsDebug.systemStatus() - Check system components');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    app.handleError(event.reason);
});

console.log('✅ Time Coins application loaded successfully');