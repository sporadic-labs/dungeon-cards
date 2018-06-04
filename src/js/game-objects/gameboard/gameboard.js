import { GameBoardCell } from "./gameboard-cell";

export class GameBoard {
  constructor(scene, rows, columns) {
    // Look up cell size from a card in the atlas
    const assetsJson = scene.cache.json.get("assets");
    const { w, h } = assetsJson.frames["cards/back"].sourceSize;
    this.cellWidth = w;
    this.cellHeight = h;
    this.cellPadding = 5;

    this.boardRows = rows;
    this.boardColumns = columns;

    this.board = [];
    for (let boardY = 0; boardY < rows; boardY++) {
      this.board[boardY] = [];
      for (let boardX = 0; boardX < columns; boardX++) {
        const { x, y } = this.getWorldPosition(boardX, boardY);
        this.board[boardY][boardX] = new GameBoardCell(scene, x, y);
      }
    }
  }

  getAt(x, y) {
    return this.isInBounds(x, y) ? this.board[y][x].getCard() : null;
  }

  putAt(x, y, card) {
    if (this.isInBounds(x, y) && this.board[y][x].isEmpty()) {
      this.board[y][x].setCard(card);
    }
  }

  removeAt(x, y) {
    if (this.isInBounds(x, y)) this.board[y][x].clearCard();
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.boardColumns && y >= 0 && y < this.boardRows;
  }

  isEmpty(x, y) {
    return this.isInBounds(x, y) && this.board[y][x].isEmpty();
  }

  /**
   * Convert from boardX (column) and boardY (row) positions to world position in game.
   *
   * @param {number} boardX
   * @param {number} boardY
   * @returns {object} Location in the form {x, y}
   * @memberof GameBoard
   */
  getWorldPosition(boardX, boardY) {
    const x = boardX * (this.cellWidth + this.cellPadding);
    const y = boardY * (this.cellHeight + this.cellPadding);
    return { x, y };
  }

  findPositionOf(card) {
    for (let x = 0; x < this.boardColumns; x++) {
      for (let y = 0; y < this.boardRows; y++) {
        if (this.board[y][x].getCard() === card) return { x, y };
      }
    }
    return null;
  }

  canAttack(enemy) {}

  /**
   * Get an array of game board locations where enemies can spawn.
   *
   * @returns {Object[]} An array of objects in the form { x, y }
   * @memberof GameBoard
   */
  getOpenSpawnLocations() {
    const locations = [];
    this.board[0].forEach((cell, x) => {
      if (!cell.getCard()) locations.push({ x, y: 0 });
    });
    return locations;
  }
}
