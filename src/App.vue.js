// constants.js content (create this file separately)
const DEFAULT_SETTINGS = {
  hourlyRate: 25,
  startTime: '09:00',
  workHours: 8,
  timezone: 'UTC',
  currency: '$',
  workDays: 21,
  overtimeDays: 0,
  overtimeRate: 37.5
}

const MILESTONES = [
  { amount: 10, messageKey: 'milestones.first' },
  { amount: 25, messageKey: 'milestones.great' },
  { amount: 50, messageKey: 'milestones.excellent' },
  { amount: 100, messageKey: 'milestones.target' },
  { amount: 200, messageKey: 'milestones.outstanding' }
]



// import i18n from '../js/i18n.js';

// App.vue component
export default {
  data() {
    const saved = JSON.parse(localStorage.getItem('settings') || 'null')
    return {
      settings: Object.assign({}, DEFAULT_SETTINGS, saved || {}),
      now: new Date(),
      milestone: null,
      timer: null,
      currencies: [],
      timezones: [],
      currentLanguage: 'en',
      isLoading: true
    }
  },
  async created() {
    // 动态加载 currencies.json 和 timezones.json
    const [currencies, timezones] = await Promise.all([
      fetch('data/currencies.json').then(r => r.json()),
      fetch('data/timezones.json').then(r => r.json())
    ]);
    this.currencies = currencies;
    this.timezones = timezones;
    // 语言初始化
    this.currentLanguage = window.i18n.getCurrentLanguage();
    this.isLoading = false;
  },
  computed: {
    nowInTz() {
      return this.getNowInTimezone(this.settings.timezone);
    },
    startDate() {
      return this.getStartDate();
    },
    endDate() {
      return this.getEndDate();
    },
    earnings() {
      const ms = Math.min(Math.max(this.nowInTz - this.startDate, 0), this.endDate - this.startDate);
      const hours = ms / 3600000;
      return Math.max(hours * this.hourlyRate, 0);
    },
    progress() {
      const total = this.endDate - this.startDate;
      const done = Math.min(Math.max(this.nowInTz - this.startDate, 0), total);
      return total ? (done / total) * 100 : 0;
    },
    workingTime() {
      const now = this.nowInTz;
      const start = this.startDate;
      const end = this.endDate;
      
      if (now < start) {
        // Before work starts
        const msUntilWork = start - now;
        const minutes = Math.floor(msUntilWork / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
          return `${this.t('status.workStartsIn')} ${hours}h ${mins}min`;
        } else {
          return `${this.t('status.workStartsIn')} ${mins}min`;
        }
      } else if (now >= start && now <= end) {
        // During work hours
        const ms = now - start;
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${this.t('status.workingFor')} ${hours}:${String(mins).padStart(2,'0')}`;
      } else {
        // After work ends
        return this.t('status.workComplete');
      }
    },
    nextMilestone() {
      return MILESTONES.find(m => m.amount > this.earnings) || null
    },
    milestoneProgress() {
      if (!this.nextMilestone) return 100;
      
      const currentEarnings = Math.max(0, this.earnings);
      const prevMilestone = MILESTONES.filter(m => m.amount <= currentEarnings).pop();
      const prevAmount = prevMilestone ? prevMilestone.amount : 0;
      const nextAmount = this.nextMilestone.amount;
      
      const currentProgress = currentEarnings - prevAmount;
      const totalNeeded = nextAmount - prevAmount;
      
      const progress = totalNeeded > 0 ? (currentProgress / totalNeeded) * 100 : 0;
      return Math.max(0, Math.min(100, progress));
    },
    remainingToNextMilestone() {
      return this.nextMilestone ? Math.max(0, this.nextMilestone.amount - this.earnings) : 0;
    },
    // All calculations based on hourly rate as primary source
    hourlyRate() {
      return this.settings.hourlyRate || 0;
    },
    dailyIncome() {
      return this.hourlyRate * (this.settings.workHours || 0);
    },
    monthlyBaseIncome() {
      return this.dailyIncome * (this.settings.workDays || 0);
    },
    overtimeEarnings() {
      return (this.settings.overtimeDays || 0) * (this.settings.workHours || 0) * (this.settings.overtimeRate || 0)
    },
    monthlyEarnings() {
      // Always calculate from hourly rate
      return this.monthlyBaseIncome + this.overtimeEarnings;
    },
    incomePerSecond() {
      return this.hourlyRate / 3600;
    },
    incomePerMinute() {
      return this.hourlyRate / 60;
    },
    incomePerHour() {
      return this.hourlyRate;
    },
    incomePerDay() {
      return this.dailyIncome;
    },
    remainingDaysInMonth() {
      // Calculate remaining workdays in the month
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const totalRemainingDays = daysInMonth - currentDay;
      
      // Assume same ratio of work days to total days for remaining days
      const workDayRatio = (this.settings.workDays || 0) / daysInMonth;
      const remainingWorkDays = Math.floor(totalRemainingDays * workDayRatio);
      
      return Math.max(0, remainingWorkDays);
    },
    remainingMonthlyIncome() {
      // Remaining workdays × daily income
      return this.remainingDaysInMonth * this.dailyIncome;
    },
    workedDaysThisMonth() {
      // Calculate how many workdays have been worked so far this month
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      // Assume same ratio of work days to total days for days worked
      const workDayRatio = (this.settings.workDays || 0) / daysInMonth;
      const workedDays = Math.floor(currentDay * workDayRatio);
      
      return Math.max(0, workedDays);
    },
    actualMonthlyEarnings() {
      // Actual earnings so far this month = worked days × daily income
      return this.workedDaysThisMonth * this.dailyIncome;
    },
    monthlyProgress() {
      // Progress = actual monthly earnings so far / total monthly target
      return this.monthlyEarnings > 0 ? (this.actualMonthlyEarnings / this.monthlyEarnings * 100) : 0
    },
    currencyOptions() {
      return this.currencies.map(c => ({
        value: c.symbol,
        label: this.currentLanguage === 'zh' ? `${c.flag} ${c.symbol} ${c.code} - ${c.nameCN}` : `${c.flag} ${c.symbol} ${c.code} - ${c.name}`
      }));
    },
    timezoneGroups() {
      // 分组并按当前语言显示
      const groups = {};
      this.timezones.forEach(tz => {
        const group = tz.group[this.currentLanguage] || tz.group['en'];
        if (!groups[group]) groups[group] = [];
        groups[group].push({
          value: tz.value,
          label: tz.label[this.currentLanguage] || tz.label['en']
        });
      });
      return groups;
    }
  },
  watch: {
    settings: {
      handler() {
        localStorage.setItem('settings', JSON.stringify(this.settings))
        // 同步设置到全局对象供动画系统使用
        if (window.TimeCoinsApp) {
          window.TimeCoinsApp.settings = this.settings;
        }
      },
      deep: true
    }
  },
  methods: {
    t(key) {
      return window.i18n.t(key, this.currentLanguage);
    },
    switchLanguage(lang) {
      this.currentLanguage = lang;
      window.i18n.switchLanguage(lang);
    },
    getNowInTimezone(timezone) {
      // 获取指定时区的当前时间
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).formatToParts(now);
      const y = parts.find(p => p.type === 'year').value;
      const m = parts.find(p => p.type === 'month').value;
      const d = parts.find(p => p.type === 'day').value;
      const h = parts.find(p => p.type === 'hour').value;
      const min = parts.find(p => p.type === 'minute').value;
      const s = parts.find(p => p.type === 'second').value;
      return new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
    },
    getStartDate() {
      const now = this.getNowInTimezone(this.settings.timezone);
      const [h, m] = this.settings.startTime.split(':');
      const d = new Date(now);
      d.setHours(parseInt(h), parseInt(m), 0, 0);
      return d;
    },
    getEndDate() {
      const d = new Date(this.getStartDate());
      d.setHours(d.getHours() + Number(this.settings.workHours));
      return d;
    },
    checkMilestones() {
      // Only check milestones if we have reasonable earnings (not immediately on load)
      if (this.earnings <= 0) return;
      
      const reached = MILESTONES.filter(m => this.earnings >= m.amount).pop() || null
      if (reached && (!this.milestone || reached.amount > this.milestone.amount)) {
        // Prevent duplicate milestone celebrations
        const lastReachedAmount = this.milestone ? this.milestone.amount : 0;
        if (reached.amount > lastReachedAmount) {
          this.milestone = {
            ...reached,
            message: this.t(reached.messageKey)
          }
          // Trigger celebration animation only for new milestones
          if (window.animationManager && document.getElementById('hourglassContainer')) {
            window.animationManager.celebrateMilestone(reached.amount);
          }
        }
      }
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = new Date()
      this.checkMilestones()
    }, 1000)
    
    // 确保TimeCoinsApp存在并同步设置
    if (!window.TimeCoinsApp) {
      window.TimeCoinsApp = { settings: this.settings };
    }
    
    // 初始化动画系统 - 等待DOM完全渲染
    setTimeout(() => {
      if (window.animationManager && !window.animationManager.isAnimating) {
        const container = document.getElementById('hourglassContainer');
        if (container) {
          // 同步设置到全局对象
          window.TimeCoinsApp.settings = this.settings;
          window.animationManager.init();
        } else {
          console.warn('Hourglass container not found, retrying...');
          setTimeout(() => {
            if (document.getElementById('hourglassContainer')) {
              window.TimeCoinsApp.settings = this.settings;
              window.animationManager.init();
            }
          }, 1000);
        }
      }
    }, 500);
  },
  beforeUnmount() {
    clearInterval(this.timer)
    if (window.animationManager) {
      window.animationManager.cleanup();
    }
  },
  template: `
  <div v-if="isLoading" class="text-center py-12">Loading...</div>
  <div v-else class="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
    <!-- Language Switcher -->
    <div class="language-switcher">
      <button @click="switchLanguage('en')" :class="{'language-btn active': currentLanguage==='en', 'language-btn': currentLanguage!=='en'}">🇺🇸 EN</button>
      <button @click="switchLanguage('zh')" :class="{'language-btn active': currentLanguage==='zh', 'language-btn': currentLanguage!=='zh'}">🇨🇳 中文</button>
    </div>
    <header class="text-center mb-12">
      <div class="glass rounded-3xl p-8 mb-8">
        <div class="flex items-center justify-center mb-4">
          <i class="fas fa-hourglass-half text-4xl text-yellow-400 mr-4 float-animation"></i>
          <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">{{ t('title') }}</h1>
        </div>
        <p class="text-gray-300 text-lg md:text-xl font-light">{{ t('subtitle') }}</p>
      </div>
    </header>

    <section class="glass gold-gradient text-black p-6 rounded-2xl mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="text-2xl font-bold flex items-center mb-2 md:mb-0">
          <i class="fas fa-coins mr-2"></i> {{ t('salary.mySalary') }}
        </div>
        <div class="flex flex-wrap gap-4 text-base font-semibold">
          <div>{{ t('salary.monthlyTotal') }}：<span class="text-yellow-700">{{ settings.currency }}{{ actualMonthlyEarnings?.toFixed(2) || '0.00' }}</span></div>
          <div>{{ t('salary.monthlyProgress') }}：<span class="text-yellow-700">{{ monthlyProgress?.toFixed(1) || '0.0' }}%</span></div>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.baseIncome') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ monthlyBaseIncome?.toFixed(2) || '0.00' }}</div>
          <div class="text-xs text-gray-500">{{ t('salary.workDays') }}: {{ settings.workDays }} {{ t('salary.days') }}</div>
        </div>
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.overtimeIncome') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ overtimeEarnings?.toFixed(2) || '0.00' }}</div>
          <div class="text-xs text-gray-500">{{ t('salary.overtimeDays') }}: {{ settings.overtimeDays }} {{ t('salary.days') }}</div>
        </div>
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.todayEarnings') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ earnings?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.perSecond') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ incomePerSecond?.toFixed(4) || '0.0000' }}</div>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.perMinute') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ incomePerMinute?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.perHour') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ incomePerHour?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.perDay') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ incomePerDay?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="bg-white/80 rounded-xl p-4 text-center">
          <div class="text-xs text-gray-600 mb-1">{{ t('salary.monthLeft') }}</div>
          <div class="text-xl font-bold">{{ settings.currency }}{{ remainingMonthlyIncome?.toFixed(2) || '0.00' }}</div>
        </div>
      </div>
    </section>

    <section class="glass-dark rounded-2xl p-6 md:p-8 mb-8">
      <div class="flex items-center mb-6">
        <i class="fas fa-cog text-yellow-400 text-xl mr-3"></i>
        <h2 class="text-2xl font-semibold text-white">{{ t('settings.title') }}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-globe text-yellow-400 mr-2"></i>
            <span>{{ t('settings.timezone') }}</span>
          </label>
          <select v-model="settings.timezone" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300">
            <optgroup v-for="(opts, group) in timezoneGroups" :key="group" :label="group">
              <option v-for="tz in opts" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
            </optgroup>
          </select>
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-coins text-yellow-400 mr-2"></i>
            <span>{{ t('settings.currency') }}</span>
          </label>
          <select v-model="settings.currency" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300">
            <option v-for="c in currencyOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-dollar-sign text-yellow-400 mr-2"></i>
            <span>{{ t('settings.hourlyRate') }}</span>
          </label>
          <input type="number" v-model.number="settings.hourlyRate" min="1" step="0.5" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-clock text-yellow-400 mr-2"></i>
            <span>{{ t('settings.startTime') }}</span>
          </label>
          <input type="time" v-model="settings.startTime" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-business-time text-yellow-400 mr-2"></i>
            <span>{{ t('settings.workHours') }}</span>
          </label>
          <input type="number" v-model.number="settings.workHours" min="1" max="24" step="0.5" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-calendar-alt text-yellow-400 mr-2"></i>
            <span>{{ t('settings.workDays') }}</span>
          </label>
          <input type="number" v-model.number="settings.workDays" min="1" max="31" step="1" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-plus-circle text-yellow-400 mr-2"></i>
            <span>{{ t('settings.overtimeDays') }}</span>
          </label>
          <input type="number" v-model.number="settings.overtimeDays" min="0" max="31" step="1" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-bolt text-yellow-400 mr-2"></i>
            <span>{{ t('settings.overtimeRate') }}</span>
          </label>
          <input type="number" v-model.number="settings.overtimeRate" min="0" step="0.01" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
      </div>
    </section>

    <div v-if="milestone" class="glass gold-gradient text-black p-4 rounded-2xl mb-8 text-center font-semibold text-lg">
      <i class="fas fa-trophy mr-2"></i>
      <span>{{ milestone.message }}</span>
      <div class="text-sm mt-1 opacity-75" v-if="nextMilestone">
        <span>{{ t('milestones.nextMilestone') }} {{ settings.currency }}{{ remainingToNextMilestone.toFixed(2) }}</span>
        <div class="w-full bg-black/20 rounded-full h-2 mt-2">
          <div class="h-full bg-white/60 rounded-full transition-all duration-1000" :style="{ width: milestoneProgress + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="nextMilestone" class="glass-dark rounded-2xl p-4 mb-8 text-center">
      <div class="text-white text-lg font-medium mb-2">
        <i class="fas fa-target mr-2 text-yellow-400"></i>
        {{ t('milestones.nextMilestone') }} {{ settings.currency }}{{ nextMilestone.amount }}
      </div>
      <div class="text-gray-300 text-sm mb-3">
        {{ t('milestones.toReach') }}: {{ settings.currency }}{{ remainingToNextMilestone.toFixed(2) }}
      </div>
      <div class="w-full bg-gray-700 rounded-full h-3">
        <div class="h-full gold-gradient rounded-full transition-all duration-1000" :style="{ width: milestoneProgress + '%' }"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="glass-dark rounded-2xl p-8 text-center">
        <h3 class="text-xl font-semibold mb-6 flex items-center justify-center">
          <i class="fas fa-hourglass-start text-yellow-400 mr-3"></i>
          <span>{{ t('dashboard.valueGenerator') }}</span>
        </h3>
        <div class="flex justify-center mb-6">
          <div class="hourglass-shape float-animation" id="hourglassContainer">
            <div id="coinContainer" class="absolute inset-0"></div>
          </div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
          <div class="flex items-center justify-center text-gray-300">
            <i class="fas fa-clock mr-2 text-yellow-400"></i>
            <span>{{ workingTime }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="glass-dark rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-300">{{ t('dashboard.dailyProgress') }}</span>
            <span class="text-sm text-yellow-400 font-semibold">{{ progress?.toFixed(0) || '0' }}%</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div class="h-full gold-gradient transition-all duration-1000 ease-out rounded-full" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="glass-dark rounded-xl p-6 stat-card transition-all duration-300">
            <div class="flex items-center justify-between mb-2">
              <i class="fas fa-wallet text-yellow-400 text-xl"></i>
              <span class="text-xs text-gray-400 uppercase tracking-wide">{{ t('dashboard.earnedToday') }}</span>
            </div>
            <div class="text-2xl md:text-3xl font-bold text-white">{{ settings.currency }}{{ earnings?.toFixed(2) || '0.00' }}</div>
          </div>
          <div class="glass-dark rounded-xl p-6 stat-card transition-all duration-300">
            <div class="flex items-center justify-between mb-2">
              <i class="fas fa-target text-yellow-400 text-xl"></i>
              <span class="text-xs text-gray-400 uppercase tracking-wide">{{ t('dashboard.dailyTarget') }}</span>
            </div>
            <div class="text-2xl md:text-3xl font-bold text-white">{{ settings.currency }}{{ dailyIncome?.toFixed(2) || '0.00' }}</div>
          </div>
          <div class="glass-dark rounded-xl p-6 stat-card transition-all duration-300 sm:col-span-2">
            <div class="flex items-center justify-between mb-2">
              <i class="fas fa-stopwatch text-yellow-400 text-xl"></i>
              <span class="text-xs text-gray-400 uppercase tracking-wide">{{ t('dashboard.timeWorking') }}</span>
            </div>
            <div class="text-2xl md:text-3xl font-bold text-white">{{ workingTime }}</div>
          </div>
        </div>
      </div>
    </div>

    <footer class="text-center text-gray-500 text-sm">
      <div class="glass rounded-xl p-4">
        <p>{{ t('footer.text') }}</p>
      </div>
    </footer>
  </div>
  `
}