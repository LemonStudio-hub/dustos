<template>
  <div class="weather">
    <div class="weather-header">
      <h2>天气预报</h2>
      <div class="location-selector">
        <input v-model="searchQuery" placeholder="搜索城市..." @keyup.enter="searchCity" />
        <button @click="searchCity">🔍</button>
      </div>
    </div>

    <div class="weather-content">
      <!-- 当前天气 -->
      <div class="current-weather">
        <div class="weather-main">
          <div class="weather-icon">{{ currentWeather.icon }}</div>
          <div class="weather-temp">{{ currentWeather.temp }}°C</div>
          <div class="weather-desc">{{ currentWeather.description }}</div>
        </div>
        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-icon">💧</span>
            <span class="detail-label">湿度</span>
            <span class="detail-value">{{ currentWeather.humidity }}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💨</span>
            <span class="detail-label">风速</span>
            <span class="detail-value">{{ currentWeather.windSpeed }} m/s</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🌡️</span>
            <span class="detail-label">体感</span>
            <span class="detail-value">{{ currentWeather.feelsLike }}°C</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">👁️</span>
            <span class="detail-label">能见度</span>
            <span class="detail-value">{{ currentWeather.visibility }} km</span>
          </div>
        </div>
      </div>

      <!-- 城市信息 -->
      <div class="city-info">
        <div class="city-name">{{ currentCity }}</div>
        <div class="current-time">{{ currentTime }}</div>
      </div>

      <!-- 未来7天预报 -->
      <div class="forecast">
        <h3>未来7天</h3>
        <div class="forecast-list">
          <div
            v-for="(day, index) in forecast"
            :key="index"
            class="forecast-item"
          >
            <span class="day-name">{{ day.name }}</span>
            <span class="day-icon">{{ day.icon }}</span>
            <span class="day-temp">{{ day.temp }}°C</span>
            <span class="day-desc">{{ day.description }}</span>
          </div>
        </div>
      </div>

      <!-- 24小时预报 -->
      <div class="hourly-forecast">
        <h3>24小时预报</h3>
        <div class="hourly-list">
          <div
            v-for="(hour, index) in hourlyForecast"
            :key="index"
            class="hourly-item"
          >
            <span class="hour-time">{{ hour.time }}</span>
            <span class="hour-icon">{{ hour.icon }}</span>
            <span class="hour-temp">{{ hour.temp }}°C</span>
          </div>
        </div>
      </div>

      <!-- 天气提示 -->
      <div class="weather-tips">
        <h3>天气提示</h3>
        <div class="tips-list">
          <div v-for="(tip, index) in weatherTips" :key="index" class="tip-item">
            <span class="tip-icon">{{ tip.icon }}</span>
            <span class="tip-text">{{ tip.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const searchQuery = ref('')
const currentCity = ref('北京')
const currentTime = ref('')

const currentWeather = ref({
  temp: 22,
  feelsLike: 20,
  humidity: 65,
  windSpeed: 3.5,
  visibility: 10,
  description: '晴',
  icon: '☀️'
})

const forecast = ref([
  { name: '今天', icon: '☀️', temp: 22, description: '晴' },
  { name: '明天', icon: '⛅', temp: 20, description: '多云' },
  { name: '周三', icon: '🌧️', temp: 18, description: '小雨' },
  { name: '周四', icon: '⛈️', temp: 17, description: '雷阵雨' },
  { name: '周五', icon: '🌤️', temp: 19, description: '多云转晴' },
  { name: '周六', icon: '☀️', temp: 23, description: '晴' },
  { name: '周日', icon: '☀️', temp: 24, description: '晴' },
])

const hourlyForecast = ref([
  { time: '现在', icon: '☀️', temp: 22 },
  { time: '14:00', icon: '☀️', temp: 24 },
  { time: '15:00', icon: '⛅', temp: 23 },
  { time: '16:00', icon: '⛅', temp: 22 },
  { time: '17:00', icon: '🌤️', temp: 21 },
  { time: '18:00', icon: '🌤️', temp: 20 },
  { time: '19:00', icon: '🌙', temp: 19 },
  { time: '20:00', icon: '🌙', temp: 18 },
  { time: '21:00', icon: '🌙', temp: 17 },
  { time: '22:00', icon: '🌙', temp: 16 },
  { time: '23:00', icon: '🌙', temp: 15 },
  { time: '00:00', icon: '🌙', temp: 14 },
])

const weatherTips = computed(() => {
  const tips = []
  if (currentWeather.value.temp > 30) {
    tips.push({ icon: '☀️', text: '高温天气，注意防暑降温' })
  } else if (currentWeather.value.temp < 10) {
    tips.push({ icon: '❄️', text: '气温较低，注意保暖' })
  }
  if (currentWeather.value.humidity > 80) {
    tips.push({ icon: '💧', text: '湿度较高，注意防潮' })
  }
  if (currentWeather.value.windSpeed > 10) {
    tips.push({ icon: '💨', text: '大风天气，注意安全' })
  }
  if (currentWeather.value.description.includes('雨')) {
    tips.push({ icon: '☔', text: '记得带伞，注意出行安全' })
  }
  if (tips.length === 0) {
    tips.push({ icon: '😊', text: '天气不错，适合外出活动' })
  }
  return tips
})

let timeInterval: number

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function searchCity() {
  if (searchQuery.value.trim()) {
    currentCity.value = searchQuery.value
    simulateWeatherData()
    searchQuery.value = ''
  }
}

function simulateWeatherData() {
  // 模拟不同城市的天气数据
  const weathers = [
    { temp: 22, feelsLike: 20, humidity: 65, windSpeed: 3.5, visibility: 10, description: '晴', icon: '☀️' },
    { temp: 18, feelsLike: 16, humidity: 75, windSpeed: 4.2, visibility: 8, description: '多云', icon: '⛅' },
    { temp: 25, feelsLike: 27, humidity: 55, windSpeed: 2.8, visibility: 12, description: '晴', icon: '☀️' },
    { temp: 15, feelsLike: 13, humidity: 80, windSpeed: 5.1, visibility: 6, description: '小雨', icon: '🌧️' },
    { temp: 28, feelsLike: 30, humidity: 60, windSpeed: 3.0, visibility: 10, description: '晴', icon: '☀️' },
  ]
  
  const randomIndex = Math.floor(Math.random() * weathers.length)
  currentWeather.value = { ...weathers[randomIndex] }
}

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})
</script>

<style scoped>
.weather {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow-y: auto;
}

.weather-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.weather-header h2 {
  margin: 0;
  font-size: 24px;
}

.location-selector {
  display: flex;
  gap: 8px;
}

.location-selector input {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 14px;
  width: 200px;
}

.location-selector input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.location-selector button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.location-selector button:hover {
  background: rgba(255, 255, 255, 0.4);
}

.weather-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.current-weather {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.weather-icon {
  font-size: 80px;
  margin-bottom: 10px;
}

.weather-temp {
  font-size: 72px;
  font-weight: 300;
  margin-bottom: 10px;
}

.weather-desc {
  font-size: 24px;
  opacity: 0.9;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.detail-icon {
  font-size: 24px;
}

.detail-label {
  font-size: 14px;
  opacity: 0.8;
}

.detail-value {
  margin-left: auto;
  font-weight: 600;
}

.city-info {
  text-align: center;
  margin-bottom: 20px;
}

.city-name {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 5px;
}

.current-time {
  font-size: 16px;
  opacity: 0.8;
}

.forecast,
.hourly-forecast,
.weather-tips {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.forecast h3,
.hourly-forecast h3,
.weather-tips h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.forecast-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: background 0.2s;
}

.forecast-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.day-name {
  width: 60px;
  font-weight: 600;
}

.day-icon {
  font-size: 28px;
  width: 40px;
  text-align: center;
}

.day-temp {
  font-size: 20px;
  font-weight: 600;
  width: 60px;
}

.day-desc {
  flex: 1;
  opacity: 0.8;
}

.hourly-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 80px;
  transition: background 0.2s;
}

.hourly-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hour-time {
  font-size: 12px;
  opacity: 0.8;
}

.hour-icon {
  font-size: 24px;
}

.hour-temp {
  font-size: 18px;
  font-weight: 600;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.tip-icon {
  font-size: 24px;
}

.tip-text {
  flex: 1;
  font-size: 14px;
}

@media (max-width: 768px) {
  .weather-header {
    flex-direction: column;
    gap: 15px;
  }

  .location-selector input {
    width: 150px;
  }

  .weather-icon {
    font-size: 60px;
  }

  .weather-temp {
    font-size: 56px;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }

  .hourly-list {
    gap: 10px;
  }

  .hourly-item {
    min-width: 70px;
    padding: 10px;
  }
}
</style>