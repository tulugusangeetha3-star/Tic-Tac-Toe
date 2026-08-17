let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');

function makeMove(index) {
    if (!isGameActive || board[index] !== "") return;

    board[index] = "O";
    updateBoardUI();

    isGameActive = false;
    statusDisplay.innerText = "Computer's turn...";

    fetch('/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            isGameActive = true;
            return;
        }

        board = data.board;
        updateBoardUI();

        if (data.winner) {
            handleGameOver(data.winner, data.winning_positions);
        } else {
            isGameActive = true;
            statusDisplay.innerText = "Your turn!";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        isGameActive = true;
        statusDisplay.innerText = "Error communicating with server.";
    });
}

function updateBoardUI() {
    cells.forEach((cell, index) => {
        cell.innerText = board[index];
        cell.classList.remove('player', 'computer', 'winner');
        if (board[index] === 'O') {
            cell.classList.add('player');
        } else if (board[index] === 'X') {
            cell.classList.add('computer');
        }
    });
}

function handleGameOver(winner, winningPositions) {
    isGameActive = false;
    if (winner === "DRAW") {
        statusDisplay.innerText = "It's a draw!";
    } else if (winner === "O") {
        statusDisplay.innerText = "You win!";
        highlightWinners(winningPositions);
    } else if (winner === "X") {
        statusDisplay.innerText = "Computer wins!";
        highlightWinners(winningPositions);
    }
}

function highlightWinners(positions) {
    if (positions && positions.length > 0) {
        positions.forEach(index => {
            cells[index].classList.add('winner');
        });
    }
}

function playAgain() {
    fetch('/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(() => {
        board = ["", "", "", "", "", "", "", "", ""];
        isGameActive = true;
        statusDisplay.innerText = "Your turn!";
        cells.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove('player', 'computer', 'winner');
        });
    })
    .catch(error => console.error('Error:', error));
}

function exitGame() {
    window.location.href = "about:blank";
}