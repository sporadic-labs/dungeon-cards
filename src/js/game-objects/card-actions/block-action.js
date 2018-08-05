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

    this.previews = this.attackPattern.map(() => {
      return scene.add
        .sprite(0, 0, "assets", "attacks/block")
        .setAlpha(0.9)
        .setVisible(false);
    });
  }

  onPointerMove(pointer) {
    this.previews.map(preview => preview.setVisible(false));

    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) {
      this.enemyManager.defocusAllEnemies();
      this.board.defocusBoard();
      return;
    }

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

  onPointerDown(pointer) {
    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) return;

    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);

    if (enemies.length) {
      enemies.forEach(enemy => enemy.setBlocked());
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    }
  }

  destroy() {
    this.previews.map(sprite => sprite.destroy());
    this.proxy.removeAll();
  }
}
