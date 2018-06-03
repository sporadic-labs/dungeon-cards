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

  getAt(x, y) {
    return this.board[y] && this.board[y][x] ? this.board[y][x].getCard() : null;
  }

  putAt(x, y, card) {
    if (this.board[y] && this.board[y][x] && !this.board[y][x].getCard()) {
      this.board[y][x].setCard(card);
    }
  }

  canAttack(enemy) {}

  getOpenSpawnLocations() {
    return [];
  }
}
