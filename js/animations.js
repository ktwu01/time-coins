// ========================================
// ANIMATIONS & VISUAL EFFECTS
// ========================================

class AnimationManager {
    constructor() {
        this.coinParticles = [];
        this.animationFrame = null;
        this.isAnimating = false;
        this.lastCoinTime = 0;
        this.coinInterval = null;
    }

    /**
     * Initialize animation system
     */
    init() {
        this.setupHourglassContainer();
        this.startCoinAnimation();
        console.log('Animation system initialized');
    }

    /**
     * Setup hourglass container for animations
     */
    setupHourglassContainer() {
        const container = document.getElementById('hourglassContainer');
        if (!container) {
            console.error('Hourglass container not found');
            return;
        }

        // Ensure coin container exists
        let coinContainer = document.getElementById('coinContainer');
        if (!coinContainer) {
            coinContainer = document.createElement('div');
            coinContainer.id = 'coinContainer';
            coinContainer.className = 'absolute inset-0 overflow-hidden pointer-events-none';
            container.appendChild(coinContainer);
        }
    }

    /**
     * Create a single coin particle
     * @param {Object} options - Coin creation options
     */
    createCoin(options = {}) {
        const container = document.getElementById('coinContainer');
        if (!container) return;

        const {
            startX = Math.random() * 80 + 10, // 10-90% from left
            startY = -20, // Start above container
            animationDuration = 3000,
            size = 6,
            delay = 0
        } = options;

        const coin = document.createElement('div');
        coin.className = 'coin-particle';
        
        // Set initial position and style
        coin.style.left = `${startX}%`;
        coin.style.top = `${startY}px`;
        coin.style.width = `${size}px`;
        coin.style.height = `${size}px`;
        coin.style.animationDelay = `${delay}ms`;
        coin.style.animationDuration = `${animationDuration}ms`;

        // Add some variation to the animation
        const randomOffset = (Math.random() - 0.5) * 20; // -10 to 10px horizontal drift
        coin.style.setProperty('--random-offset', `${randomOffset}px`);

        container.appendChild(coin);

        // Track particle
        const particle = {
            element: coin,
            createdAt: Date.now(),
            duration: animationDuration
        };
        this.coinParticles.push(particle);

        // Remove coin after animation
        setTimeout(() => {
            this.removeCoin(coin);
        }, animationDuration + delay);

        return coin;
    }

    /**
     * Remove coin particle
     * @param {HTMLElement} coin - Coin element to remove
     */
    removeCoin(coin) {
        if (coin && coin.parentNode) {
            coin.parentNode.removeChild(coin);
        }

        // Remove from tracking array
        this.coinParticles = this.coinParticles.filter(
            particle => particle.element !== coin
        );
    }

    /**
     * Start continuous coin animation
     */
    startCoinAnimation() {
        // Clear any existing interval
        this.stopCoinAnimation();

        this.coinInterval = setInterval(() => {
            // Only create coins during work hours and with probability
            if (this.shouldCreateCoin()) {
                this.createCoin();
            }
        }, 500); // Check every 500ms

        this.isAnimating = true;
        console.log('Coin animation started');
    }

    /**
     * Stop coin animation
     */
    stopCoinAnimation() {
        if (this.coinInterval) {
            clearInterval(this.coinInterval);
            this.coinInterval = null;
        }
        this.isAnimating = false;
        console.log('Coin animation stopped');
    }

    /**
     * Determine if a coin should be created
     * @returns {boolean} - Whether to create a coin
     */
    shouldCreateCoin() {
        // Always show coins during demo/testing, check working time for production
        const settings = window.TimeCoinsApp?.settings;
        
        // If no settings available, show coins anyway for demo
        if (!settings) {
            return Math.random() < CONFIG.COIN_ANIMATION_PROBABILITY;
        }
        
        // Check if user is in working time
        if (!this.isWorkingTime()) {
            // Still show occasional coins even outside work hours for visual appeal
            return Math.random() < (CONFIG.COIN_ANIMATION_PROBABILITY * 0.3);
        }

        // Check probability during work hours
        return Math.random() < CONFIG.COIN_ANIMATION_PROBABILITY;
    }

    /**
     * Check if currently in working time
     * @returns {boolean} - Working time status
     */
    isWorkingTime() {
        try {
            const settings = window.TimeCoinsApp?.settings;
            if (!settings) {
                console.log('Animation: No settings found, returning false for working time');
                return false;
            }

            const currentTimeStr = this.getCurrentTimeInTimezone(settings.timezone);
            const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
            const currentTime = currentHour * 60 + currentMinute;
            
            const workStartMinutes = this.parseTimeString(settings.startTime);
            const workEndMinutes = workStartMinutes + (settings.workHours * 60);
            
            const isWorking = currentTime >= workStartMinutes && currentTime <= workEndMinutes;
            console.log(`Animation: Current time ${currentTimeStr}, Work ${settings.startTime}-${settings.workHours}h, Working: ${isWorking}`);
            
            return isWorking;
        } catch (error) {
            console.error('Error checking working time:', error);
            return false;
        }
    }

    /**
     * Get current time in specified timezone
     * @param {string} timezone - Timezone identifier
     * @returns {string} - Time string in HH:MM format
     */
    getCurrentTimeInTimezone(timezone) {
        return new Date().toLocaleString("en-US", {
            timeZone: timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Parse time string to minutes
     * @param {string} timeStr - Time string in HH:MM format
     * @returns {number} - Minutes since midnight
     */
    parseTimeString(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Create milestone celebration animation
     * @param {number} milestoneAmount - Milestone amount achieved
     */
    celebrateMilestone(milestoneAmount) {
        console.log('Celebrating milestone:', milestoneAmount);

        // Create burst of coins
        const burstCount = Math.min(milestoneAmount / 10, 20); // Max 20 coins
        
        for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
                this.createCoin({
                    startX: Math.random() * 100,
                    animationDuration: 2000,
                    size: 8,
                    delay: Math.random() * 500
                });
            }, i * 100);
        }

        // Add screen flash effect
        this.addScreenFlash();

        // Animate milestone display
        const milestoneEl = document.getElementById('milestone');
        if (milestoneEl) {
            milestoneEl.style.animation = 'none';
            setTimeout(() => {
                milestoneEl.style.animation = 'pulse 0.6s ease-in-out 3';
            }, 10);
        }
    }

    /**
     * Add screen flash effect
     */
    addScreenFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            animation: flashFade 1s ease-out forwards;
        `;

        // Add flash animation keyframes if not exists
        if (!document.querySelector('#flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes flashFade {
                    0% { opacity: 0; }
                    30% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(flash);

        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1000);
    }

    /**
     * Animate button with shimmer effect
     * @param {HTMLElement} button - Button element
     * @param {string} newText - New button text
     * @param {number} duration - Animation duration in ms
     */
    animateButton(button, newText, duration = 2000) {
        if (!button) return;

        const originalHTML = button.innerHTML;
        
        // Add shimmer class
        button.classList.add('shimmer');
        
        // Update text
        if (newText) {
            button.innerHTML = newText;
        }

        // Remove shimmer and restore text after duration
        setTimeout(() => {
            button.classList.remove('shimmer');
            if (newText) {
                button.innerHTML = originalHTML;
            }
        }, duration);
    }

    /**
     * Animate progress bar
     * @param {number} percentage - Target percentage (0-100)
     * @param {number} duration - Animation duration in ms
     */
    animateProgressBar(percentage, duration = 1000) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        if (!progressFill || !progressPercent) return;

        // Clamp percentage
        const targetPercent = Math.max(0, Math.min(100, percentage));
        
        // Animate progress bar
        progressFill.style.transition = `width ${duration}ms ease-out`;
        progressFill.style.width = `${targetPercent}%`;
        
        // Animate percentage text
        const startPercent = parseInt(progressPercent.textContent) || 0;
        const increment = (targetPercent - startPercent) / (duration / 50);
        let currentPercent = startPercent;
        
        const updatePercent = () => {
            currentPercent += increment;
            if ((increment > 0 && currentPercent >= targetPercent) || 
                (increment < 0 && currentPercent <= targetPercent)) {
                currentPercent = targetPercent;
                progressPercent.textContent = `${Math.round(currentPercent)}%`;
                return;
            }
            
            progressPercent.textContent = `${Math.round(currentPercent)}%`;
            setTimeout(updatePercent, 50);
        };
        
        updatePercent();
    }

    /**
     * Clean up animations
     */
    cleanup() {
        this.stopCoinAnimation();
        
        // Remove all coin particles
        this.coinParticles.forEach(particle => {
            this.removeCoin(particle.element);
        });
        this.coinParticles = [];

        console.log('Animation system cleaned up');
    }

    /**
     * Get animation statistics
     * @returns {Object} - Animation statistics
     */
    getStats() {
        return {
            isAnimating: this.isAnimating,
            activeCoinParticles: this.coinParticles.length,
            coinCreationRate: CONFIG.COIN_ANIMATION_PROBABILITY,
            lastCoinTime: this.lastCoinTime
        };
    }

    /**
     * Pause animations
     */
    pause() {
        this.stopCoinAnimation();
        console.log('Animations paused');
    }

    /**
     * Resume animations
     */
    resume() {
        this.startCoinAnimation();
        console.log('Animations resumed');
    }
}

// Create global animation manager instance
window.animationManager = new AnimationManager();