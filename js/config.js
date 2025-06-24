// ========================================
// CONFIGURATION AND CONSTANTS
// ========================================

const CONFIG = {
    // Cache configuration
    CACHE_EXPIRY_DAYS: 30,
    AUTO_SAVE_DELAY: 3000, // 3 seconds
    
    // UI configuration
    UPDATE_INTERVAL: 1000, // 1 second
    COIN_ANIMATION_PROBABILITY: 0.3,
    
    // Default settings
    DEFAULT_SETTINGS: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: '$',
        hourlyRate: 25,
        startTime: "09:00",
        workHours: 8
    },
    
    // Milestone configuration
    MILESTONES: [
        { amount: 10, messageKey: "milestones.first", icon: "fas fa-star" },
        { amount: 50, messageKey: "milestones.great", icon: "fas fa-rocket" },
        { amount: 100, messageKey: "milestones.excellent", icon: "fas fa-gem" },
        { amount: 200, messageKey: "milestones.target", icon: "fas fa-medal" },
        { amount: 500, messageKey: "milestones.outstanding", icon: "fas fa-crown" },
        { amount: 1000, messageKey: "milestones.legendary", icon: "fas fa-trophy" }
    ],
    
    // Timezone options
    TIMEZONES: [
        // North America
        { value: "America/New_York", label: "🇺🇸 New York (EST/EDT) UTC-5/-4", group: "🌎 North America" },
        { value: "America/Chicago", label: "🇺🇸 Chicago (CST/CDT) UTC-6/-5", group: "🌎 North America" },
        { value: "America/Denver", label: "🇺🇸 Denver (MST/MDT) UTC-7/-6", group: "🌎 North America" },
        { value: "America/Phoenix", label: "🇺🇸 Phoenix (MST) UTC-7", group: "🌎 North America" },
        { value: "America/Los_Angeles", label: "🇺🇸 Los Angeles (PST/PDT) UTC-8/-7", group: "🌎 North America" },
        { value: "America/Anchorage", label: "🇺🇸 Anchorage (AKST/AKDT) UTC-9/-8", group: "🌎 North America" },
        { value: "Pacific/Honolulu", label: "🇺🇸 Honolulu (HST) UTC-10", group: "🌎 North America" },
        { value: "America/Toronto", label: "🇨🇦 Toronto (EST/EDT) UTC-5/-4", group: "🌎 North America" },
        { value: "America/Vancouver", label: "🇨🇦 Vancouver (PST/PDT) UTC-8/-7", group: "🌎 North America" },
        { value: "America/Edmonton", label: "🇨🇦 Edmonton (MST/MDT) UTC-7/-6", group: "🌎 North America" },
        { value: "America/Winnipeg", label: "🇨🇦 Winnipeg (CST/CDT) UTC-6/-5", group: "🌎 North America" },
        { value: "America/Halifax", label: "🇨🇦 Halifax (AST/ADT) UTC-4/-3", group: "🌎 North America" },
        { value: "America/St_Johns", label: "🇨🇦 St. John's (NST/NDT) UTC-3:30/-2:30", group: "🌎 North America" },
        { value: "America/Mexico_City", label: "🇲🇽 Mexico City (CST/CDT) UTC-6/-5", group: "🌎 North America" },
        { value: "America/Cancun", label: "🇲🇽 Cancun (EST) UTC-5", group: "🌎 North America" },
        { value: "America/Tijuana", label: "🇲🇽 Tijuana (PST/PDT) UTC-8/-7", group: "🌎 North America" },
        
        // Europe
        { value: "Europe/London", label: "🇬🇧 London (GMT/BST) UTC+0/+1", group: "🌍 Europe" },
        { value: "Europe/Dublin", label: "🇮🇪 Dublin (GMT/IST) UTC+0/+1", group: "🌍 Europe" },
        { value: "Europe/Lisbon", label: "🇵🇹 Lisbon (WET/WEST) UTC+0/+1", group: "🌍 Europe" },
        { value: "Europe/Madrid", label: "🇪🇸 Madrid (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Paris", label: "🇫🇷 Paris (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Brussels", label: "🇧🇪 Brussels (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Amsterdam", label: "🇳🇱 Amsterdam (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Berlin", label: "🇩🇪 Berlin (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Zurich", label: "🇨🇭 Zurich (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Vienna", label: "🇦🇹 Vienna (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Rome", label: "🇮🇹 Rome (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Prague", label: "🇨🇿 Prague (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Warsaw", label: "🇵🇱 Warsaw (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Stockholm", label: "🇸🇪 Stockholm (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Oslo", label: "🇳🇴 Oslo (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Copenhagen", label: "🇩🇰 Copenhagen (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Helsinki", label: "🇫🇮 Helsinki (EET/EEST) UTC+2/+3", group: "🌍 Europe" },
        { value: "Europe/Athens", label: "🇬🇷 Athens (EET/EEST) UTC+2/+3", group: "🌍 Europe" },
        { value: "Europe/Istanbul", label: "🇹🇷 Istanbul (TRT) UTC+3", group: "🌍 Europe" },
        { value: "Europe/Bucharest", label: "🇷🇴 Bucharest (EET/EEST) UTC+2/+3", group: "🌍 Europe" },
        { value: "Europe/Budapest", label: "🇭🇺 Budapest (CET/CEST) UTC+1/+2", group: "🌍 Europe" },
        { value: "Europe/Moscow", label: "🇷🇺 Moscow (MSK) UTC+3", group: "🌍 Europe" },
        { value: "Europe/Kiev", label: "🇺🇦 Kyiv (EET/EEST) UTC+2/+3", group: "🌍 Europe" },
        
        // Asia
        { value: "Asia/Shanghai", label: "🇨🇳 Beijing/Shanghai (CST) UTC+8", group: "🌏 Asia" },
        { value: "Asia/Hong_Kong", label: "🇭🇰 Hong Kong (HKT) UTC+8", group: "🌏 Asia" },
        { value: "Asia/Taipei", label: "🇹🇼 Taipei (CST) UTC+8", group: "🌏 Asia" },
        { value: "Asia/Tokyo", label: "🇯🇵 Tokyo (JST) UTC+9", group: "🌏 Asia" },
        { value: "Asia/Seoul", label: "🇰🇷 Seoul (KST) UTC+9", group: "🌏 Asia" },
        { value: "Asia/Singapore", label: "🇸🇬 Singapore (SGT) UTC+8", group: "🌏 Asia" },
        { value: "Asia/Bangkok", label: "🇹🇭 Bangkok (ICT) UTC+7", group: "🌏 Asia" },
        { value: "Asia/Jakarta", label: "🇮🇩 Jakarta (WIB) UTC+7", group: "🌏 Asia" },
        { value: "Asia/Manila", label: "🇵🇭 Manila (PST) UTC+8", group: "🌏 Asia" },
        { value: "Asia/Kuala_Lumpur", label: "🇲🇾 Kuala Lumpur (MYT) UTC+8", group: "🌏 Asia" },
        { value: "Asia/Kolkata", label: "🇮🇳 Mumbai/Delhi (IST) UTC+5:30", group: "🌏 Asia" },
        
        // Oceania
        { value: "Australia/Sydney", label: "🇦🇺 Sydney (AEST/AEDT) UTC+10/+11", group: "🌏 Oceania" },
        { value: "Australia/Melbourne", label: "🇦🇺 Melbourne (AEST/AEDT) UTC+10/+11", group: "🌏 Oceania" },
        { value: "Australia/Perth", label: "🇦🇺 Perth (AWST) UTC+8", group: "🌏 Oceania" },
        { value: "Pacific/Auckland", label: "🇳🇿 Auckland (NZST/NZDT) UTC+12/+13", group: "🌏 Oceania" }
    ]
};

// Cache keys
const CACHE_KEYS = {
    SETTINGS: 'timeCoins_settings',
    LANGUAGE: 'timeCoins_language',
    LAST_SAVED: 'timeCoins_lastSaved'
};

// Global application state
window.TimeCoinsApp = {
    settings: { ...CONFIG.DEFAULT_SETTINGS },
    currentLanguage: 'en',
    lastMilestone: 0,
    currentDisplayedMilestone: null,
    coinAnimationInterval: null,
    hasUnsavedChanges: false
};