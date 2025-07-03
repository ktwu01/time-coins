export default {
  data() {
    return {
      hourlyRate: 25,
      startTime: '09:00',
      workHours: 8,
      now: new Date(),
      timer: null
    }
  },
  computed: {
    startDate() {
      const [h, m] = this.startTime.split(':')
      const d = new Date()
      d.setHours(parseInt(h), parseInt(m), 0, 0)
      return d
    },
    endDate() {
      const d = new Date(this.startDate)
      d.setHours(d.getHours() + Number(this.workHours))
      return d
    },
    earnings() {
      const ms = Math.min(this.now - this.startDate, this.endDate - this.startDate)
      if (ms <= 0) return 0
      const hours = ms / 3600000
      return hours * this.hourlyRate
    },
    progress() {
      const total = this.endDate - this.startDate
      const done = Math.min(Math.max(this.now - this.startDate, 0), total)
      return (done / total) * 100
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = new Date()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  template: `
  <div class="container mx-auto px-4 py-8 max-w-xl">
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">Time Coins Vue</h1>
    </header>
    <section class="glass-dark rounded-2xl p-6 mb-8 space-y-4">
      <div>
        <label class="block text-sm text-gray-300 mb-1">Hourly Rate</label>
        <input type="number" v-model.number="hourlyRate" class="w-full p-2 rounded-md text-black" />
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">Start Time</label>
        <input type="time" v-model="startTime" class="w-full p-2 rounded-md text-black" />
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">Work Hours</label>
        <input type="number" v-model.number="workHours" class="w-full p-2 rounded-md text-black" />
      </div>
    </section>
    <section class="glass-dark rounded-2xl p-6 text-center">
      <div class="text-xl mb-2">Earnings</div>
      <div class="text-3xl font-bold text-yellow-400 mb-4">{{ earnings.toFixed(2) }}</div>
      <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div class="bg-yellow-400 h-4" :style="{ width: progress + '%' }"></div>
      </div>
    </section>
  </div>
  `
}
