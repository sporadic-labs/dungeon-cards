import { EventProxy, emitter, EVENT_NAMES } from "../events";
import logger from "../../helpers/logger";
import Action from "./action";

export default class AttackAction extends Action {
  constructor(scene, card, gameManager, gameBoard, enemyManager) {
    super();

    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.gameBoard = gameBoard;
    this.proxy = new EventProxy();

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerdown", this.onPointerDown, this);
  }

  onPointerMove(pointer) {
    const positions = this.getAttackPositions(pointer);
    emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, positions);
    const enemies = this.gameBoard.getAtMultiple(positions);
    logger.log(`You are over ${enemies.length} enemies`);
  }

  onPointerDown(pointer) {
    const positions = this.getAttackPositions(pointer);

    if (positions.length) {
      positions.forEach(({ x, y }) => {
        const enemy = this.gameBoard.getAt(x, y);
        if (enemy) {
          logger.log(`You attacked at (${x}, ${y}) on the board`);
          emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card, x, y);
        }
      });
    }
  }

  getAttackPositions(pointer) {
    const positions = [];
    const boardPosition = this.gameBoard.getBoardPosition(pointer.x, pointer.y, false);

    this.attackPattern.forEach(({ x: dx, y: dy }) => {
      const x = boardPosition.x + dx;
      const y = boardPosition.y + dy;
      if (this.gameBoard.isInBounds(x, y)) positions.push({ x, y });
    });

    return positions;
  }

  destroy() {
    this.proxy.removeAll();
  }
}
