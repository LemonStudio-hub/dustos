<template>
  <div class="snake-game">
    <div class="game-header">
      <h2>贪吃蛇</h2>
      <div class="game-stats">
        <div class="stat">
          <span class="stat-icon">🏆</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">最高: {{ highScore }}</span>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <div class="speed-selector">
        <button
          v-for="speed in speeds"
          :key="speed.value"
          class="speed-btn"
          :class="{ active: currentSpeed === speed.value }"
          @click="setSpeed(speed.value)"
        >
          {{ speed.label }}
        </button>
      </div>
      <button class="control-btn" @click="startGame" v-if="!gameRunning">
        ▶️ 开始
      </button>
      <button class="control-btn" @click="pauseGame" v-else-if="!gamePaused">
        ⏸️ 暂停
      </button>
      <button class="control-btn" @click="resumeGame" v-else>
        ▶️ 继续
      </button>
      <button class="control-btn" @click="resetGame">
        🔄 重置
      </button>
    </div>

    <div class="game-area">
      <div class="game-board" ref="boardRef">
        <canvas ref="canvasRef" width="600" height="600"></canvas>
        <div v-if="!gameRunning && score === 0" class="start-screen">
          <div class="start-icon">🐍</div>
          <div class="start-text">贪吃蛇</div>
          <div class="start-hint">点击开始按钮或按空格键开始</div>
          <div class="controls-hint">
            <div class="control-hint-item">
              <span class="key">↑</span>
              <span class="desc">上</span>
            </div>
            <div class="control-hint-item">
              <span class="key">↓</span>
              <span class="desc">下</span>
            </div>
            <div class="control-hint-item">
              <span class="key">←</span>
              <span class="desc">左</span>
            </div>
            <div class="control-hint-item">
              <span class="key">→</span>
              <span class="desc">右</span>
            </div>
          </div>
        </div>
        <div v-if="gamePaused" class="pause-screen">
          <div class="pause-icon">⏸️</div>
          <div class="pause-text">游戏暂停</div>
        </div>
        <div v-if="gameOver" class="game-over-screen">
          <div class="game-over-icon">💀</div>
          <div class="game-over-text">游戏结束</div>
          <div class="game-over-score">得分: {{ score }}</div>
          <button class="restart-btn" @click="resetGame">再玩一次</button>
        </div>
      </div>
    </div>

    <div class="mobile-controls" v-if="isMobile">
      <div class="d-pad">
        <button class="d-btn" @click="changeDirection('up')">↑</button>
        <div class="d-row">
          <button class="d-btn" @click="changeDirection('left')">←</button>
          <button class="d-btn" @click="changeDirection('down')">↓</button>
          <button class="d-btn" @click="changeDirection('right')">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const boardRef = ref<HTMLElement | null>(null)
const isMobile = useMediaQuery('(max-width: 768px)')

const GRID_SIZE = 20
const CELL_SIZE = 30

const gameRunning = ref(false)
const gamePaused = ref(false)
const gameOver = ref(false)
const score = ref(0)
const highScore = ref(0)
const currentSpeed = ref(150)
const gameInterval = ref<number | null>(null)

const speeds = [
  { label: '慢', value: 200 },
  { label: '中', value: 150 },
  { label: '快', value: 100 },
  { label: '极速', value: 50 }
]

interface Position {
  x: number
  y: number
}

let snake: Position[] = []
let direction: 'up' | 'down' | 'left' | 'right' = 'right'
let nextDirection: 'up' | 'down' | 'left' | 'right' = 'right'
let food: Position = { x: 0, y: 0 }
let ctx: CanvasRenderingContext2D | null = null

function setSpeed(speed: number) {
  currentSpeed.value = speed
  if (gameRunning.value && !gamePaused.value) {
    clearInterval(gameInterval.value!)
    gameInterval.value = window.setInterval(gameLoop, currentSpeed.value)
  }
}

function startGame() {
  if (gameRunning.value) return
  
  resetGameState()
  gameRunning.value = true
  gamePaused.value = false
  gameOver.value = false
  
  gameInterval.value = window.setInterval(gameLoop, currentSpeed.value)
}

function pauseGame() {
  if (!gameRunning.value || gamePaused.value) return
  
  gamePaused.value = true
  clearInterval(gameInterval.value!)
}

function resumeGame() {
  if (!gameRunning.value || !gamePaused.value) return
  
  gamePaused.value = false
  gameInterval.value = window.setInterval(gameLoop, currentSpeed.value)
}

function resetGame() {
  clearInterval(gameInterval.value!)
  resetGameState()
  gameRunning.value = false
  gamePaused.value = false
  gameOver.value = false
  score.value = 0
  draw()
}

function resetGameState() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ]
  direction = 'right'
  nextDirection = 'right'
  spawnFood()
}

function spawnFood() {
  const validPositions: Position[] = []
  
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const isOnSnake = snake.some(s => s.x === x && s.y === y)
      if (!isOnSnake) {
        validPositions.push({ x, y })
      }
    }
  }
  
  if (validPositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * validPositions.length)
    food = validPositions[randomIndex]
  }
}

function gameLoop() {
  if (gamePaused.value || gameOver.value) return
  
  direction = nextDirection
  moveSnake()
  checkCollision()
  draw()
}

function moveSnake() {
  const head = { ...snake[0] }
  
  switch (direction) {
    case 'up':
      head.y--
      break
    case 'down':
      head.y++
      break
    case 'left':
      head.x--
      break
    case 'right':
      head.x++
      break
  }
  
  // 检查是否吃到食物
  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head)
    score.value += 10
    spawnFood()
  } else {
    snake.unshift(head)
    snake.pop()
  }
}

function checkCollision() {
  const head = snake[0]
  
  // 检查墙壁碰撞
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame()
    return
  }
  
  // 检查自身碰撞
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame()
      return
    }
  }
}

function endGame() {
  gameOver.value = true
  gameRunning.value = false
  clearInterval(gameInterval.value!)
  
  if (score.value > highScore.value) {
    highScore.value = score.value
  }
}

function changeDirection(newDirection: 'up' | 'down' | 'left' | 'right') {
  if (!gameRunning.value || gamePaused.value) return
  
  // 防止反向移动
  const opposites: Record<string, string> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  }
  
  if (opposites[newDirection] !== direction) {
    nextDirection = newDirection
  }
}

function draw() {
  if (!ctx || !canvasRef.value) return
  
  // 清空画布
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  // 绘制网格
  ctx.strokeStyle = '#2a2a4e'
  ctx.lineWidth = 1
  
  for (let x = 0; x <= GRID_SIZE; x++) {
    ctx.beginPath()
    ctx.moveTo(x * CELL_SIZE, 0)
    ctx.lineTo(x * CELL_SIZE, canvasRef.value.height)
    ctx.stroke()
  }
  
  for (let y = 0; y <= GRID_SIZE; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * CELL_SIZE)
    ctx.lineTo(canvasRef.value.width, y * CELL_SIZE)
    ctx.stroke()
  }
  
  // 绘制食物
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 4,
    0,
    Math.PI * 2
  )
  ctx.fill()
  
  // 绘制蛇
  snake.forEach((segment, index) => {
    const isHead = index === 0
    
    // 渐变色
    const gradient = ctx.createRadialGradient(
      segment.x * CELL_SIZE + CELL_SIZE / 2,
      segment.y * CELL_SIZE + CELL_SIZE / 2,
      0,
      segment.x * CELL_SIZE + CELL_SIZE / 2,
      segment.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2
    )
    
    if (isHead) {
      gradient.addColorStop(0, '#22c55e')
      gradient.addColorStop(1, '#16a34a')
    } else {
      const alpha = 1 - (index / snake.length) * 0.5
      gradient.addColorStop(0, `rgba(34, 197, 94, ${alpha})`)
      gradient.addColorStop(1, `rgba(22, 163, 74, ${alpha})`)
    }
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(
      segment.x * CELL_SIZE + 2,
      segment.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4,
      6
    )
    ctx.fill()
    
    // 绘制眼睛（头部）
    if (isHead) {
      ctx.fillStyle = 'white'
      const eyeOffset = 6
      const eyeSize = 4
      
      let eye1X, eye1Y, eye2X, eye2Y
      
      switch (direction) {
        case 'up':
          eye1X = segment.x * CELL_SIZE + 8
          eye1Y = segment.y * CELL_SIZE + 8
          eye2X = segment.x * CELL_SIZE + CELL_SIZE - 8
          eye2Y = segment.y * CELL_SIZE + 8
          break
        case 'down':
          eye1X = segment.x * CELL_SIZE + 8
          eye1Y = segment.y * CELL_SIZE + CELL_SIZE - 8
          eye2X = segment.x * CELL_SIZE + CELL_SIZE - 8
          eye2Y = segment.y * CELL_SIZE + CELL_SIZE - 8
          break
        case 'left':
          eye1X = segment.x * CELL_SIZE + CELL_SIZE - 8
          eye1Y = segment.y * CELL_SIZE + 8
          eye2X = segment.x * CELL_SIZE + CELL_SIZE - 8
          eye2Y = segment.y * CELL_SIZE + CELL_SIZE - 8
          break
        case 'right':
          eye1X = segment.x * CELL_SIZE + 8
          eye1Y = segment.y * CELL_SIZE + 8
          eye2X = segment.x * CELL_SIZE + 8
          eye2Y = segment.y * CELL_SIZE + CELL_SIZE - 8
          break
      }
      
      ctx.beginPath()
      ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2)
      ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2)
      ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      event.preventDefault()
      changeDirection('up')
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      event.preventDefault()
      changeDirection('down')
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      event.preventDefault()
      changeDirection('left')
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      event.preventDefault()
      changeDirection('right')
      break
    case ' ':
      event.preventDefault()
      if (!gameRunning.value) {
        startGame()
      } else if (gamePaused.value) {
        resumeGame()
      } else {
        pauseGame()
      }
      break
  }
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resetGameState()
    draw()
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  // 加载最高分
  const savedHighScore = localStorage.getItem('snake_highscore')
  if (savedHighScore) {
    highScore.value = parseInt(savedHighScore)
  }
})

onUnmounted(() => {
  clearInterval(gameInterval.value!)
  document.removeEventListener('keydown', handleKeydown)
  
  // 保存最高分
  localStorage.setItem('snake_highscore', highScore.value.toString())
})
</script>

<style scoped>
.snake-game {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f0f23;
  color: #e0e0e0;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1a2e;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #2a2a4e;
}

.game-header h2 {
  margin: 0;
  font-size: 24px;
}

.game-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a4e;
  padding: 8px 16px;
  border-radius: 8px;
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.speed-selector {
  display: flex;
  gap: 8px;
}

.speed-btn {
  padding: 8px 16px;
  background: #2a2a4e;
  color: #e0e0e0;
  border: 1px solid #3a3a5e;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.speed-btn:hover {
  background: #3a3a5e;
}

.speed-btn.active {
  background: #667eea;
  border-color: #667eea;
}

.control-btn {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.control-btn:hover {
  background: #5568d3;
}

.game-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #2a2a4e;
  padding: 20px;
  overflow: hidden;
}

.game-board {
  position: relative;
  width: 600px;
  height: 600px;
}

.game-board canvas {
  display: block;
  border-radius: 8px;
}

.start-screen,
.pause-screen,
.game-over-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(26, 26, 46, 0.9);
  border-radius: 8px;
}

.start-icon,
.pause-icon,
.game-over-icon {
  font-size: 64px;
}

.start-text,
.pause-text,
.game-over-text {
  font-size: 24px;
  font-weight: 600;
}

.start-hint {
  font-size: 14px;
  opacity: 0.6;
}

.controls-hint {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.control-hint-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.key {
  width: 32px;
  height: 32px;
  background: #2a2a4e;
  border: 1px solid #3a3a5e;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.desc {
  font-size: 12px;
  opacity: 0.6;
}

.game-over-score {
  font-size: 18px;
  opacity: 0.8;
}

.restart-btn {
  margin-top: 16px;
  padding: 12px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

.restart-btn:hover {
  background: #5568d3;
}

.mobile-controls {
  display: none;
  justify-content: center;
  padding: 20px;
}

.d-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.d-row {
  display: flex;
  gap: 8px;
}

.d-btn {
  width: 60px;
  height: 60px;
  background: #2a2a4e;
  color: #e0e0e0;
  border: 1px solid #3a3a5e;
  border-radius: 12px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.d-btn:active {
  background: #667eea;
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .game-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .speed-selector {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .game-board {
    width: 300px;
    height: 300px;
  }
  
  .mobile-controls {
    display: flex;
  }
}
</style>