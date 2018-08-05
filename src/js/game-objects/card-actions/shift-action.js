import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import { PopupText } from "../hud";
import { PLAYER_CARD_TYPES } from "../player-manager";

export const SHIFT_DIRECTIONS = {
  RIGHT: 1,
  LEFT: -1
};

export default class ShiftAction extends Action {
  constructor(scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.direction = this.getDirection(card);
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;

    this.showMessage = true; // Any better ideas?

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerdown", this.onPointerDown, this);

    const frame = this.direction === SHIFT_DIRECTIONS.LEFT ? "arrow-left" : "arrow-right";
    this.shiftPreviews = this.attackPattern.map(() => {
      return scene.add
        .sprite(0, 0, "assets", `attacks/${frame}`)
        .setAlpha(0.9)
        .setVisible(false);
    });
    this.xPreview = scene.add
      .sprite(0, 0, "assets", "attacks/x")
      .setAlpha(0.9)
      .setVisible(false);
  }

  onPointerMove(pointer) {
    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) return;

    this.focusWithinRange(this.board, this.enemyManager, pointer, this.attackPattern);

    // Preview attack
    const positions = this.getBoardPositionsWithinRange(this.board, pointer, this.attackPattern);
    const offsetX = (this.direction === SHIFT_DIRECTIONS.LEFT ? -0.5 : 0.5) * this.board.cellWidth;
    this.shiftPreviews.map(preview => preview.setVisible(false));
    this.xPreview.setVisible(false);
    positions.map((position, i) => {
      const enemy = this.board.getAt(position.x, position.y);
      if (enemy) {
        this.shiftPreviews[i]
          .setPosition(enemy.container.x + offsetX, enemy.container.y)
          .setVisible(true);
        if (this.direction === SHIFT_DIRECTIONS.LEFT && i === 0) {
          this.xPreview
            .setPosition(
              this.shiftPreviews[i].x - this.shiftPreviews[i].width,
              this.shiftPreviews[i].y
            )
            .setVisible(true);
        } else if (this.direction === SHIFT_DIRECTIONS.RIGHT && i === positions.length - 1) {
          this.xPreview
            .setPosition(
              this.shiftPreviews[i].x + this.shiftPreviews[i].width,
              this.shiftPreviews[i].y
            )
            .setVisible(true);
        }
      } else {
        const worldPos = this.board.getWorldPosition(position.x, position.y);
        this.shiftPreviews[i]
          .setPosition(
            worldPos.x + this.board.cellWidth / 2 + offsetX,
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
      const enoughEnergyForAttack = this.playerManager.canUseCard(this.card);
      if (enoughEnergyForAttack) {
        this.enemyManager.shiftEnemies(enemies, this.direction);
        this.playerManager.useEnergy(this.card.getEnergy());
        emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
      } else {
        if (this.showMessage) {
          this.showMessage = false;
          // Some UI to indicate player can't play this card.
          const { width, _ } = this.scene.sys.game.config;
          new PopupText(this.scene, "You don't have enough energy!", width / 4, 20, null, () => {
            this.showMessage = true;
          });
        }
      }
    }
  }

  getDirection(card) {
    if (card.type === PLAYER_CARD_TYPES.SHIFT_LEFT) {
      return SHIFT_DIRECTIONS.LEFT;
    } else if (card.type === PLAYER_CARD_TYPES.SHIFT_RIGHT) {
      return SHIFT_DIRECTIONS.RIGHT;
    } else {
      return null;
    }
  }

  destroy() {
    this.shiftPreviews.map(sprite => sprite.destroy());
    this.xPreview.destroy();
    this.proxy.removeAll();
  }
}
