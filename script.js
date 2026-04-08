let squares = [];
let isGameOver = false;
let flags = 0;

function startGame(rows, cols, bombAmount) {
    const grid = document.getElementById('grid');
    const status = document.getElementById('status');
    grid.innerHTML = '';
    squares = [];
    isGameOver = false;
    flags = 0;
    status.innerHTML = `Mine da trovare: ${bombAmount}`;

    // Configura la griglia CSS
    grid.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    // 1. Crea array mescolato
    const gameArray = Array(bombAmount).fill('mine')
        .concat(Array(rows * cols - bombAmount).fill('empty'))
        .sort(() => Math.random() - 0.5);

    // 2. Crea le celle
    for (let i = 0; i < rows * cols; i++) {
        const square = document.createElement('div');
        square.setAttribute('id', i);
        square.classList.add('cell');
        square.dataset.type = gameArray[i];
        
        // Click Sinistro (Rivela)
        square.addEventListener('click', () => revealSquare(square, rows, cols));

        // Click Destro (Bandierina)
        square.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            addFlag(square);
        });

        grid.appendChild(square);
        squares.push(square);
    }

    // 3. Calcola i numeri dei vicini
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].dataset.type === 'empty') {
            const total = getNeighbors(i, rows, cols).filter(id => squares[id].dataset.type === 'mine').length;
            squares[i].dataset.total = total;
        }
    }
}

// Funzione per ottenere gli indici dei vicini validi
function getNeighbors(id, rows, cols) {
    const neighbors = [];
    const r = Math.floor(id / cols);
    const c = id % cols;

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                neighbors.push(nr * cols + nc);
            }
        }
    }
    return neighbors;
}

function addFlag(square) {
    if (isGameOver || square.classList.contains('revealed')) return;
    
    if (!square.classList.contains('flag')) {
        square.classList.add('flag');
    } else {
        square.classList.remove('flag');
    }
}

function revealSquare(square, rows, cols) {
    if (isGameOver || square.classList.contains('revealed') || square.classList.contains('flag')) return;

    square.classList.add('revealed');

    if (square.dataset.type === 'mine') {
        gameOver();
        return;
    }

    const total = parseInt(square.dataset.total);
    if (total !== 0) {
        square.innerHTML = total;
        return;
    }

    // RICORSIONE: se la cella è vuota, controlla i vicini
    const neighbors = getNeighbors(parseInt(square.id), rows, cols);
    neighbors.forEach(neighborId => {
        revealSquare(squares[neighborId], rows, cols);
    });
}

function gameOver() {
    isGameOver = true;
    document.getElementById('status').innerHTML = "BOOM! Hai perso!";
    squares.forEach(square => {
        if (square.dataset.type === 'mine') {
            square.classList.add('mine');
            square.innerHTML = '💣';
        }
    });
}

// Avvia una partita di default
startGame(9, 9, 10);