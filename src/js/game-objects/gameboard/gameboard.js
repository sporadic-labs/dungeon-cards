import { GameBoardCell } from "./gameboard-cell";

export class GameBoard {
  constructor(scene, width, height) {
    // Look up cell size from a card in the atlas
    const assetsJson = scene.cache.json.get("assets");
    const { w, h } = assetsJson.frames["cards/back"].sourceSize;
    this.cellWidth = w;
    this.cellHeight = h;

    this.cellPadding = 5;
    this.boardWidth = width;
    this.boardHeight = height;

    this.board = [];
    for (let boardY = 0; boardY < height; boardY++) {
      this.board[boardY] = [];
      for (let boardX = 0; boardX < width; boardX++) {
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

  isInBounds(x, y) {
    return x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight;
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
