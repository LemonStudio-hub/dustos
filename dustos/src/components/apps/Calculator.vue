<template>
  <div class="calculator" @click="focusCalculator">
    <div class="calculator-display">
      <div class="display-expression">{{ expression }}</div>
      <div class="display-value">{{ formattedDisplayValue }}</div>
    </div>

    <div class="calculator-tabs">
      <button 
        class="tab" 
        :class="{ active: mode === 'basic' }" 
        @click="mode = 'basic'"
      >
        基础
      </button>
      <button 
        class="tab" 
        :class="{ active: mode === 'scientific' }" 
        @click="mode = 'scientific'"
      >
        科学
      </button>
      <button 
        class="tab" 
        :class="{ active: showHistory }" 
        @click="showHistory = !showHistory"
      >
        历史
      </button>
    </div>

    <!-- 历史记录面板 -->
    <div v-if="showHistory" class="history-panel">
      <div class="history-header">
        <span>计算历史</span>
        <button class="clear-history" @click="clearHistory">清空</button>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, index) in history" 
          :key="index" 
          class="history-item"
          @click="useHistoryValue(item.result)"
        >
          <span class="history-expression">{{ item.expression }}</span>
          <span class="history-result">= {{ item.result }}</span>
        </div>
        <div v-if="history.length === 0" class="history-empty">
          暂无历史记录
        </div>
      </div>
    </div>

    <!-- 基础计算器按钮 -->
    <div v-else-if="mode === 'basic'" class="calculator-buttons">
      <button class="btn btn-function" @click="clear">C</button>
      <button class="btn btn-function" @click="clearEntry">CE</button>
      <button class="btn btn-function" @click="backspace">⌫</button>
      <button class="btn btn-operator" @click="appendOperator('/')">÷</button>

      <button class="btn btn-number" @click="appendNumber('7')">7</button>
      <button class="btn btn-number" @click="appendNumber('8')">8</button>
      <button class="btn btn-number" @click="appendNumber('9')">9</button>
      <button class="btn btn-operator" @click="appendOperator('*')">×</button>

      <button class="btn btn-number" @click="appendNumber('4')">4</button>
      <button class="btn btn-number" @click="appendNumber('5')">5</button>
      <button class="btn btn-number" @click="appendNumber('6')">6</button>
      <button class="btn btn-operator" @click="appendOperator('-')">−</button>

      <button class="btn btn-number" @click="appendNumber('1')">1</button>
      <button class="btn btn-number" @click="appendNumber('2')">2</button>
      <button class="btn btn-number" @click="appendNumber('3')">3</button>
      <button class="btn btn-operator" @click="appendOperator('+')">+</button>

      <button class="btn btn-number" @click="toggleSign">±</button>
      <button class="btn btn-number" @click="appendNumber('0')">0</button>
      <button class="btn btn-number" @click="appendDecimal">.</button>
      <button class="btn btn-equals" @click="calculate">=</button>
    </div>

    <!-- 科学计算器按钮 -->
    <div v-else class="calculator-buttons scientific">
      <button class="btn btn-scientific" @click="scientificFunction('sin')">sin</button>
      <button class="btn btn-scientific" @click="scientificFunction('cos')">cos</button>
      <button class="btn btn-scientific" @click="scientificFunction('tan')">tan</button>
      <button class="btn btn-function" @click="clear">C</button>

      <button class="btn btn-scientific" @click="scientificFunction('asin')">sin⁻¹</button>
      <button class="btn btn-scientific" @click="scientificFunction('acos')">cos⁻¹</button>
      <button class="btn btn-scientific" @click="scientificFunction('atan')">tan⁻¹</button>
      <button class="btn btn-function" @click="backspace">⌫</button>

      <button class="btn btn-scientific" @click="scientificFunction('log')">log</button>
      <button class="btn btn-scientific" @click="scientificFunction('ln')">ln</button>
      <button class="btn btn-scientific" @click="scientificFunction('sqrt')">√</button>
      <button class="btn btn-operator" @click="appendOperator('/')">÷</button>

      <button class="btn btn-scientific" @click="scientificFunction('pow2')">x²</button>
      <button class="btn btn-scientific" @click="scientificFunction('pow')">xʸ</button>
      <button class="btn btn-scientific" @click="appendConstant('pi')">π</button>
      <button class="btn btn-operator" @click="appendOperator('*')">×</button>

      <button class="btn btn-number" @click="appendNumber('7')">7</button>
      <button class="btn btn-number" @click="appendNumber('8')">8</button>
      <button class="btn btn-number" @click="appendNumber('9')">9</button>
      <button class="btn btn-operator" @click="appendOperator('-')">−</button>

      <button class="btn btn-scientific" @click="scientificFunction('pow3')">x³</button>
      <button class="btn btn-number" @click="appendNumber('4')">4</button>
      <button class="btn btn-number" @click="appendNumber('5')">5</button>
      <button class="btn btn-operator" @click="appendOperator('+')">+</button>

      <button class="btn btn-scientific" @click="appendConstant('e')">e</button>
      <button class="btn btn-number" @click="appendNumber('1')">1</button>
      <button class="btn btn-number" @click="appendNumber('2')">2</button>
      <button class="btn btn-equals" @click="calculate">=</button>

      <button class="btn btn-scientific" @click="scientificFunction('fact')">n!</button>
      <button class="btn btn-number" @click="toggleSign">±</button>
      <button class="btn btn-number" @click="appendNumber('0')">0</button>
      <button class="btn btn-number" @click="appendDecimal">.</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentValue = ref('0')
const expression = ref('')
const operator = ref('')
const previousValue = ref('')
const waitingForOperand = ref(false)
const mode = ref('basic')
const showHistory = ref(false)
const history = ref<Array<{ expression: string; result: string }>>([])
const maxHistory = 20

const formattedDisplayValue = computed(() => {
  const num = parseFloat(currentValue.value)
  if (isNaN(num)) return currentValue.value
  
  // 科学计数法
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-7 && num !== 0)) {
    return num.toExponential(6)
  }
  
  // 千位分隔符
  if (currentValue.value.includes('.')) {
    const parts = currentValue.value.split('.')
    if (parts[0] !== undefined) {
      parts[0] = parseFloat(parts[0]).toLocaleString('en-US')
    }
    return parts.join('.')
  }
  
  return parseFloat(currentValue.value).toLocaleString('en-US', {
    maximumFractionDigits: 10
  })
})

function appendNumber(num: string) {
  if (waitingForOperand.value) {
    currentValue.value = num
    waitingForOperand.value = false
  } else {
    currentValue.value = currentValue.value === '0' ? num : currentValue.value + num
  }
  updateDisplay()
}

function appendDecimal() {
  if (waitingForOperand.value) {
    currentValue.value = '0.'
    waitingForOperand.value = false
  } else if (!currentValue.value.includes('.')) {
    currentValue.value += '.'
  }
  updateDisplay()
}

function appendOperator(op: string) {
  if (previousValue.value === '') {
    previousValue.value = currentValue.value
  } else if (operator.value && !waitingForOperand.value) {
    calculate()
  }
  operator.value = op
  waitingForOperand.value = true
  expression.value = `${previousValue.value} ${getDisplayOperator(op)}`
}

function getDisplayOperator(op: string): string {
  const operators: Record<string, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    '^': '^',
  }
  return operators[op] || op
}

function calculate() {
  if (!operator.value || previousValue.value === '') return
  
  const prev = parseFloat(previousValue.value)
  const current = parseFloat(currentValue.value)
  let result = 0

  switch (operator.value) {
    case '+':
      result = prev + current
      break
    case '-':
      result = prev - current
      break
    case '*':
      result = prev * current
      break
    case '/':
      result = current !== 0 ? prev / current : 0
      break
    case '^':
      result = Math.pow(prev, current)
      break
    default:
      return
  }

  const fullExpression = `${previousValue.value} ${getDisplayOperator(operator.value)} ${currentValue.value}`
  expression.value = `${fullExpression} =`
  addHistory(fullExpression, String(result))
  currentValue.value = formatResult(result)
  operator.value = ''
  previousValue.value = ''
  waitingForOperand.value = true
  updateDisplay()
}

function formatResult(num: number): string {
  if (isNaN(num) || !isFinite(num)) return 'Error'
  
  // 科学计数法
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-7 && num !== 0)) {
    return num.toExponential(8)
  }
  
  // 处理浮点数精度
  const rounded = Math.round(num * 1e10) / 1e10
  return String(rounded)
}

function scientificFunction(func: string) {
  const value = parseFloat(currentValue.value)
  let result = 0

  switch (func) {
    case 'sin':
      result = Math.sin(value * Math.PI / 180)
      break
    case 'cos':
      result = Math.cos(value * Math.PI / 180)
      break
    case 'tan':
      result = Math.tan(value * Math.PI / 180)
      break
    case 'asin':
      result = Math.asin(value) * 180 / Math.PI
      break
    case 'acos':
      result = Math.acos(value) * 180 / Math.PI
      break
    case 'atan':
      result = Math.atan(value) * 180 / Math.PI
      break
    case 'log':
      result = Math.log10(value)
      break
    case 'ln':
      result = Math.log(value)
      break
    case 'sqrt':
      result = Math.sqrt(value)
      break
    case 'pow2':
      result = Math.pow(value, 2)
      break
    case 'pow3':
      result = Math.pow(value, 3)
      break
    case 'pow':
      operator.value = '^'
      previousValue.value = currentValue.value
      waitingForOperand.value = true
      expression.value = `${previousValue.value} ^`
      return
    case 'fact':
      result = factorial(Math.floor(value))
      break
    default:
      return
  }

  addHistory(`${func}(${value})`, String(result))
  currentValue.value = formatResult(result)
  waitingForOperand.value = true
  updateDisplay()
}

function factorial(n: number): number {
  if (n < 0) return NaN
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

function appendConstant(constant: string) {
  if (waitingForOperand.value) {
    currentValue.value = ''
    waitingForOperand.value = false
  }
  
  switch (constant) {
    case 'pi':
      currentValue.value = String(Math.PI)
      break
    case 'e':
      currentValue.value = String(Math.E)
      break
  }
  updateDisplay()
}

function clear() {
  currentValue.value = '0'
  previousValue.value = ''
  operator.value = ''
  expression.value = ''
  waitingForOperand.value = false
  updateDisplay()
}

function clearEntry() {
  currentValue.value = '0'
  waitingForOperand.value = false
  updateDisplay()
}

function backspace() {
  if (currentValue.value.length > 1) {
    currentValue.value = currentValue.value.slice(0, -1)
  } else {
    currentValue.value = '0'
  }
  updateDisplay()
}

function toggleSign() {
  currentValue.value = String(parseFloat(currentValue.value) * -1)
  updateDisplay()
}

function updateDisplay() {
  // Display is computed
}

function addHistory(expr: string, result: string) {
  history.value.unshift({ expression: expr, result: result })
  if (history.value.length > maxHistory) {
    history.value.pop()
  }
}

function clearHistory() {
  history.value = []
}

function useHistoryValue(value: string) {
  currentValue.value = value
  showHistory.value = false
  updateDisplay()
}

function focusCalculator() {
  // 用于键盘事件监听
}

function handleKeydown(e: KeyboardEvent) {
  const key = e.key
  
  // 数字
  if (/^[0-9]$/.test(key)) {
    appendNumber(key)
    return
  }
  
  // 运算符
  if (key === '+') appendOperator('+')
  if (key === '-') appendOperator('-')
  if (key === '*') appendOperator('*')
  if (key === '/') appendOperator('/')
  
  // 其他功能
  if (key === 'Enter' || key === '=') {
    e.preventDefault()
    calculate()
  }
  if (key === 'Escape') clear()
  if (key === 'Backspace') backspace()
  if (key === '.') appendDecimal()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  background: #2d2d2d;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

:global(.dark) .calculator {
  background: #1a1a1a;
}

.calculator-display {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: right;
}

:global(.dark) .calculator-display {
  background: #0d0d0d;
}

.display-expression {
  min-height: 24px;
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  overflow-x: auto;
  white-space: nowrap;
}

.display-value {
  font-size: 36px;
  font-weight: 300;
  color: #ffffff;
  word-wrap: break-word;
  line-height: 1.2;
}

.calculator-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #3d3d3d;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: #4d4d4d;
}

.tab.active {
  background: #667eea;
  color: white;
}

:global(.dark) .tab {
  background: #333;
}

:global(.dark) .tab:hover {
  background: #444;
}

:global(.dark) .tab.active {
  background: #667eea;
}

.history-panel {
  flex: 1;
  overflow-y: auto;
  background: #1a1a1a;
  border-radius: 12px;
  padding: 12px;
  max-height: 400px;
}

:global(.dark) .history-panel {
  background: #0d0d0d;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #3d3d3d;
  margin-bottom: 8px;
  font-size: 13px;
  color: #888;
}

.clear-history {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: #ff6b6b;
  color: white;
  font-size: 11px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.clear-history:hover {
  opacity: 0.8;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 8px;
  background: #2d2d2d;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #3d3d3d;
}

.history-expression {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.history-result {
  display: block;
  font-size: 16px;
  color: #667eea;
  font-weight: 500;
  text-align: right;
}

.history-empty {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 13px;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.calculator-buttons.scientific {
  grid-template-columns: repeat(4, 1fr);
}

.btn {
  height: 52px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: scale(0.95);
}

.btn-number {
  background: #3d3d3d;
  color: #ffffff;
}

.btn-number:hover {
  background: #4d4d4d;
}

.btn-operator {
  background: #ff9f0a;
  color: #ffffff;
}

.btn-operator:hover {
  background: #ffb340;
}

.btn-function {
  background: #a5a5a5;
  color: #000000;
}

.btn-function:hover {
  background: #b5b5b5;
}

.btn-equals {
  background: #667eea;
  color: #ffffff;
  grid-column: span 1;
}

.btn-equals:hover {
  background: #7b8fef;
}

.btn-scientific {
  background: #4a4a4a;
  color: #667eea;
  font-size: 14px;
}

.btn-scientific:hover {
  background: #5a5a5a;
}

:global(.dark) .btn-number {
  background: #2a2a2a;
}

:global(.dark) .btn-number:hover {
  background: #3a3a3a;
}

:global(.dark) .btn-function {
  background: #444;
  color: #ccc;
}

:global(.dark) .btn-function:hover {
  background: #555;
}

:global(.dark) .btn-scientific {
  background: #333;
}

:global(.dark) .btn-scientific:hover {
  background: #444;
}

@media (hover: none) and (pointer: coarse) {
  .calculator {
    max-width: 100%;
    padding: 16px;
    border-radius: 0;
  }

  .calculator-display {
    padding: 16px;
    margin-bottom: 12px;
  }

  .display-value {
    font-size: 32px;
  }

  .calculator-tabs {
    margin-bottom: 12px;
  }

  .tab {
    padding: 10px;
    font-size: 14px;
  }

  .calculator-buttons {
    gap: 6px;
  }

  .btn {
    height: 48px;
    font-size: 20px;
  }

  .btn-scientific {
    font-size: 13px;
  }

  .history-panel {
    max-height: 300px;
  }
}
</style>