let squares = [];
let isGameOver = false;
let totalMines = 0;
let currentRows = 0;
let currentCols = 0;
let firstClick = true; // FIX #2: primo click sempre sicuro

function startGame(rows, cols, bombAmount) {
    const grid = document.getElementById('grid');
    const status = document.getElementById('status');
    grid.innerHTML = '';
    squares = [];
    isGameOver = false;
    firstClick = true; // FIX #2: reset primo click
    totalMines = bombAmount;
    currentRows = rows;
    currentCols = cols;

    updateMineCounter(); // FIX #4: aggiorna contatore

    // Configura la griglia CSS
    grid.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    // FIX #2: Crea tutte le celle come vuote, le mine verranno piazzate al primo click
    for (let i = 0; i < rows * cols; i++) {
        const square = document.createElement('div');
        square.setAttribute('id', i);
        square.classList.add('cell');
        square.dataset.type = 'empty';
        square.dataset.total = 0;

        square.addEventListener('click', () => handleClick(square));
        square.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            addFlag(square);
        });

        grid.appendChild(square);
        squares.push(square);
    }
}

// FIX #2: Genera le mine dopo il primo click, escludendo la cella cliccata
function placeMines(safeId) {
    const rows = currentRows;
    const cols = currentCols;
    const bombAmount = totalMines;

    // Indici da escludere: la cella cliccata e i suoi vicini
    const safeZone = new Set([safeId, ...getNeighbors(safeId, rows, cols)]);

    let available = [];
    for (let i = 0; i < rows * cols; i++) {
        if (!safeZone.has(i)) available.push(i);
    }

    // Mescola e prendi le prime bombAmount posizioni
    available.sort(() => Math.random() - 0.5);
    const mineIds = new Set(available.slice(0, bombAmount));

    squares.forEach((sq, i) => {
        sq.dataset.type = mineIds.has(i) ? 'mine' : 'empty';
    });

    // Calcola i numeri dei vicini
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].dataset.type === 'empty') {
            const total = getNeighbors(i, rows, cols)
                .filter(id => squares[id].dataset.type === 'mine').length;
            squares[i].dataset.total = total;
        }
    }
}

function handleClick(square) {
    if (isGameOver || square.classList.contains('revealed') || square.classList.contains('flag')) return;

    // FIX #2: Al primo click, piazza le mine evitando la cella cliccata
    if (firstClick) {
        firstClick = false;
        placeMines(parseInt(square.id));
    }

    revealSquare(square, currentRows, currentCols);
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

// FIX #4: Aggiorna il contatore mine (mine totali - bandiere piazzate)
function updateMineCounter() {
    const flagCount = squares.filter(sq => sq.classList.contains('flag')).length;
    const remaining = totalMines - flagCount;
    document.getElementById('mine-counter').textContent = `💣 ${remaining}`;
}

function addFlag(square) {
    if (isGameOver || square.classList.contains('revealed')) return;

    if (!square.classList.contains('flag')) {
        square.classList.add('flag');
    } else {
        square.classList.remove('flag');
    }

    updateMineCounter(); // FIX #4: aggiorna il contatore
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
        checkWin(); // FIX #1: controlla vittoria dopo ogni rivelazione
        return;
    }

    // RICORSIONE: se la cella è vuota, controlla i vicini
    const neighbors = getNeighbors(parseInt(square.id), rows, cols);
    neighbors.forEach(neighborId => {
        revealSquare(squares[neighborId], rows, cols);
    });

    checkWin(); // FIX #1: controlla vittoria
}

// FIX #1: Verifica vittoria — tutte le celle non-mina devono essere rivelate
function checkWin() {
    const allSafeRevealed = squares.every(sq =>
        sq.dataset.type === 'mine' || sq.classList.contains('revealed')
    );

    if (allSafeRevealed) {
        isGameOver = true;
        document.getElementById('status').innerHTML = '🎉 Hai vinto!';

        // Metti bandierine automaticamente su tutte le mine rimaste
        squares.forEach(sq => {
            if (sq.dataset.type === 'mine' && !sq.classList.contains('flag')) {
                sq.classList.add('flag');
            }
        });
        updateMineCounter();
    }
}

function gameOver() {
    isGameOver = true;
    document.getElementById('status').innerHTML = '💥 BOOM! Hai perso!';
    squares.forEach(square => {
        if (square.dataset.type === 'mine') {
            square.classList.remove('flag');
            square.classList.add('mine');
            square.innerHTML = '💣';
        }
    });
}

// FIX #3: Modalità Notte/Giorno
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    const isDark = body.classList.toggle('dark');
    btn.textContent = isDark ? '☀️ Giorno' : '🌙 Notte';
}

// Avvia una partita di default
startGame(9, 9, 10);