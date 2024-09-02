'use strict'

const MINE = '💣'
const EMPTY = ' '
const FLAG = '🚩'
const LIFE = '❤️'
const NORMAL = '😀'
const DEAD = '😵'
const WIN = '😎'
const HINT = '💡'

let gBoard
let gGame
let gMinesPoss
let gintervalID

let gLevel = {
    SIZE: 4,
    MINES: 2
}

function onInit() {

    clearInterval(gintervalID)
    resetGlobals()
    toggleModal()
    buildBoard()
    renderBoard()
    startTimer()
    renderFlagsCount()
    renderLives()
    renderHints()
    renderResetBtn(NORMAL)
}

function resetGlobals() {
    gMinesPoss = []

    gGame = {
        isOn: true,
        shownCount: 0,
        flagsCount: gLevel.MINES,
        secsPassed: 0,
        livesCount: gLevel.MINES === 2 ? 2 : 3,
        hintCount: 3,
        isHintOn: false
    }

}

function buildBoard() {
    gBoard = createMat(gLevel.SIZE, gLevel.SIZE)
    for (let i = 0; i < gLevel.SIZE; i++) {
        for (let j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] =
            {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isFlagged: false
            }

        }
    }


}

function randomizeMines() {

    for (let i = 0; i < gLevel.MINES; i++) {
        let pos = findEmptyPos() // {row:i,col:j}
        // model:
        gBoard[pos.row][pos.col].isMine = true
        // dom:
        gMinesPoss.push(pos)
    }

    console.log(gMinesPoss)

    // Developer mode:

    // gBoard[0][0].isMine = true
    // gBoard[0][1].isMine = true
    // gMinesPoss.push({ row: 0, col: 0 })
    // gMinesPoss.push({ row: 0, col: 1 })

    // console.log(gMinesPoss);

}

function setMinesNegsCount() {
    for (let i = 0; i < gMinesPoss.length; i++) {
        let pos = gMinesPoss[i]
        countNegs(pos.row, pos.col)
    }
}

function renderBoard() {
    let strHTML = ''
    for (let i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < gBoard.length; j++) {
            let className = getClassName({ i, j })

            strHTML += `<td
                        class="${className}"
                        onmousedown="OnCellClicked(this,event,${i},${j})">`
            '</td >'
        }
        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function OnCellClicked(elCell, ev, i, j) {

    if (!gGame.isOn) return
    let cell = gBoard[i][j]

    // left-Click 
    if (!ev.button) {

        if (cell.isFlagged || cell.isShown) return

        if (gGame.isHintOn) {
            giveHint(i, j)
            return
        }
        // Update model
        cell.isShown = true
        gGame.shownCount++

        if (gGame.shownCount === 1) { // First left-click
            randomizeMines()
            setMinesNegsCount()
            renderHints()
        }
        if (!cell.minesAroundCount && !cell.isMine) {// Cell is empty
            expandShown(i, j, true)
            checkGameOver(cell)
            return
        }
        //  Update model:

        // Right-click
    } else {

        if (cell.isShown || (!gGame.flagsCount && !cell.isFlagged)) return

        // Update model
        if (!cell.isFlagged) { // Flag cell
            gGame.flagsCount--
            cell.isFlagged = true
        } else { //unFlag cell
            gGame.flagsCount++
            cell.isFlagged = false
        }
    }

    // Update dom:
    renderFlagsCount()
    renderCell(elCell, cell, ev)
    checkGameOver(cell)
}

function renderCell(elCell, cell, ev = { button: 0 }) {

    if (!ev.button) { // left-click
        elCell.classList.add('show')
        if (cell.isMine) elCell.innerText = MINE
        else elCell.innerText = cell.minesAroundCount ? `${cell.minesAroundCount}` : EMPTY
    } else { // right-click
        elCell.innerText = cell.isFlagged ? FLAG : EMPTY
    }
}

function renderFlagsCount() {
    document.querySelector('.flagsCount span').innerText = `${gGame.flagsCount} `
}

function checkGameOver(cell) {

    (gGame.shownCount + gGame.flagsCount) === gLevel.SIZE ** 2

    if (cell.isMine && cell.isShown) { // Lose life
        gGame.livesCount--
        renderLives()

        if (!gGame.livesCount) {  // Lose game
            renderResetBtn(DEAD)
            document.querySelector('.modal').innerText = 'Game Over'
            gameOver()
            return
        }

    }

    let flaggedCount = gLevel.MINES - gGame.flagsCount
    let isBoardMarked = (gGame.shownCount + flaggedCount) === gLevel.SIZE ** 2
    let isMinesMarked = checkAllMinesMarked()

    if (isBoardMarked && isMinesMarked) { // Game won
        document.querySelector('.modal ').innerText = ' Game won '
        renderResetBtn(WIN)
        gameOver()
    }
}

function checkAllMinesMarked() {
    for (let i = 0; i < gMinesPoss.length; i++) {
        let pos = gMinesPoss[i]
        let cell = gBoard[pos.row][pos.col]

        if (!cell.isShown && !cell.isFlagged) return false
    }
    return true
}

function expandShown(row, col, cellIsClicked = false) {

    if (row < 0 || col < 0 || row >= gBoard.length || col >= gBoard.length) {
        return  // Out of bounds
    }

    // Get local veriables
    let cell = gBoard[row][col]
    let elCell = getCellElementByPos(row, col)

    if (cell.isShown && !cellIsClicked) return  // Already visited or shown by OnCellClicked()

    if (!cellIsClicked) { // Check if OnCellClicked() already updated model
        // Update model
        cell.isShown = true
        gGame.shownCount++
    }

    //Update dom
    renderCell(elCell, cell)

    if (cell.minesAroundCount) return // Not an empty cell

    // Recursively Show the neighbors
    expandShown(row - 1, col) // Up
    expandShown(row + 1, col) // Down
    expandShown(row, col - 1) // Left
    expandShown(row, col + 1) // Right
    expandShown(row - 1, col - 1) // Up-Left
    expandShown(row - 1, col + 1) // Up-Right
    expandShown(row + 1, col - 1) // Down-Left
    expandShown(row + 1, col + 1) // Down-Right
}

function toggleModal() {
    document.querySelector('.modal').hidden = gGame.isOn
}

function revealMines() {

    for (let i = 0; i < gMinesPoss.length; i++) {
        let pos = gMinesPoss[i]
        let elCell = getCellElementByPos(pos.row, pos.col)
        let cell = gBoard[pos.row][pos.col]
        renderCell(elCell, cell)
    }
}

function gameOver() {
    gGame.isOn = false
    revealMines()
    toggleModal() 
}

function onSetDifficulty(Level) {
    switch (Level) {
        case 'Easy':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            onInit()
            break
        case 'Medium':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            onInit()
            break
        case 'Hard':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            onInit()
            break
    }
}

function renderLives() {
    let elDiv = document.querySelector('.lives')
    let str = ''
    for (let i = 0; i < gGame.livesCount; i++) {
        str += LIFE
    }
    elDiv.innerHTML = str
}

function renderResetBtn(emojy) {
    let elDiv = document.querySelector('.reset')
    elDiv.innerHTML = emojy
}

function onHintClicked(el) {
    gGame.isHintOn = true
    el.style.filter= 'hue-rotate(0deg)'
}

function giveHint(i, j) {
    let poss = getNegsPoss(i, j)
    toggleShowNegs(poss)
    setTimeout(()=>{toggleShowNegs(poss)}, 1000)
    gGame.hintCount--
    gGame.isHintOn = false
    renderHints()
}

function toggleShowNegs(poss) {
    for (let i = 0; i < poss.length; i++) {
        let pos = poss[i]
        let cell = gBoard[pos.row][pos.col]
        let elCell = getCellElementByPos(pos.row, pos.col)

        cell.isShown = !cell.isShown
        cell.isShown ? renderCell(elCell, cell) : hideCell(elCell, cell)
    }
}

function hideCell(elCell, cell) {

    elCell.classList.remove('show')
    elCell.innerText = cell.isFlagged ? FLAG : EMPTY

}

function renderHints() {
    let elDiv = document.querySelector('.hints')
    let strHTML = ''
    for (let i = 0; i < gGame.hintCount; i++) {
        strHTML += `<span class="hint" onclick="onHintClicked(this)">${HINT}</span>`
    }
    elDiv.innerHTML =strHTML
    elDiv.hidden = Boolean(!gGame.shownCount)
}



