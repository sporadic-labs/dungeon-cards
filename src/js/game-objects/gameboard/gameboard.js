import { GameBoardCell } from "./gameboard-cell";

export class GameBoard {
  constructor(scene, rows, columns) {
    // Look up cell size from a card in the atlas
    const assetsJson = scene.cache.json.get("assets");
    const { w, h } = assetsJson.frames["cards/back"].sourceSize;
    this.cellWidth = w;
    this.cellHeight = h;
    this.cellPadding = 4;
    this.boardRows = rows;
    this.boardColumns = columns;
    this.boardWidth = columns * this.cellWidth + (columns - 1) * this.cellPadding;
    this.boardHeight = rows * this.cellHeight + (rows - 1) * this.cellPadding;

    const width = scene.sys.game.config.width;
    this.worldX = width / 2 - this.boardWidth / 2;
    this.worldY = 50;

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
    const x = this.worldX + boardX * (this.cellWidth + this.cellPadding);
    const y = this.worldY + boardY * (this.cellHeight + this.cellPadding);
    return { x, y };
  }

  /**
   * Get the board coordinates of the given world (pixel) coordinates. This calculation includes
   * cell padding as part of the board, so if you click on the space between two cells in the board,
   * it will return a valid board location.
   *
   * @param {number} worldX
   * @param {number} worldY
   * @returns {Object|null} A point in the form {x, y}, or null
   * @memberof GameBoard
   */
  getBoardPosition(worldX, worldY) {
    if (
      worldX < this.worldX &&
      worldX > this.worldX + this.boardWidth &&
      worldY < this.worldY &&
      worldY > this.worldY + this.boardHeight
    ) {
      return null;
    }

    let relativeX = worldX - this.worldX;
    let relativeY = worldY - this.worldY;

    // There's no padding on the outside of the cards at the edges of the board:
    //  | [ CARD ]     [ CARD ]     [ CARD ] |
    // So there are uneven hitboxes. The first in the row above is (card width + padding / 2)
    // wide, but the second is (padding / 2 + card width + padding / 2). We get around this by
    // shifting the input worldX and worldY by (padding / 2), so that it's as if there weren't
    // uneven hitboxes.
    relativeX += this.cellPadding / 2;
    relativeY += this.cellPadding / 2;

    // Find the x, y (assuming each card has the same size hitbox)
    const x = Math.floor(relativeX / (this.cellWidth + this.cellPadding));
    const y = Math.floor(relativeY / (this.cellHeight + this.cellPadding));

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

  /**
   * Returns true if the given location is a spot from which the player can be attacked.
   *
   * @param {number} x Column
   * @param {number} y Row
   * @returns {Boolean}
   * @memberof GameBoard
   */
  canAttackPlayerFrom(x, y) {
    return y === this.boardColumns - 1;
  }

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
