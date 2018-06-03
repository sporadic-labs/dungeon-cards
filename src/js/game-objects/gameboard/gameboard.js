import { GameBoardCell } from "./gameboard-cell";

export class GameBoard {
  constructor(scene, columns, rows) {
    this.board = [];
    for (let i = 0; i < columns; i++) {
      this.board[i] = [];
      for (let j = 0; j < rows; j++) {
        this.board[i][j] = new GameBoardCell(scene, i, j);
      }
    }
  }

  getAt(column, row) {
    return this.board[column] && this.board[column][row] ? this.board[column][row].getCard() : null;
  }

  putAt(column, row, card) {
    if (this.board[column] && this.board[column][row] && !this.board[column][row].getCard()) {
      this.board[column][row].setCard(card);
    }
  }

  canAttack(enemy) {}

  getOpenSpawnLocations() {
    return [];
  }
}
