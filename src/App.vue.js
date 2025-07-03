import { DEFAULT_SETTINGS, MILESTONES, TIMEZONES, CURRENCIES } from './constants.js'

export default {
  data() {
    const saved = JSON.parse(localStorage.getItem('settings') || 'null')
    return {
      settings: Object.assign({}, DEFAULT_SETTINGS, saved || {}),
      now: new Date(),
      milestone: null,
      timer: null,
      TIMEZONES,
      CURRENCIES
    }
  },
  computed: {
    startDate() {
      const [h, m] = this.settings.startTime.split(':')
      const d = new Date()
      d.setHours(parseInt(h), parseInt(m), 0, 0)
      return d
    },
    endDate() {
      const d = new Date(this.startDate)
      d.setHours(d.getHours() + Number(this.settings.workHours))
      return d
    },
    earnings() {
      const ms = Math.min(Math.max(this.now - this.startDate, 0), this.endDate - this.startDate)
      const hours = ms / 3600000
      return hours * this.settings.hourlyRate
    },
    progress() {
      const total = this.endDate - this.startDate
      const done = Math.min(Math.max(this.now - this.startDate, 0), total)
      return total ? (done / total) * 100 : 0
    },
    workingTime() {
      const ms = Math.min(Math.max(this.now - this.startDate, 0), this.endDate - this.startDate)
      const minutes = Math.floor(ms / 60000)
      return `${Math.floor(minutes/60)}:${String(minutes%60).padStart(2,'0')}`
    },
    nextMilestone() {
      return MILESTONES.find(m => this.earnings < m.amount) || null
    }
  },
  watch: {
    settings: {
      handler() {
        localStorage.setItem('settings', JSON.stringify(this.settings))
      },
      deep: true
    }
  },
  methods: {
    checkMilestones() {
      const reached = MILESTONES.filter(m => this.earnings >= m.amount).pop() || null
      if (reached && (!this.milestone || reached.amount > this.milestone.amount)) {
        this.milestone = reached
      }
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = new Date()
      this.checkMilestones()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  template: `
  <div class="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
    <header class="text-center mb-12">
      <div class="glass rounded-3xl p-8 mb-8">
        <div class="flex items-center justify-center mb-4">
          <i class="fas fa-hourglass-half text-4xl text-yellow-400 mr-4 float-animation"></i>
          <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">Time Coins</h1>
        </div>
        <p class="text-gray-300 text-lg md:text-xl font-light">Transform every moment into golden value</p>
      </div>
    </header>
    <section class="glass-dark rounded-2xl p-6 md:p-8 mb-8">
      <div class="flex items-center mb-6">
        <i class="fas fa-cog text-yellow-400 text-xl mr-3"></i>
        <h2 class="text-2xl font-semibold text-white">Configuration</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-globe text-yellow-400 mr-2"></i>
            <span>Time Zone</span>
          </label>
          <select v-model="settings.timezone" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300">
            <option v-for="tz in TIMEZONES" :value="tz.value">{{ tz.label }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-coins text-yellow-400 mr-2"></i>
            <span>Currency</span>
          </label>
          <select v-model="settings.currency" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300">
            <option v-for="c in CURRENCIES" :value="c.symbol">{{ c.flag }} {{ c.symbol }} {{ c.code }} - {{ c.name }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-dollar-sign text-yellow-400 mr-2"></i>
            <span>Hourly Rate</span>
          </label>
          <input type="number" v-model.number="settings.hourlyRate" min="1" step="0.5" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-clock text-yellow-400 mr-2"></i>
            <span>Work Start Time</span>
          </label>
          <input type="time" v-model="settings.startTime" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
        <div class="space-y-2">
          <label class="flex items-center text-sm font-medium text-gray-300">
            <i class="fas fa-business-time text-yellow-400 mr-2"></i>
            <span>Daily Work Hours</span>
          </label>
          <input type="number" v-model.number="settings.workHours" min="1" max="24" step="0.5" class="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white elegant-input transition-all duration-300" />
        </div>
      </div>
    </section>
    <div v-if="milestone" class="glass gold-gradient text-black p-4 rounded-2xl mb-8 text-center font-semibold text-lg">
      <i class="fas fa-trophy mr-2"></i>
      <span>{{ milestone.message }}</span>
      <div class="text-sm mt-1 opacity-75" v-if="nextMilestone">
        <span>{{ settings.currency }}{{ (nextMilestone.amount - earnings).toFixed(2) }} to next milestone</span>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="glass-dark rounded-2xl p-8 text-center">
        <h3 class="text-xl font-semibold mb-6 flex items-center justify-center">
          <i class="fas fa-hourglass-start text-yellow-400 mr-3"></i>
          <span>Value Generator</span>
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
            <span class="text-sm font-medium text-gray-300">Daily Progress</span>
            <span class="text-sm text-yellow-400 font-semibold">{{ progress.toFixed(0) }}%</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div class="h-full gold-gradient transition-all duration-1000 ease-out rounded-full" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="glass-dark rounded-xl p-6 stat-card transition-all duration-300">
            <div class="flex items-center justify-between mb-2">
              <i class="fas fa-wallet text-yellow-400 text-xl"></i>
              <span class="text-xs text-gray-400 uppercase tracking-wide">Earned Today</span>
            </div>
            <div class="text-2xl md:text-3xl font-bold text-white">{{ settings.currency }}{{ earnings.toFixed(2) }}</div>
          </div>
          <div class="glass-dark rounded-xl p-6 stat-card transition-all duration-300">
            <div class="flex items-center justify-between mb-2">
              <i class="fas fa-target text-yellow-400 text-xl"></i>
              <span class="text-xs text-gray-400 uppercase tracking-wide">Daily Target</span>
            </div>
            <div class="text-2xl md:text-3xl font-bold text-white">{{ settings.currency }}{{ (settings.hourlyRate * settings.workHours).toFixed(2) }}</div>
          </div>
          <div class="glass-dark rounded-xl p-6 stat-card transition-all duration-300 sm:col-span-2">
            <div class="flex items-center justify-between mb-2">
              <i class="fas fa-stopwatch text-yellow-400 text-xl"></i>
              <span class="text-xs text-gray-400 uppercase tracking-wide">Time Working</span>
            </div>
            <div class="text-2xl md:text-3xl font-bold text-white">{{ workingTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <footer class="text-center text-gray-500 text-sm">
      <div class="glass rounded-xl p-4">
        <p>Transform your time into value • Built with elegance</p>
      </div>
    </footer>
  </div>
  `
}
