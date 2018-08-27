import { EventProxy, emitter, EVENT_NAMES } from "../events";
import store from "../../store";
import Action from "./action";

export default class BlockAction extends Action {
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.enemyManager = enemyManager;
    this.discardPile = playerManager.discardPile;

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerup", this.onPointerUp, this);

    this.previews = this.attackPattern.map(() => {
      return scene.add
        .sprite(0, 0, "assets", "attacks/block")
        .setAlpha(0.9)
        .setVisible(false);
    });

    const p = card.getPosition(0.5, 0.1);
    this.arrow = actionRunner.arrow
      .setStartPoint(p)
      .setEndPoint(p)
      .setColor(0xef8843, 0xcf773c)
      .setVisible(true);
  }

  onPointerMove(pointer) {
    this.previews.map(preview => preview.setVisible(false));

    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    const isOverBoard = this.board.isWorldPointInBoard(pointer.x, pointer.y);
    const isOverValidTarget = enemies.length > 0 || store.isReclaimActive;

    if (!isOverBoard) {
      this.enemyManager.defocusAllEnemies();
      this.board.defocusBoard();
    } else {
      this.focusWithinRange(this.board, this.enemyManager, pointer, this.attackPattern);

      // Preview attack
      const positions = this.getBoardPositionsWithinRange(this.board, pointer, this.attackPattern);
      positions.map((position, i) => {
        const enemy = this.board.getAt(position.x, position.y);
        if (enemy) {
          this.previews[i].setPosition(enemy.container.x, enemy.container.y).setVisible(true);
        } else {
          const worldPos = this.board.getWorldPosition(position.x, position.y);
          this.previews[i]
            .setPosition(
              worldPos.x + this.board.cellWidth / 2,
              worldPos.y + this.board.cellHeight / 2
            )
            .setVisible(true);
        }
      });
    }

    this.arrow.setEndPoint(pointer);
    this.arrow.setHighlighted(isOverValidTarget);
  }

  onPointerUp(pointer) {
    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) {
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);

    if (enemies.length) {
      enemies.forEach(enemy => enemy.setBlocked());
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    } else {
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
    }
  }

  destroy() {
    this.arrow.setVisible(false);
    this.previews.map(sprite => sprite.destroy());
    this.proxy.removeAll();
  }
}
