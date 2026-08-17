from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

PLAYER = "O"
COMPUTER = "X"

WINNING_COMBINATIONS = [
    (0, 1, 2),
    (3, 4, 5),
    (6, 7, 8),
    (0, 3, 6),
    (1, 4, 7),
    (2, 5, 8),
    (0, 4, 8),
    (2, 4, 6)
]


# ==========================================
# HOME PAGE
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================
# CHECK WINNER
# ==========================================

def check_winner(board):

    for a, b, c in WINNING_COMBINATIONS:

        if (
            board[a] != ""
            and board[a] == board[b]
            and board[b] == board[c]
        ):
            return board[a], [a, b, c]

    # Check draw
    if "" not in board:
        return "DRAW", []

    return None, []


# ==========================================
# FIND WINNING MOVE
# ==========================================

def find_winning_move(board, symbol):

    for a, b, c in WINNING_COMBINATIONS:

        # XX_
        if (
            board[a] == symbol
            and board[b] == symbol
            and board[c] == ""
        ):
            return c

        # X_X
        if (
            board[a] == symbol
            and board[c] == symbol
            and board[b] == ""
        ):
            return b

        # _XX
        if (
            board[b] == symbol
            and board[c] == symbol
            and board[a] == ""
        ):
            return a

    return None


# ==========================================
# SMART COMPUTER MOVE
# ==========================================

def get_computer_move(board):

    # --------------------------------------
    # 1. Computer tries to WIN
    # --------------------------------------

    move = find_winning_move(board, COMPUTER)

    if move is not None:
        return move


    # --------------------------------------
    # 2. Computer tries to BLOCK player
    # --------------------------------------

    move = find_winning_move(board, PLAYER)

    if move is not None:
        return move


    # --------------------------------------
    # 3. Take CENTER
    # --------------------------------------

    if board[4] == "":
        return 4


    # --------------------------------------
    # 4. Take CORNER
    # --------------------------------------

    corners = [0, 2, 6, 8]

    free_corners = [
        position
        for position in corners
        if board[position] == ""
    ]

    if free_corners:
        return random.choice(free_corners)


    # --------------------------------------
    # 5. Take ANY EMPTY POSITION
    # --------------------------------------

    free_positions = [
        position
        for position in range(9)
        if board[position] == ""
    ]

    if free_positions:
        return random.choice(free_positions)


    return None


# ==========================================
# MAKE PLAYER MOVE
# ==========================================

@app.route("/move", methods=["POST"])
def make_move():

    data = request.get_json()

    if not data or "board" not in data:
        return jsonify({
            "error": "Board data is missing."
        }), 400


    board = data["board"]


    # --------------------------------------
    # Validate board
    # --------------------------------------

    if not isinstance(board, list) or len(board) != 9:
        return jsonify({
            "error": "Invalid board."
        }), 400


    # Make sure values are valid
    allowed_values = ["", "O", "X"]

    if any(value not in allowed_values for value in board):
        return jsonify({
            "error": "Invalid board values."
        }), 400


    # --------------------------------------
    # Check current game state
    # --------------------------------------

    winner, winning_positions = check_winner(board)

    if winner is not None:

        return jsonify({
            "board": board,
            "winner": winner,
            "winning_positions": winning_positions,
            "computer_move": None
        })


    # --------------------------------------
    # Make computer move
    # --------------------------------------

    computer_position = get_computer_move(board)


    if computer_position is not None:

        board[computer_position] = COMPUTER


    # --------------------------------------
    # Check result after computer move
    # --------------------------------------

    winner, winning_positions = check_winner(board)


    return jsonify({
        "board": board,
        "winner": winner,
        "winning_positions": winning_positions,
        "computer_move": computer_position
    })


# ==========================================
# RESET GAME
# ==========================================

@app.route("/reset", methods=["POST"])
def reset_game():

    return jsonify({
        "board": ["", "", "", "", "", "", "", ""],
        "winner": None,
        "winning_positions": []
    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)