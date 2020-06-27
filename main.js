const isTouch =  !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;  // True if mobile device

const ROWS = 6, COLS = 7;
const COLORS = ['#EAF0F1', '#3498DB', '#FAD02E']  // colors for background, human discs, AI discs
const MAXDEPTH = 6;


// Build board. Each slot can be 0 (empty), 1 (user) or 2 (AI).
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
buildBoard();

function buildBoard() {
    board_src = ''
    for (let j = 0; j < COLS; j++) {
        board_src += `<div class="column unhoverable" data-col="${j}">`
        for (let i = 0; i < ROWS; i++) {
            board_src += `<div class="slot" data-row="${i}" data-col="${j}"></div>`
        }
        board_src += '</div>'
    }
    document.querySelector('.board').innerHTML = board_src;
}


const textQuestion = document.querySelector('.question');
const textWinner = document.querySelector('.winner');
const buttonFirst = document.querySelector('.first');
const buttonSecond = document.querySelector('.second');
const buttonRestart = document.querySelector('.restart');
const elementBoard = document.querySelector('.board');
const columns = document.querySelectorAll('.column');


// Functions to manage the DOM
function hideElements(elements) {
    elements.forEach(e => e.classList.add('hidden'));
}

function showElements(elements) {
    elements.forEach(e => e.classList.remove('hidden'));
}

function freezeBoard() {
    columns.forEach(c => c.removeEventListener('click', moveHuman));
    columns.forEach(c => c.classList.add('unhoverable'));
}

function unfreezeBoard() {
    columns.forEach(c => c.addEventListener('click', moveHuman));
    if (!isTouch) {  // activate column hovering (not on mobile)
        columns.forEach(c => c.classList.remove('unhoverable'));
    }
}


// Set listeners for buttons First and Second
buttonFirst.addEventListener('click', function(e) {
    hideElements([this, buttonSecond, textQuestion]);
    showElements([elementBoard, buttonRestart, textWinner]);
    unfreezeBoard();
});

buttonSecond.addEventListener('click', function(e) {
    hideElements([this, buttonFirst, textQuestion]);
    showElements([elementBoard, buttonRestart, textWinner])
    setTimeout(moveAI, 20);  // ensure that the DOM has updated before running moveAI
});


// Get the row where a disc would fall if dropped into column colId of currentBoard
function getLowestAvailableRow(colId, currentBoard) {
    for (let rowId = ROWS - 1; rowId >= 0; rowId--) {
        if (currentBoard[rowId][colId] == 0) return rowId;
    }
    return -1;  // column is full (invalid move)
}


function dropDisc(colId, playerId) {
    // playerId = 1 (human) or 2 (AI)
    lowestRow = getLowestAvailableRow(colId, board);
    if (lowestRow != -1) {  // valid move
        // Animate the fall of the disc
        for (let i = 0; i <= lowestRow; i++) {
            setTimeout(() => {
                document.querySelector(`[data-row="${i}"][data-col="${colId}"]`).style.background = COLORS[playerId];
            }, 50 * i);  // Color slot
            if (i < lowestRow) {
                setTimeout(() => {
                    document.querySelector(`[data-row="${i}"][data-col="${colId}"]`).style.background = COLORS[0];
                }, 50 * (i + 1));  // Uncolor slot
            }
        }
        board[lowestRow][colId] = playerId;
    }
}


function moveHuman(e) {
    const colId = this.dataset.col;
    freezeBoard();
    dropDisc(colId, 1);
    setTimeout(() => {
        let eog = isEndOfGame(board);
        if (eog == 0) document.querySelector('.winner').innerHTML = "IT'S A DRAW.";
        else if (eog == 1) document.querySelector('.winner').innerHTML = "YOU WIN!";
        else moveAI();  // continue playing
    }, 310);  // allow the dropDisc animation to finish
}


function moveAI() {
    const bestColId = minimax(board, 'AI', MAXDEPTH, -Infinity, Infinity).bestColId;
    dropDisc(bestColId, 2);
    setTimeout(() => {
        eog = isEndOfGame(board);
        if (eog == 0) document.querySelector('.winner').innerHTML = "IT'S A DRAW.";
        else if (eog == 2) document.querySelector('.winner').innerHTML = "YOU LOSE...";
        else unfreezeBoard();  // continue playing (allow human player to click a column and trigger moveHuman)
    }, 310);  // allow the dropDisc animation to finish
}


function isEndOfGame(currentBoard) {
    // -1: no
    // 0: yes (draw)
    // 1: yes (Human wins)
    // 2: yes (AI wins)

    // Check 4 horizontally
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j + 3 < COLS; j++) {
            if (currentBoard[i][j] == currentBoard[i][j + 1] &&
                currentBoard[i][j] == currentBoard[i][j + 2] &&
                currentBoard[i][j] == currentBoard[i][j + 3] && 
                currentBoard[i][j] != 0) return currentBoard[i][j]
        }
    }
    
    // Check 4 vertically
    for (let i = 0; i + 3 < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (currentBoard[i][j] == currentBoard[i + 1][j] &&
                currentBoard[i][j] == currentBoard[i + 2][j] &&
                currentBoard[i][j] == currentBoard[i + 3][j] && 
                currentBoard[i][j] != 0) return currentBoard[i][j];
        }
    }
    
    // Check 4 diagonally (1)
    for (let i = 0; i + 3 < ROWS; i++) {
        for (let j = 0; j + 3 < COLS; j++) {
            if (currentBoard[i][j] == currentBoard[i + 1][j + 1] &&
                currentBoard[i][j] == currentBoard[i + 2][j + 2] &&
                currentBoard[i][j] == currentBoard[i + 3][j + 3] && 
                currentBoard[i][j] != 0) return currentBoard[i][j];
        }
    }

    // Check 4 diagonally (2)
    for (let i = 0; i + 3 < ROWS; i++) {
        for (let j = 0; j - 3 < COLS; j++) {
            if (currentBoard[i][j] == currentBoard[i + 1][j - 1] &&
                currentBoard[i][j] == currentBoard[i + 2][j - 2] &&
                currentBoard[i][j] == currentBoard[i + 3][j - 3] &&
                currentBoard[i][j] != 0) return currentBoard[i][j];
        }
    }

    // Check if any cell is empty
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (currentBoard[i][j] == 0) return -1;  // no winner and at least one slot available
        }
    }

    return 0;  // draw
}


function minimax(currentBoard, currentPlayer, depth, alpha, beta) {
    if (depth == 0) return evaluateIntermediateBoard(currentBoard);

    const eog = isEndOfGame(currentBoard);
    if (eog != -1) {
        let value;
        if (eog == 0) value = 0;
        else if (eog == 1) value = -10000000 * (depth + 1);
        else if (eog == 2) value = 10000000 * (depth + 1);
        return {value: value};
    }

    // neither end of game nor maximum depth reached
    if (currentPlayer == 'AI') {  // 'max' player (AI)
        let value = -Infinity, bestColId;
        for (let colId = 0; colId < COLS; colId++) {
            // Try to drop disc into column colId
            const rowId = getLowestAvailableRow(colId, currentBoard);
            if (rowId != -1) {  // valid move
                currentBoard[rowId][colId] = 2;
                const currentValue = minimax(currentBoard, 'human', depth - 1, alpha, beta).value;
                currentBoard[rowId][colId] = 0;
                if (currentValue > value) {
                    value = currentValue;
                    bestColId = colId;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
        }
        return {value: value, bestColId: bestColId};
    }
    else {  // 'min' player (human)
        let  value = Infinity, bestColId;
        for (let colId = 0; colId < COLS; colId++) {
            // Try to drop disc into column colId
            const rowId = getLowestAvailableRow(colId, currentBoard);
            if (rowId != -1) {  // valid move
                currentBoard[rowId][colId] = 1;
                const currentValue = minimax(currentBoard, 'AI', depth - 1, alpha, beta).value;
                currentBoard[rowId][colId] = 0;
                if (currentValue < value) {
                    value = currentValue;
                    bestColId = colId;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
        }
        return {value: value, bestColId: bestColId};
    }
}


// Compute the value of a window of 4 slots
function evaluateWindow(window) {
    let value = 0, counts = [0, 0, 0];  // store the number of slots with values 0, 1 and 2
    for (let i = 0; i < 4; i++) counts[window[i]]++;

    if (counts[2] == 3 && counts[0] == 1) value += 15;  // e.g. 2202
    else if (counts[2] == 2 && counts[0] == 2) value += 5;  // e.g. 0220
    
    if (counts[1] == 3 && counts[0] == 1) value -= 15;  // e.g. 0111
    else if (counts[1] == 2 && counts[0] == 2) value -= 5;  // e.g. 1010

    return value;
}


// Simple heuristic to compute the value of intermediate boards
function evaluateIntermediateBoard(currentBoard) {
    let value = 0;

    // Check 4 horizontally
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j + 3 < COLS; j++) {
            const window = [currentBoard[i][j], 
                            currentBoard[i][j + 1], 
                            currentBoard[i][j + 2], 
                            currentBoard[i][j + 3]];
            value += evaluateWindow(window);
        }
    }
    
    // Check 4 vertically
    for (let i = 0; i + 3 < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const window = [currentBoard[i][j], 
                            currentBoard[i + 1][j], 
                            currentBoard[i + 2][j], 
                            currentBoard[i + 3][j]];
            value += evaluateWindow(window);
        }
    }
    
    // Check 4 diagonally (1)
    for (let i = 0; i + 3 < ROWS; i++) {
        for (let j = 0; j + 3 < COLS; j++) {
            const window = [currentBoard[i][j], 
                            currentBoard[i + 1][j + 1], 
                            currentBoard[i + 2][j + 2], 
                            currentBoard[i + 3][j + 3]];
            value += evaluateWindow(window);
        }
    }

    // Check 4 diagonally (2)
    for (let i = 0; i + 3 < ROWS; i++) {
        for (let j = 0; j - 3 < COLS; j++) {
            const window = [currentBoard[i][j], 
                            currentBoard[i + 1][j - 1], 
                            currentBoard[i + 2][j - 2], 
                            currentBoard[i + 3][j - 3]];
            value += evaluateWindow(window);
        }
    }

    return {value: value};
}
