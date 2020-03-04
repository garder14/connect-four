let isTouch =  !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;

const rows = 6, cols = 7;
const colorUser = '#3498DB', colorAI = '#FAD02E';
const maximumDepth = 6;


// Build board
let board = Array(rows).fill().map(() => Array(cols).fill(0));
showBoard();

function showBoard() {
    board_src = ''
    for (let j = 0; j < cols; j++) {
        board_src += `<div class="column nohover" data-col="${j}">`
        for (let i = 0; i < rows; i++) {
            board_src += `<div class="cell" data-row="${i}" data-col="${j}"></div>`
        }
        board_src += '</div>'
    }
    document.querySelector('.board').innerHTML = board_src;
}


// Set listeners
const text = document.querySelector('.start');
const buttonFirst = document.querySelector('.first');
const buttonSecond = document.querySelector('.second');
const columns = document.querySelectorAll('.column');

buttonFirst.addEventListener('click', function(e) {
    this.classList.add('hidden');
    buttonSecond.classList.add('hidden');
    text.classList.add('hidden');

    document.querySelector('.board').classList.remove('hidden');
    document.querySelector('.restart').classList.remove('hidden');
    document.querySelector('.winner').classList.remove('hidden');

    setColumnListeners('add');    
});

buttonSecond.addEventListener('click', function(e) {
    buttonFirst.classList.add('hidden');
    this.classList.add('hidden');
    text.classList.add('hidden');

    document.querySelector('.board').classList.remove('hidden');
    document.querySelector('.restart').classList.remove('hidden');
    document.querySelector('.winner').classList.remove('hidden');

    setTimeout(moveAI, 20);
});

function setColumnListeners(action) {
    if (action == 'add') {
        for (let i = 0; i < columns.length; i++) {
            columns[i].addEventListener('click', dropToken);
            if (!isTouch) columns[i].classList.remove('nohover');  // don't highlight hovered columns on mobile
        }
    }
    else {
        for (let i = 0; i < columns.length; i++) {
            columns[i].removeEventListener('click', dropToken);
            columns[i].classList.add('nohover');
        }
    }
}


function getLowestRow(colId, currentBoard) {
    for (let rowId = rows - 1; rowId >= 0; rowId--) {
        if (currentBoard[rowId][colId] == 0) return rowId;
    }
    return -1;
}

function dropToken(e) {
    const colId = this.dataset.col;
    lowestRow = getLowestRow(colId, board);
    if (lowestRow != -1) {
        // Falling animation        
        setTimeout(function(){
            document.querySelector(`[data-row="0"][data-col="${colId}"]`).style.background = colorUser;}, 50);
        for (let i = 1; i <= lowestRow; i++) {
            setTimeout(function(){
                document.querySelector(`[data-row="${i - 1}"][data-col="${colId}"]`).style.background = "#EAF0F1";}, 50 + 50 * i);
            setTimeout(function(){
                document.querySelector(`[data-row="${i}"][data-col="${colId}"]`).style.background = colorUser;}, 50 + 50 * i);
        }

        board[lowestRow][colId] = 1;
        setColumnListeners('remove');
        setTimeout(moveAI, 350);
    }
}

function moveAI() {
    let eog = isEndGame(board);
    if (eog == 0) document.querySelector('.winner').innerHTML = "IT'S A DRAW.";
    else if (eog == 1) document.querySelector('.winner').innerHTML = "YOU WIN!";
    else {
        const result = minimax(board, 'max', maximumDepth, -Infinity, Infinity);
        const bestRow = result.bestRow, bestColumn = result.bestCol;

        setTimeout(function(){
            document.querySelector(`[data-row="0"][data-col="${bestColumn}"]`).style.background = colorAI;}, 50);
        for (let i = 1; i <= bestRow; i++) {
            setTimeout(function(){
                document.querySelector(`[data-row="${i - 1}"][data-col="${bestColumn}"]`).style.background = "#EAF0F1";}, 50 + 50*i);
            setTimeout(function(){
                document.querySelector(`[data-row="${i}"][data-col="${bestColumn}"]`).style.background = colorAI;}, 50 + 50*i);
        }        

        board[bestRow][bestColumn] = 2;
        eog = isEndGame(board);
        
        setTimeout(function(){
            if (eog == 2) document.querySelector('.winner').innerHTML = "YOU LOSE...";
            else if (eog == 0) document.querySelector('.winner').innerHTML = "IT'S A DRAW.";
            else setColumnListeners('add'); // continue playing    
        }, 350);
    }

}


function isEndGame(currentBoard) {
    // -1: no
    // 0: yes (draw)
    // 1: yes (User wins)
    // 2: yes (AI wins)

    // Check 4 horizontally
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j + 3 < cols; j++) {
            if (currentBoard[i][j] == currentBoard[i][j + 1] &&
                currentBoard[i][j] == currentBoard[i][j + 2] &&
                currentBoard[i][j] == currentBoard[i][j + 3] && 
                currentBoard[i][j] != 0) return currentBoard[i][j]
        }
    }
    
    // Check 4 vertically
    for (let i = 0; i + 3 < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (currentBoard[i][j] == currentBoard[i + 1][j] &&
                currentBoard[i][j] == currentBoard[i + 2][j] &&
                currentBoard[i][j] == currentBoard[i + 3][j] && 
                currentBoard[i][j] != 0) return currentBoard[i][j];
        }
    }
    
    // Check 4 diagonally (1)
    for (let i = 0; i + 3 < rows; i++) {
        for (let j = 0; j + 3 < cols; j++) {
            if (currentBoard[i][j] == currentBoard[i + 1][j + 1] &&
                currentBoard[i][j] == currentBoard[i + 2][j + 2] &&
                currentBoard[i][j] == currentBoard[i + 3][j + 3] && 
                currentBoard[i][j] != 0) return currentBoard[i][j];
        }
    }

    // Check 4 diagonally (2)
    for (let i = 0; i + 3 < rows; i++) {
        for (let j = 0; j - 3 < cols; j++) {
            if (currentBoard[i][j] == currentBoard[i + 1][j - 1] &&
                currentBoard[i][j] == currentBoard[i + 2][j - 2] &&
                currentBoard[i][j] == currentBoard[i + 3][j - 3] &&
                currentBoard[i][j] != 0) return currentBoard[i][j];
        }
    }

    // Check if any cell is empty
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (currentBoard[i][j] == 0) {
                return -1;  // not end of game: still slots (0s) left and no winner
            }
        }
    }

    return 0;
}

function evaluateWindow(window) {
    let eval = 0, counts = [0, 0, 0];
    for (let i = 0; i < 4; i++) counts[window[i]]++;

    if (counts[2] == 3 && counts[0] == 1) eval += 15;
    else if (counts[2] == 2 && counts[0] == 2) eval += 5;
    
    if (counts[1] == 3 && counts[0] == 1) eval -= 15;
    else if (counts[1] == 2 && counts[0] == 2) eval -= 5;

    return eval;
}

function evaluate(currentBoard) {
    let eval = 0;

    // Check 4 horizontally
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j + 3 < cols; j++) {
            const window = [currentBoard[i][j], currentBoard[i][j + 1], currentBoard[i][j + 2], currentBoard[i][j + 3]];
            eval += evaluateWindow(window);
        }
    }
    
    // Check 4 vertically
    for (let i = 0; i + 3 < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const window = [currentBoard[i][j], currentBoard[i + 1][j], currentBoard[i + 2][j], currentBoard[i + 3][j]];
            eval += evaluateWindow(window);
        }
    }
    
    // Check 4 diagonally (1)
    for (let i = 0; i + 3 < rows; i++) {
        for (let j = 0; j + 3 < cols; j++) {
            const window = [currentBoard[i][j], currentBoard[i + 1][j + 1], currentBoard[i + 2][j + 2], currentBoard[i + 3][j + 3]];
            eval += evaluateWindow(window);
        }
    }

    // Check 4 diagonally (2)
    for (let i = 0; i + 3 < rows; i++) {
        for (let j = 0; j - 3 < cols; j++) {
            const window = [currentBoard[i][j], currentBoard[i + 1][j - 1], currentBoard[i + 2][j - 2], currentBoard[i + 3][j - 3]];
            eval += evaluateWindow(window);
        }
    }

    return {value: eval, bestRow: -1, bestCol: -1};
}


function minimax(currentBoard, player, depth, alpha, beta) {
    if (depth == 0) return evaluate(currentBoard);

    const eog = isEndGame(currentBoard);
    if (eog != -1) {
        let eval;
        if (eog == 0) eval = 0;
        else if (eog == 1) eval = -10000000 * (depth + 1);
        else if (eog == 2) eval = 10000000 * (depth + 1);
        
        return {value: eval, bestRow: -1, bestCol: -1};
    }

    // neither end of game nor maximum depth reached
    
    if (player == 'max') {  // AI
        let value = -Infinity, bestRow, bestCol;
        for (let col = 0; col < cols; col++) {
            const row = getLowestRow(col, currentBoard);
            if (row == -1) continue; // not a valid move
            let nextBoard = JSON.parse(JSON.stringify(currentBoard));
            nextBoard[row][col] = 2;
            const currentValue = minimax(nextBoard, 'min', depth - 1, alpha, beta).value;
            if (currentValue > value) {
                value = currentValue;
                bestRow = row;
                bestCol = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
        }
        return {value: value, bestRow: bestRow, bestCol: bestCol};
    }
    else if (player == 'min') {  // user
        let  value = Infinity, bestRow, bestCol;
        for (let col = 0; col < cols; col++) {
            const row = getLowestRow(col, currentBoard);
            if (row == -1) continue; // not a valid move
            let nextBoard = JSON.parse(JSON.stringify(currentBoard));
            nextBoard[row][col] = 1;
            const currentValue = minimax(nextBoard, 'max', depth - 1, alpha, beta).value;
            if (currentValue < value) {
                value = currentValue;
                bestRow = row;
                bestCol = col;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) break;
        }
        return {value: value, bestRow: bestRow, bestCol: bestCol};
    }
}