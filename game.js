// Add seed to random
/* function jsf32(a, b, c, d) {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = a - (b << 27 | b >>> 5) | 0;
    a = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
}

Math.random = function () {
    Math.randSeed += 73;
    return (jsf32(Math.randSeed, Math.randSeed + 671, Math.randSeed + 1889, Math.randSeed + 56781))
}

Math.setSeed = function (seed) {
    Math.randSeed = seed;
}

var origRandom = Math.random;
Math.randSeed = 5; */

document.addEventListener('contextmenu', event => event.preventDefault());

let isGameOver = false
const root = document.querySelector(':root');
const board = document.querySelector(".board")
let gameOptions = getOptionValues(2);
updateOptionsText()

/* === Intro popup === */

// Size options
const sizeOptions = document.querySelectorAll("[option-size]")
sizeOptions.forEach(element => {
    element.addEventListener("click", () => {
        // Remove active state from previous active option
        document.querySelector("[option-size].option-btn--active").classList.remove("option-btn--active")

        // Add active state to clicked option
        element.classList.add("option-btn--active")

        // Update text
        gameOptions = getOptionValues(parseInt(element.innerHTML));
        updateOptionsText()
    })
})

// Start btn
const startBtn = document.querySelector(".btn-start")
startBtn.addEventListener("click", () => {
    toggleModes()
    init()
})

// Try again btn
const gameoverPopup = document.querySelector(".gameover-popup")
const tryAgainBtn = document.querySelector(".btn-try-again")
tryAgainBtn.addEventListener("click", () => {
    // Clear game board
    board.innerHTML = ""
    gameoverPopup.classList.add("hide")
    toggleModes();
})

// New game btn
const newGameBtn = document.querySelector(".btn-new-game")
newGameBtn.addEventListener("click", () => {
    board.innerHTML = ""
    toggleModes();
})

function toggleModes() {
    document.querySelector(".intro").classList.toggle("hide")
    document.querySelector(".game").classList.toggle("hide")
}

function getOptionValues(option) {
    switch (option) {
        case 1:
            return { size: 10, mines: 12 }
        case 2:
            return { size: 15, mines: 27 }
        case 3:
            return { size: 20, mines: 48 }
        case 4:
            return { size: 30, mines: 108 }
        case 5:
            return { size: 40, mines: 192 }
        default:
            return { size: 14, mines: 24 }
    }
}

function updateOptionsText() {
    document.querySelector("[option-result-size]").innerHTML = `${gameOptions.size}x${gameOptions.size}`
    document.querySelector("[option-result-mines]").innerHTML = gameOptions.mines
}

let cells_global
let curMinesAm

function init() {
    console.log("init")
    isGameOver = false
    curMinesAm = gameOptions.mines

    // Update css
    setRootVariable("cell-am", gameOptions.size)
    setBoardSize(gameOptions.size)

    // Display mines and flags amount to user
    document.querySelector("[data-total-mines]").innerHTML = gameOptions.mines
    updateFlagsText()

    cells_global = generateCells()
    assignNearbyMinesToCells()
    generateHtml(getMines())
    revealRandomEmpty()
}

function setRootVariable(varName, value) {
    root.style.setProperty(`--${varName}`, value);
}

function setBoardSize(newSize) {
    board.style.gridTemplateColumns = `repeat(${newSize}, var(--cell-size))`
    board.style.gridTemplateRows = `repeat(${newSize}, var(--cell-size))`
}

function cellClicked(e, clickType) {
    if (isGameOver) return

    var index = parseInt(e.id.replace("cell-", ""))
    var cell = cells_global[index]

    if (clickType == "left") {
        revealCell(cell)
        // Clicking on a cell that has 0 mines nearby
        if (cell.getNearbyMinesAm() == 0 && !cell.getIsRevealed()) {
            var nearby = getNearbyCells(index)
            nearby.push(cells_global[index])
            var empty = getEmptyInArr(nearby)

            empty.forEach(cell => {
                var nearby = getNearbyCells(cell.i)
                var empty = getEmptyInArr(nearby)
                revealCells(nearby)

                empty.forEach(cell => {
                    var nearby = getNearbyCells(cell.i)
                    var empty = getEmptyInArr(nearby)
                    revealCells(nearby)

                    empty.forEach(cell => {
                        var nearby = getNearbyCells(cell.i)
                        var empty = getEmptyInArr(nearby)
                        revealCells(nearby)
                    });
                });
            });
        }
        // Cell that has 1 or more mine nearby
        else if (cell.getNearbyMinesAm() > 0) {

        }
        // Mine
        else if (cell.getIsMine()) {
            gameOver()
        }
    }
    else if (clickType == "right") {
        e.querySelector(".flag").classList.toggle("hide")
    }
    updateFlagsText()
}

function updateFlagsText() {
    const flags = document.querySelectorAll(".flag:not(.hide)")
    document.querySelector("[data-flags]").innerHTML = `${flags.length}/${gameOptions.mines}`
}

function gameOver() {
    isGameOver = true

    setTimeout(() => {
        gameoverPopup.classList.remove("hide")
    }, 300);
}

function revealCell(cell) {
    cell.getIsRevealed(true)
    var e = document.querySelector(`#cell-${cell.i}`)
    var htmlClass
    var am

    if (cell.getIsMine()) {
        am = ""
        htmlClass = "mine"
    }
    else if (cell.getNearbyMinesAm() == 0) {
        am = ""
        htmlClass = "empty"
    }
    else {
        am = cell.getNearbyMinesAm()
        htmlClass = "revealed"
    }
    e.classList.add(htmlClass)
    e.innerHTML = am
}

function revealCells(arr) {
    arr.forEach(cell => {
        revealCell(cell)
    });
}

function revealRandomEmpty() {
    var emptys = []
    cells_global.forEach(cell => {
        if (cell.getNearbyMinesAm() == 0) emptys.push(cell)
    });

    // Reveal empty cell that has the most amount of empty cells nearby
    var bestCell = { cell: undefined, am: 0 }
    emptys.forEach(cell => {
        if (getNearbyEmptyByIndex(cell.i) > bestCell.am) {
            bestCell.cell = cell
            bestCell.am = getNearbyEmptyByIndex(cell.i)
        }
    });

    revealCell(bestCell.cell)
}

function generateCells() {
    var mines = getRandomMineCells()
    var cells = []

    for (let row = 0; row < gameOptions.size; row++) {
        for (let col = 0; col < gameOptions.size; col++) {
            var i = getIndexByRowCol(row, col)
            var isMine = mines.includes(i)
            cells.push(new Cell(i, false, isMine, "-"))
        }
    }
    return cells
}

function assignNearbyMinesToCells() {
    for (var i = 0; i < cells_global.length; i++) {
        var cell = cells_global[i]
        if (!cell.getIsMine()) {
            cell.setNearbyMines(getNearbyMinesByIndex(i))
        }
    }
}

function getRandomMineCells(size = gameOptions.mines) {
    var result = []

    // All available cells
    var allCells = []
    for (var i = 0; i < gameOptions.size * gameOptions.size; i++) {
        allCells.push(i)
    }

    // Select random from the available cells
    for (var i = 0; i < size; i++) {
        var rand = Math.floor(Math.random() * (allCells.length))
        result.push(allCells[rand])
        allCells.splice(rand, 1)
    }

    return result
}

function generateHtml() {
    var rootElement = document.querySelector(".board")
    for (let i = 0; i < gameOptions.size * gameOptions.size; i++) {
        var cell = cells_global[i]
        var htmlClass = ""
        rootElement.insertAdjacentHTML("beforeend", getHtmlCell(i, cell.getNearbyMinesAm(), htmlClass));
    }
}

function getHtmlCell(i, value, htmlClass) {
    return `
    <div onClick="cellClicked(this, 'left')" oncontextmenu="cellClicked(this, 'right')" class="cell ${htmlClass}" id="cell-${i}">
        <div class="flag hide"></div>
    </div>`
}

function getNearbyCells(index) {
    var cellsIndex = []
    var mainRowCol = getRowColByIndex(index)
    var startRow = mainRowCol.row - 1
    var startCol = mainRowCol.col - 1

    for (var rowi = 0; rowi < 3; rowi++) {
        for (var coli = 0; coli < 3; coli++) {
            var curRow = startRow + rowi
            var curCol = startCol + coli

            if (curRow >= 0 && curCol >= 0 && curRow < gameOptions.size && curCol < gameOptions.size) {
                var curIndex = getIndexByRowCol(curRow, curCol)
                if (curIndex != index)
                    cellsIndex.push(curIndex)
            }
        }
    }

    var result = []
    cellsIndex.forEach(i => {
        result.push(cells_global[i])
    });

    return result
}

function getRowColByIndex(i) {
    var row = Math.floor(i / gameOptions.size)
    var col = i % gameOptions.size;

    return { row: row, col: col }
}

function getIndexByRowCol(row, col) {
    return (row * gameOptions.size) + col
}

function getAmOfMinesInArr(arr) {
    var am = 0
    arr.forEach(cell => {
        if (cell.getIsMine()) am++
    });
    return am
}

function getAmOfEmptyInArr(arr) {
    var am = 0
    arr.forEach(cell => {
        if (cell.getNearbyMinesAm() == 0) am++
    });
    return am
}

function getEmptyInArr(arr) {
    var result = []
    arr.forEach(cell => {
        if (cell.getNearbyMinesAm() == 0) result.push(cell)
    });
    return result
}

function getNearbyMinesByIndex(i) {
    return getAmOfMinesInArr(getNearbyCells(i))
}

function getNearbyEmptyByIndex(i) {
    return getAmOfEmptyInArr(getNearbyCells(i))
}

function getMines() {
    var result = []
    for (var cell of cells_global) {
        if (cell.getIsMine())
            result.push(cell)
    }

    return result
}
