import BLOCKS from './blocks'

// 테트리스 영역
const playground = document.querySelector('.playground > ul')
const gameText = document.querySelector('.game-text')
const scoreDisplay = document.querySelector('.score')
const restartButton = document.querySelector('.game-text > button')
const holdArea = document.querySelector('.hold-item > ul')

// 가로 세로 상수
const GAME_ROWS = 20
const GAME_COLS = 10

// 변수
let score = 0
let duration = 500
let downInterval
let tempMovingItem
let holdItem
let holdCount = 1

const movingItem = {
  type: '',
  direction: 0,
  top: 0,
  left: 0,
}

init()

// functions
function init() {
  scoreDisplay.innerText = 0
  score = 0
  duration = 1000
  tempMovingItem = { ...movingItem }
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine()
  }

  for (let i = 0; i < 4; i++) {
    const li = document.createElement('li')
    const ul = document.createElement('ul')
    for (let y = 0; y < 4; y++) {
      const matrix = document.createElement('li')
      ul.prepend(matrix)
    }
    li.prepend(ul)
    holdArea.prepend(li)
  }

  generateNewBlock()
}

function prependNewLine() {
  const li = document.createElement('li')
  const ul = document.createElement('ul')
  for (let y = 0; y < GAME_COLS; y++) {
    const matrix = document.createElement('li')
    ul.prepend(matrix)
  }
  li.prepend(ul)
  playground.prepend(li)
}

function renderBlocks(moveType = '') {
  const { type, direction, top, left } = tempMovingItem
  const movingBlocks = document.querySelectorAll('.moving')
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, 'moving')
  })

  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left
    const y = block[1] + top
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null

    const isAvailable = checkEmpty(target)
    if (isAvailable) {
      target.classList.add(type, 'moving')
    } else {
      tempMovingItem = { ...movingItem }
      if (moveType === 'retry') {
        clearInterval(downInterval)
        showGameOverText()
      }
      setTimeout(() => {
        renderBlocks('retry')
        if (moveType === 'top') {
          seizeBlock()
        }
      }, 0)
      return true
    }
  })

  movingItem.top = top
  movingItem.left = left
  movingItem.direction = direction
}

function showGameOverText() {
  gameText.style.display = 'flex'
}

// 블럭이 더 이상 내려가지 않도록 함
function seizeBlock() {
  const movingBlocks = document.querySelectorAll('.moving')
  movingBlocks.forEach((moving) => {
    moving.classList.remove('moving')
    moving.classList.add('seized')
  })
  checkMatch()
}

function checkMatch() {
  const childNodes = playground.childNodes

  childNodes.forEach((child) => {
    let matched = true
    child.childNodes[0].childNodes.forEach((li) => {
      if (!li.classList.contains('seized')) {
        matched = false
      }
    })
    if (matched) {
      child.remove()
      scoreDisplay.innerText = ++score
      prependNewLine()
    }
  })

  generateNewBlock()
}

function generateNewBlock() {
  holdCount = 1
  clearInterval(downInterval)
  downInterval = setInterval(() => {
    moveBlock('top', 1)
  }, duration)

  const blockArray = Object.entries(BLOCKS)
  const randomIndex = Math.floor(Math.random() * blockArray.length)
  movingItem.type = blockArray[randomIndex][0]
  movingItem.top = 0
  movingItem.left = 3
  movingItem.direction = 0
  tempMovingItem = { ...movingItem }
  renderBlocks()
}

function checkEmpty(target) {
  if (!target || target.classList.contains('seized')) {
    return false
  }

  return true
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount
  renderBlocks(moveType)
}

function changeDirection() {
  const direction = tempMovingItem.direction
  direction === 3
    ? (tempMovingItem.direction = 0)
    : (tempMovingItem.direction += 1)
  renderBlocks()
}

function dropBlock() {
  clearInterval(downInterval)
  downInterval = setInterval(() => {
    moveBlock('top', 1)
  }, 10)
}

function renderHold() {
  if (!holdItem) return

  holdArea.innerHTML = ''
  for (let i = 0; i < 4; i++) {
    const li = document.createElement('li')
    const ul = document.createElement('ul')
    for (let y = 0; y < 4; y++) {
      const matrix = document.createElement('li')
      ul.prepend(matrix)
    }
    li.prepend(ul)
    holdArea.prepend(li)
  }

  const { type, direction } = holdItem

  BLOCKS[type][direction].forEach((block) => {
    const x = block[0]
    const y = block[1]
    const target = holdArea.childNodes[y].childNodes[0].childNodes[x]

    target.classList.add(type)
  })
}

function hold() {
  if (holdCount === 0) return
  const movingBlocks = document.querySelectorAll('.moving')
  movingBlocks.forEach((moving) => {
    moving.classList.remove(tempMovingItem.type, 'moving')
  })
  if (!holdItem) {
    holdItem = { ...movingItem }
    renderHold()
    generateNewBlock()
  } else {
    holdCount--
    const temp = { ...movingItem }
    movingItem.type = holdItem.type
    movingItem.direction = 0
    movingItem.top = 0
    movingItem.left = 3
    holdItem = temp
    holdItem.direction = 0
    tempMovingItem = { ...movingItem }
    renderHold()
    renderBlocks()
  }
}

// event handling
document.addEventListener('keydown', (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock('left', 1)
      break
    case 37:
      moveBlock('left', -1)
      break
    case 40:
      moveBlock('top', 1)
      break
    case 38:
      changeDirection()
      break
    case 32:
      dropBlock()
      break
    case 67:
      hold()
      break
    default:
      break
  }
})

restartButton.addEventListener('click', () => {
  playground.innerHTML = ''
  gameText.style.display = 'none'
  init()
})
