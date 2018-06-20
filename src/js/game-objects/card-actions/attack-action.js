import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import logger from "../../helpers/logger";

export default class AttackAction extends Action {
  constructor(scene, card, gameManager, gameBoard, enemyManager) {
    super();

    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.damage = 1;
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.enemyManager = enemyManager;

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerdown", this.onPointerDown, this);
  }

  onPointerMove(pointer) {
    const positions = this.getBoardPositionsWithinRange(this.board, pointer, this.attackPattern);
    emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, positions);
  }

  onPointerDown(pointer) {
    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);

    if (enemies.length) {
      this.enemyManager.damageEnemies(enemies, this.damage);
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    }
  }

  destroy() {
    this.proxy.removeAll();
  }
}
