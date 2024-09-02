'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function findEmptyPos() {
    var emptyPoss = []

    for (var i = 1; i < gBoard.length; i++) {
        for (var j = 1; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown) {
                var pos = { row: i, col: j }
                emptyPoss.push(pos)
            }
        }
    }
    var randIdx = getRandomInt(0, emptyPoss.length)
    var randPos = emptyPoss[randIdx]
    return randPos
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function getCellPosByElement(el) {
    let classStr = el.classList[0] // classList[0] is 'cell-i-j'
    let classArr = classStr.split('-')
    let pos = { i: classArr[1], j: classArr[2] }
    return pos
}

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getCellElementByPos(i, j) {
    return document.querySelector(`.cell-${i}-${j}`)
}

function countNegs(cellI, cellJ) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (gBoard[i][j].isMine) continue
            gBoard[i][j].minesAroundCount++
        }
    }
    return negsCount
}

function getNegsPoss(cellI, cellJ) {
    let poss = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isShown) continue
            poss.push({ row: i, col: j })
        }
    }
    return poss
}

function startTimer() {
    gintervalID = setInterval(() => {
        document.querySelector('.timer span').innerText = gGame.secsPassed++
        if (!gGame.isOn) clearInterval(intervalID)
    }, 1000)
}






