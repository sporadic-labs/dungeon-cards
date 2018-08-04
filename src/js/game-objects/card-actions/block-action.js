import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";

export default class BlockAction extends Action {
  constructor(scene, card, gameManager, gameBoard, enemyManager) {
    super();

    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.enemyManager = enemyManager;

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerdown", this.onPointerDown, this);
  }

  onPointerMove(pointer) {
    const positions = this.getBoardPositionsWithinRange(this.board, pointer, this.attackPattern);
    emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, positions);
    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    this.enemyManager.focusEnemies(enemies);
  }

  onPointerDown(pointer) {
    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);

    if (enemies.length) {
      enemies.forEach(enemy => enemy.setBlocked());
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    }
  }

  destroy() {
    this.proxy.removeAll();
  }
}
