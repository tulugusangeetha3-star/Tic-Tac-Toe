let gameMode = 'robot'; // 'robot' or 'friend'
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let currentPlayer = 'O'; // 'O' starts first

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');

function setGameMode(mode) {
    gameMode = mode;
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    restartGame();
}

function goHome() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('win-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('active');
}

function cellClicked(index) {
    if (!isGameActive || board[index] !== "") return;

    if (gameMode === 'robot') {
        // Player (O) turn against Robot
        board[index] = "O";
        updateBoardUI();
        
        if (checkClientWinner()) return;

        isGameActive = false;
        statusDisplay.innerText = "Robot's turn...";

        fetch('/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board: board })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                isGameActive = true;
                return;
            }
            board = data.board;
            updateBoardUI();

            if (data.winner) {
                handleGameOver(data.winner);
            } else {
                isGameActive = true;
                statusDisplay.innerText = "Your turn!";
            }
        })
        .catch(err => {
            console.error(err);
            isGameActive = true;
            statusDisplay.innerText = "Server error!";
        });

    } else {
        // Friend Mode (Local 2-player)
        board[index] = currentPlayer;
        updateBoardUI();

        if (checkClientWinner()) return;

        currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
        statusDisplay.innerText = `Player ${currentPlayer}'s turn (${currentPlayer === 'O' ? 'Green' : 'Red'})`;
    }
}

function checkClientWinner() {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (let combo of wins) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            handleGameOver(board[a]);
            return true;
        }
    }

    if (!board.includes("")) {
        handleGameOver("DRAW");
        return true;
    }
    return false;
}

function updateBoardUI() {
    cells.forEach((cell, index) => {
        cell.innerText = board[index];
        cell.classList.remove('player-o', 'player-x');
        if (board[index] === 'O') {
            cell.classList.add('player-o');
        } else if (board[index] === 'X') {
            cell.classList.add('player-x');
        }
    });
}

function handleGameOver(winner) {
    isGameActive = false;
    setTimeout(() => {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('win-screen').classList.add('active');

        const nameDisplay = document.getElementById('winner-name-display');
        if (winner === "DRAW") {
            nameDisplay.innerText = "It's a Draw!";
        } else if (gameMode === 'robot') {
            nameDisplay.innerText = winner === "O" ? "Winner: You (O)" : "Winner: Computer (X)";
        } else {
            nameDisplay.innerText = `Winner: Player ${winner} (${winner === 'O' ? 'Green' : 'Red'})`;
        }

        startConfetti();
    }, 400);
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    currentPlayer = 'O';
    statusDisplay.innerText = gameMode === 'robot' ? "Your turn!" : "Player O's turn (Green)";
    updateBoardUI();
    document.getElementById('win-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

// Ribbon / Confetti effect animation
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    let particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 50 + 10,
            color: ['#ff1744', '#00c853', '#ffd700', '#00b4d8', '#ff00ff'][Math.floor(Math.random() * 5)],
            tilt: Math.random() * 10 - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        particles.forEach((p) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.d);
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
    }

    let interval = setInterval(draw, 20);
    setTimeout(() => clearInterval(interval), 5000); // Stop after 5 seconds
}