import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import { PopupText } from "../hud";
import { PLAYER_CARD_TYPES } from "../player-manager";
import store from "../../store";

export const SHIFT_DIRECTIONS = {
  RIGHT: 1,
  LEFT: -1
};

export default class ShiftAction extends Action {
  /** @param {Phaser.Scene} scene */
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.actionRunner = actionRunner;
    this.scene = scene;
    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.direction = this.getDirection(card);
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;

    this.showMessage = true; // Any better ideas?

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG, this.onDrag, this);
    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onDragEnd, this);

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

  onDrag(card) {
    this.shiftPreviews.map(preview => preview.setVisible(false));
    this.xPreview.setVisible(false);

    const pointer = this.scene.input.activePointer;
    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    const isOverBoard = this.board.isWorldPointInBoard(pointer.x, pointer.y);
    const isOverValidTarget = enemies.length > 0 || store.isTargetingDropZone;

    // TODO: do something to the card

    if (!isOverBoard) {
      this.enemyManager.defocusAllEnemies();
      this.board.defocusBoard();
    } else {
      // Get the enemies and board positions in the current row & focus them
      const positions = [];
      const { y } = this.board.getBoardPosition(pointer.x, pointer.y);
      for (let x = 0; x < this.board.boardColumns; x++) {
        positions.push({ x, y });
      }
      const enemies = this.board.getAtMultiple(positions);
      this.enemyManager.focusEnemies(enemies);
      this.board.focusPositions(positions);

      // Preview attack
      const offsetX =
        (this.direction === SHIFT_DIRECTIONS.LEFT ? -0.5 : 0.5) * this.board.cellWidth;
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
  }

  onDragEnd(card) {
    this.board.defocusBoard();

    const pointer = this.scene.input.activePointer;
    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) {
      this.actionRunner.showToast("You can't play that card there.");
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    const enoughEnergyForAttack = this.playerManager.canUseCard(this.card);
    if (!enoughEnergyForAttack) {
      this.actionRunner.showToast("You don't have enough energy for that.");
      this.enemyManager.defocusAllEnemies();
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    this.enemyManager
      .shiftEnemies(enemies, this.direction)
      .then(() => this.enemyManager.defocusAllEnemies());
    this.playerManager.useEnergy(this.card.getEnergy());
    emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
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
