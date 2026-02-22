<template>
  <div class="minesweeper">
    <div class="game-header">
      <h2>扫雷</h2>
      <div class="game-stats">
        <div class="stat">
          <span class="stat-icon">💣</span>
          <span class="stat-value">{{ minesLeft }}</span>
        </div>
        <div class="stat">
          <span class="stat-icon">⏱️</span>
          <span class="stat-value">{{ formatTime(gameTime) }}</span>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <div class="difficulty-selector">
        <button
          v-for="level in difficultyLevels"
          :key="level.name"
          class="difficulty-btn"
          :class="{ active: currentDifficulty === level.name }"
          @click="setDifficulty(level)"
        >
          {{ level.label }}
        </button>
      </div>
      <button class="restart-btn" @click="restartGame">
        🔄 重新开始
      </button>
    </div>

    <div class="game-container">
      <div
        class="game-board"
        :style="{ 
          gridTemplateColumns: `repeat(${gridWidth}, 30px)`,
          gridTemplateRows: `repeat(${gridHeight}, 30px)`
        }"
      >
        <div
          v-for="(cell, index) in grid"
          :key="index"
          class="cell"
          :class="{ 
            revealed: cell.revealed,
            flagged: cell.flagged,
            mine: cell.mine && cell.revealed,
            'mine-exploded': cell.mine && cell.revealed && !gameWon && !gameLost
          }"
          @click.left="handleLeftClick(cell)"
          @click.right.prevent="handleRightClick(cell)"
          @contextmenu.prevent
        >
          <span v-if="!cell.revealed" class="cell-content">
            {{ cell.flagged ? '🚩' : '' }}
          </span>
          <span v-else-if="cell.mine" class="cell-content">💣</span>
          <span v-else-if="cell.neighborCount > 0" class="cell-content number">{{ cell.neighborCount }}</span>
        </div>
      </div>
    </div>

    <div class="game-result" v-if="gameWon || gameLost">
      <div class="result-message">
        {{ gameWon ? '🎉 恭喜你赢了！' : '💥 游戏结束！' }}
      </div>
      <button class="result-btn" @click="restartGame">
        再玩一次
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Cell {
  index: number
  mine: boolean
  revealed: boolean
  flagged: boolean
  neighborCount: number
}

interface Difficulty {
  name: string
  label: string
  width: number
  height: number
  mines: number
}

const difficultyLevels: Difficulty[] = [
  { name: 'easy', label: '简单', width: 9, height: 9, mines: 10 },
  { name: 'medium', label: '中等', width: 16, height: 16, mines: 40 },
  { name: 'hard', label: '困难', width: 30, height: 16, mines: 99 }
]

const currentDifficulty = ref('easy')
const grid = ref<Cell[]>([])
const gridWidth = ref(9)
const gridHeight = ref(9)
const totalMines = ref(10)
const minesLeft = ref(10)
const gameTime = ref(0)
const gameWon = ref(false)
const gameLost = ref(false)
const gameStarted = ref(false)

let gameTimer: number

const currentDifficultyLevel = computed(() => {
  return difficultyLevels.find(d => d.name === currentDifficulty.value) || difficultyLevels[0]
})

function setDifficulty(level: Difficulty) {
  currentDifficulty.value = level.name
  gridWidth.value = level.width
  gridHeight.value = level.height
  totalMines.value = level.mines
  initGame()
}

function initGame() {
  const totalCells = gridWidth.value * gridHeight.value
  grid.value = Array.from({ length: totalCells }, (_, index) => ({
    index,
    mine: false,
    revealed: false,
    flagged: false,
    neighborCount: 0
  }))
  
  minesLeft.value = totalMines.value
  gameTime.value = 0
  gameWon.value = false
  gameLost.value = false
  gameStarted.value = false
  
  if (gameTimer) {
    clearInterval(gameTimer)
  }
}

function placeMines(firstClickIndex: number) {
  const totalCells = gridWidth.value * gridHeight.value
  const safeZone = new Set([firstClickIndex])
  
  // 添加安全区（第一次点击周围的格子）
  const firstClickRow = Math.floor(firstClickIndex / gridWidth.value)
  const firstClickCol = firstClickIndex % gridWidth.value
  
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const row = firstClickRow + dr
      const col = firstClickCol + dc
      if (row >= 0 && row < gridHeight.value && col >= 0 && col < gridWidth.value) {
        safeZone.add(row * gridWidth.value + col)
      }
    }
  }
  
  let placedMines = 0
  while (placedMines < totalMines.value) {
    const randomIndex = Math.floor(Math.random() * totalCells)
    if (!safeZone.has(randomIndex) && !grid.value[randomIndex].mine) {
      grid.value[randomIndex].mine = true
      placedMines++
    }
  }
  
  // 计算邻居地雷数
  for (let i = 0; i < totalCells; i++) {
    if (!grid.value[i].mine) {
      const neighbors = getNeighbors(i)
      grid.value[i].neighborCount = neighbors.filter(n => n.mine).length
    }
  }
}

function getNeighbors(index: number): Cell[] {
  const row = Math.floor(index / gridWidth.value)
  const col = index % gridWidth.value
  const neighbors: Cell[] = []
  
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      
      const newRow = row + dr
      const newCol = col + dc
      const newIndex = newRow * gridWidth.value + newCol
      
      if (newRow >= 0 && newRow < gridHeight.value && 
          newCol >= 0 && newCol < gridWidth.value) {
        neighbors.push(grid.value[newIndex])
      }
    }
  }
  
  return neighbors
}

function handleLeftClick(cell: Cell) {
  if (gameLost.value || gameWon.value) return
  if (cell.revealed || cell.flagged) return
  
  if (!gameStarted.value) {
    gameStarted.value = true
    placeMines(cell.index)
    gameTimer = window.setInterval(() => {
      gameTime.value++
    }, 1000)
  }
  
  revealCell(cell)
  checkWin()
}

function handleRightClick(cell: Cell) {
  if (gameLost.value || gameWon.value) return
  if (cell.revealed) return
  
  cell.flagged = !cell.flagged
  minesLeft.value = cell.flagged ? minesLeft.value - 1 : minesLeft.value + 1
}

function revealCell(cell: Cell) {
  if (cell.revealed || cell.flagged) return
  
  cell.revealed = true
  
  if (cell.mine) {
    gameOver(false)
    return
  }
  
  // 如果是空格子，自动揭开周围
  if (cell.neighborCount === 0) {
    const neighbors = getNeighbors(cell.index)
    neighbors.forEach(neighbor => {
      if (!neighbor.revealed && !neighbor.flagged) {
        revealCell(neighbor)
      }
    })
  }
}

function checkWin() {
  const revealedCount = grid.value.filter(cell => cell.revealed).length
  const totalCells = gridWidth.value * gridHeight.value
  
  if (revealedCount === totalCells - totalMines.value) {
    gameOver(true)
  }
}

function gameOver(won: boolean) {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
  
  if (won) {
    gameWon.value = true
    // 标记所有未标记的地雷
    grid.value.forEach(cell => {
      if (cell.mine && !cell.flagged) {
        cell.flagged = true
      }
    })
  } else {
    gameLost.value = true
    // 揭开所有地雷
    grid.value.forEach(cell => {
      if (cell.mine) {
        cell.revealed = true
      }
    })
  }
}

function restartGame() {
  initGame()
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})
</script>

<style scoped>
.minesweeper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #808080;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
}

.game-header h2 {
  margin: 0;
  color: #000080;
  font-size: 20px;
}

.game-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #000000;
  color: #ff0000;
  padding: 6px 12px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
}

.stat-icon {
  font-size: 16px;
}

.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.difficulty-selector {
  display: flex;
  gap: 8px;
}

.difficulty-btn {
  padding: 8px 16px;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  background: #c0c0c0;
  color: #000000;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.1s;
}

.difficulty-btn:hover {
  background: #d4d4d4;
}

.difficulty-btn:active {
  border-color: #000000 #ffffff #ffffff #000000;
}

.difficulty-btn.active {
  background: #000080;
  color: #ffffff;
}

.restart-btn {
  padding: 8px 24px;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  background: #c0c0c0;
  color: #000000;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.1s;
}

.restart-btn:hover {
  background: #d4d4d4;
}

.restart-btn:active {
  border-color: #000000 #ffffff #ffffff #000000;
}

.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #c0c0c0;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  overflow: auto;
}

.game-board {
  display: grid;
  gap: 1px;
  background: #808080;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}

.cell {
  width: 30px;
  height: 30px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  user-select: none;
  transition: all 0.1s;
}

.cell:hover:not(.revealed) {
  background: #d4d4d4;
}

.cell.revealed {
  background: #c0c0c0;
  border: 1px solid #808080;
  cursor: default;
}

.cell.flagged {
  background: #c0c0c0;
}

.cell.mine {
  background: #ff0000;
}

.cell.mine-exploded {
  background: #ff0000;
  border-color: #000000;
}

.cell-content {
  font-size: 16px;
}

.cell-content.number {
  font-weight: 900;
}

.cell.revealed .cell-content.number:nth-child(1) {
  color: #0000ff;
}

.cell.revealed .cell-content.number:nth-child(2) {
  color: #008000;
}

.cell.revealed .cell-content.number:nth-child(3) {
  color: #ff0000;
}

.cell.revealed .cell-content.number:nth-child(4) {
  color: #000080;
}

.cell.revealed .cell-content.number:nth-child(5) {
  color: #800000;
}

.cell.revealed .cell-content.number:nth-child(6) {
  color: #008080;
}

.cell.revealed .cell-content.number:nth-child(7) {
  color: #000000;
}

.cell.revealed .cell-content.number:nth-child(8) {
  color: #808080;
}

.game-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  border-radius: 8px;
}

.result-message {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
}

.result-btn {
  padding: 12px 32px;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  background: #c0c0c0;
  color: #000000;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.1s;
}

.result-btn:hover {
  background: #d4d4d4;
}

.result-btn:active {
  border-color: #000000 #ffffff #ffffff #000000;
}

@media (max-width: 768px) {
  .game-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .difficulty-selector {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>