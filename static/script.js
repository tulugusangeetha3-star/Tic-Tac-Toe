// ==========================================
// GAME VARIABLES
// ==========================================

let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];

let gameOver = false;
let computerThinking = false;


// ==========================================
// HTML ELEMENTS
// ==========================================

const cells = document.querySelectorAll(".cell");

const statusText =
    document.getElementById("status");

const playAgainButton =
    document.getElementById("playAgain");

const exitButton =
    document.getElementById("exitButton");


// ==========================================
// PLAYER MOVE
// ==========================================

async function playerMove(index) {

    // Game already finished
    if (gameOver) {
        return;
    }


    // Computer is thinking
    if (computerThinking) {
        return;
    }


    // Cell already occupied
    if (board[index] !== "") {
        return;
    }


    // --------------------------------------
    // PUT O
    // --------------------------------------

    board[index] = "O";

    cells[index].textContent = "O";

    cells[index].classList.add("player");

    cells[index].disabled = true;


    // --------------------------------------
    // CHECK IF PLAYER WON
    // --------------------------------------

    const playerResult =
        checkLocalWinner();

    if (playerResult.winner === "O") {

        finishGame(playerResult);

        return;
    }


    // --------------------------------------
    // CHECK DRAW
    // --------------------------------------

    if (playerResult.winner === "DRAW") {

        finishGame(playerResult);

        return;
    }


    // --------------------------------------
    // COMPUTER TURN
    // --------------------------------------

    computerThinking = true;

    statusText.textContent =
        "Computer's turn...";

    statusText.style.color =
        "#f1c40f";


    // Disable remaining cells
    cells.forEach(function(cell) {

        if (cell.textContent === "") {
            cell.disabled = true;
        }

    });


    try {

        // ----------------------------------
        // SEND BOARD TO PYTHON
        // ----------------------------------

        const response = await fetch("/move", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                board: board
            })

        });


        if (!response.ok) {

            throw new Error(
                "Server error"
            );

        }


        const data =
            await response.json();


        // ----------------------------------
        // UPDATE BOARD FROM PYTHON
        // ----------------------------------

        board = data.board;


        // Find computer move
        if (data.computer_move !== null) {

            const computerIndex =
                data.computer_move;

            cells[computerIndex].textContent =
                "X";

            cells[computerIndex]
                .classList.add("computer");

            cells[computerIndex].disabled =
                true;
        }


        // ----------------------------------
        // CHECK RESULT
        // ----------------------------------

        if (data.winner !== null) {

            finishGame({

                winner: data.winner,

                combination:
                    data.winning_positions

            });

            return;
        }


        // ----------------------------------
        // PLAYER TURN
        // ----------------------------------

        computerThinking = false;

        statusText.textContent =
            "Your turn!";

        statusText.style.color =
            "#61dafb";


        // Enable empty cells
        cells.forEach(function(cell, index) {

            if (board[index] === "") {

                cell.disabled = false;

            }

        });

    }

    catch (error) {

        console.error(error);

        computerThinking = false;

        statusText.textContent =
            "Server error. Please try again.";

        statusText.style.color =
            "#e74c3c";

    }
}


// ==========================================
// LOCAL WINNER CHECK
// ==========================================

function checkLocalWinner() {

    const combinations = [

        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6]

    ];


    for (const combination of combinations) {

        const a = combination[0];

        const b = combination[1];

        const c = combination[2];


        if (

            board[a] !== "" &&

            board[a] === board[b] &&

            board[b] === board[c]

        ) {

            return {

                winner: board[a],

                combination: combination

            };

        }

    }


    if (!board.includes("")) {

        return {

            winner: "DRAW",

            combination: []

        };

    }


    return {

        winner: null,

        combination: []

    };

}


// ==========================================
// FINISH GAME
// ==========================================

function finishGame(result) {

    gameOver = true;

    computerThinking = false;


    // Disable all cells
    cells.forEach(function(cell) {

        cell.disabled = true;

    });


    // --------------------------------------
    // PLAYER WON
    // --------------------------------------

    if (result.winner === "O") {

        statusText.textContent =
            "🎉 YOU WON!";

        statusText.style.color =
            "#2ecc71";

        highlightWinner(
            result.combination
        );

        setTimeout(function() {

            alert(
                "🎉 Congratulations! You won!"
            );

        }, 100);

    }


    // --------------------------------------
    // COMPUTER WON
    // --------------------------------------

    else if (result.winner === "X") {

        statusText.textContent =
            "🤖 COMPUTER WON!";

        statusText.style.color =
            "#e74c3c";

        highlightWinner(
            result.combination
        );

        setTimeout(function() {

            alert(
                "🤖 Computer won!"
            );

        }, 100);

    }


    // --------------------------------------
    // DRAW
    // --------------------------------------

    else if (result.winner === "DRAW") {

        statusText.textContent =
            "🤝 DRAW!";

        statusText.style.color =
            "#f1c40f";

        setTimeout(function() {

            alert(
                "🤝 It's a draw!"
            );

        }, 100);

    }

}


// ==========================================
// HIGHLIGHT WINNER
// ==========================================

function highlightWinner(combination) {

    combination.forEach(function(index) {

        cells[index]
            .classList.add("winner");

    });

}


// ==========================================
// RESET GAME
// ==========================================

async function resetGame() {

    try {

        const response =
            await fetch("/reset", {

                method: "POST"

            });


        if (!response.ok) {

            throw new Error(
                "Reset failed"
            );

        }


        const data =
            await response.json();


        board = data.board;

        gameOver = false;

        computerThinking = false;


        // Clear cells
        cells.forEach(function(cell) {

            cell.textContent = "";

            cell.disabled = false;

            cell.classList.remove(
                "player",
                "computer",
                "winner"
            );

        });


        // Reset status
        statusText.textContent =
            "Your turn!";

        statusText.style.color =
            "#61dafb";

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not reset the game."
        );

    }

}


// ==========================================
// CELL EVENTS
// ==========================================

cells.forEach(function(cell) {

    cell.addEventListener(
        "click",
        function() {

            const index =
                Number(
                    cell.dataset.index
                );

            playerMove(index);

        }
    );

});


// ==========================================
// PLAY AGAIN
// ==========================================

playAgainButton.addEventListener(
    "click",
    resetGame
);


// ==========================================
// EXIT
// ==========================================

exitButton.addEventListener(
    "click",
    function() {

        alert(
            "Thanks for playing! You can close this browser tab."
        );

    }
);