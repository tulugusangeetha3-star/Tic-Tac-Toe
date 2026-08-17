from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

PLAYER = "O"
COMPUTER = "X"

WINNING_COMBINATIONS = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),  # Rows
    (0, 3, 6), (1, 4, 7), (2, 5, 8),  # Columns
    (0, 4, 8), (2, 4, 6)            # Diagonals
]

@app.route("/")
def home():
    return render_template("index.html")

def check_winner(board):
    for a, b, c in WINNING_COMBINATIONS:
        if board[a] != "" and board[a] == board[b] == board[c]:
            return board[a], [a, b, c]
    if "" not in board:
        return "DRAW", []
    return None, []

def find_winning_move(board, symbol):
    for a, b, c in WINNING_COMBINATIONS:
        if board[a] == symbol and board[b] == symbol and board[c] == "": return c
        if board[a] == symbol and board[c] == symbol and board[b] == "": return b
        if board[b] == symbol and board[c] == symbol and board[a] == "": return a
    return None

def get_computer_move(board):
    move = find_winning_move(board, COMPUTER)
    if move is not None: return move
    move = find_winning_move(board, PLAYER)
    if move is not None: return move
    if board[4] == "": return 4
    corners = [0, 2, 6, 8]
    free_corners = [p for p in corners if board[p] == ""]
    if free_corners: return random.choice(free_corners)
    free_positions = [p for p in range(9) if board[p] == ""]
    if free_positions: return random.choice(free_positions)
    return None

@app.route("/move", methods=["POST"])
def make_move():
    data = request.get_json()
    if not data or "board" not in data:
        return jsonify({"error": "Board data is missing."}), 400

    board = data["board"]
    winner, winning_positions = check_winner(board)
    if winner is not None:
        return jsonify({"board": board, "winner": winner, "winning_positions": winning_positions, "computer_move": None})

    computer_position = get_computer_move(board)
    if computer_position is not None:
        board[computer_position] = COMPUTER

    winner, winning_positions = check_winner(board)
    return jsonify({
        "board": board,
        "winner": winner,
        "winning_positions": winning_positions,
        "computer_move": computer_position
    })

@app.route("/reset", methods=["POST"])
def reset_game():
    return jsonify({"board": ["", "", "", "", "", "", "", "", ""], "winner": None, "winning_positions": []})

if __name__ == "__main__":
    app.run(debug=True)