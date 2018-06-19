import { GameBoardCell } from "./gameboard-cell";
import { emitter, EVENT_NAMES } from "../events";
import { PLAYER_CARD_INFO } from "../player-manager/player-card";

export class GameBoard {
  constructor(scene, rows, columns) {
    // Look up cell size from a card in the atlas
    const assetsJson = scene.cache.json.get("assets");
    const { w, h } = assetsJson.frames["cards/empty"].sourceSize;
    this.cellWidth = w;
    this.cellHeight = h;
    this.cellPadding = 8;
    this.boardRows = rows;
    this.boardColumns = columns;
    this.boardWidth = columns * this.cellWidth + (columns - 1) * this.cellPadding;
    this.boardHeight = rows * this.cellHeight + (rows - 1) * this.cellPadding;

    const width = scene.sys.game.config.width;
    this.worldX = width / 2 - this.boardWidth / 2;
    this.worldY = 116;

    this.board = [];
    for (let boardY = 0; boardY < rows; boardY++) {
      this.board[boardY] = [];
      for (let boardX = 0; boardX < columns; boardX++) {
        const { x, y } = this.getWorldPosition(boardX, boardY);
        this.board[boardY][boardX] = new GameBoardCell(scene, x, y);
      }
    }

    emitter.on(EVENT_NAMES.ACTION_START, this.enableFocusing, this);
    emitter.on(EVENT_NAMES.ACTION_COMPLETE, this.disableFocusing, this);
    emitter.on(EVENT_NAMES.PLAYER_CARD_DESELECT, this.disableFocusing, this);
  }

  enableFocusing() {
    emitter.on(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, this.focusPositions, this);
  }

  disableFocusing() {
    this.defocusBoard();
    emitter.off(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, this.focusPositions, this);
  }

  focusPositions(positions) {
    this.defocusBoard();
    if (!Array.isArray(positions)) positions = [positions];
    positions.map(({ x, y }) => this.board[y][x].focus());
  }

  defocusBoard() {
    this.forEachCell(cell => cell.defocus());
  }

  /**
   * Runs the given callback for each cell in the board. If the callback returns false, then the
   * loop will stop.
   *
   * @param {function} fn
   * @memberof GameBoard
   */
  forEachCell(fn) {
    for (let y = 0; y < this.boardRows; y++) {
      for (let x = 0; x < this.boardColumns; x++) {
        const response = fn(this.board[y][x], x, y);
        if (response === false) return;
      }
    }
  }

  getAt(x, y) {
    return this.isInBounds(x, y) ? this.board[y][x].getCard() : null;
  }

  /**
   * Get any enemy cards that are within the locations specified. If none are found, an empty array
   * is returned.
   *
   * @param {object[]} positions Array of positions ({x, y}) in game board coordinates.
   * @returns {object[]} Array of enemy cards
   * @memberof GameBoard
   */
  getAtMultiple(positions) {
    const cards = [];
    positions.forEach(({ x, y }) => {
      const result = this.getAt(x, y);
      if (result) cards.push(result);
    });
    return cards;
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
   * @param {boolean} checkBounds If true, only XY locations that are within the bounds of the board
   * will be returned. Locations outside of the board will return null.
   * @returns {Object|null} A point in the form {x, y}, or null
   * @memberof GameBoard
   */
  getBoardPosition(worldX, worldY, checkBounds = true) {
    if (
      checkBounds &&
      (worldX < this.worldX ||
        worldX > this.worldX + this.boardWidth ||
        worldY < this.worldY ||
        worldY > this.worldY + this.boardHeight)
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
    let position = null;
    this.forEachCell((cell, x, y) => {
      if (cell.getCard() === card) {
        position = { x, y };
        return false;
      }
    });
    return position;
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
