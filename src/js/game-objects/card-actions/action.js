const zeroPoint = { x: 0, y: 0 };

/**
 * Interface for defining the structure of an action. Basically a way to enforce that all actions
 * can be cleaned up via Action#destroy.
 *
 * @export
 * @class Action
 */
export default class Action {
  /**
   * Get the enemies that are within the area of effect of the action, as defined by a center point
   * (targetCenter) and an array of offsets (relativePositions).
   *
   * @param {GameBoard} gameBoard
   * @param {object} targetCenter {x, y} object that indicates where to target on the board
   * @param {object[]} [relativePositions={x: 0, y: 0}] Array of {x, y} objects that defines the
   * area of effect of the action relative to the targetCenter
   * @returns {object[]} An array of enemies, or an empty array
   * @memberof Action
   */
  getEnemiesWithinRange(gameBoard, targetCenter, relativePositions = zeroPoint) {
    const positions = this.getBoardPositionsWithinRange(gameBoard, targetCenter, relativePositions);
    const enemies = gameBoard.getAtMultiple(positions);
    return enemies;
  }

  /**
   * Get the board positions that are within the area of effect of the action, as defined by a
   * center point (targetCenter) and an array of offsets (relativePositions). This only returns
   * valid board positions that are within the bounds of the board.
   *
   * @param {GameBoard} gameBoard
   * @param {object} targetCenter {x, y} object that indicates where to target on the board
   * @param {object[]} [relativePositions={x: 0, y: 0}] Array of {x, y} objects that defines the
   * area of effect of the action relative to the targetCenter
   * @returns {object[]} An array of board positions, or an empty array
   * @memberof Action
   */
  getBoardPositionsWithinRange(gameBoard, targetCenter, relativePositions = zeroPoint) {
    const positions = [];
    const boardPosition = gameBoard.getBoardPosition(targetCenter.x, targetCenter.y, false);

    relativePositions.forEach(({ x: dx, y: dy }) => {
      const x = boardPosition.x + dx;
      const y = boardPosition.y + dy;
      if (gameBoard.isInBounds(x, y)) positions.push({ x, y });
    });

    return positions;
  }

  focusWithinRange(gameBoard, enemyManager, targetCenter, relativePositions = zeroPoint) {
    const positions = this.getBoardPositionsWithinRange(gameBoard, targetCenter, relativePositions);
    const enemies = gameBoard.getAtMultiple(positions);
    enemyManager.focusEnemies(enemies);
    gameBoard.focusPositions(positions);
  }

  /**
   * Noop - child classes should implement their own logic
   *
   * @memberof Action
   */
  destroy() {}
}
