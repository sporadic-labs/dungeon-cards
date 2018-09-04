import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import logger from "../../helpers/logger";
import { PopupText } from "../hud";
import store from "../../store";

export default class AttackAction extends Action {
  /** @param {Phaser.Scene} scene */
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.actionRunner = actionRunner;
    this.scene = scene;
    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.damage = 1;
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.discardPile = playerManager.discardPile;

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG, this.onDrag, this);
    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onDragEnd, this);

    this.previews = this.attackPattern.map(() => {
      return scene.add
        .sprite(0, 0, "assets", "attacks/player-attack")
        .setAlpha(0.9)
        .setVisible(false);
    });
  }

  onDrag(card) {
    this.previews.map(preview => preview.setVisible(false));

    const pointer = this.scene.input.activePointer;
    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    const isOverBoard = this.board.isWorldPointInBoard(pointer.x, pointer.y);
    const isOverValidTarget = enemies.length > 0 || store.isTargetingReclaim;

    // TODO: do something to the card

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
  }

  onDragEnd(card) {
    if (store.isTargetingReclaim) {
      emitter.emit(EVENT_NAMES.PLAYER_CARD_DISCARD);
      return;
    }

    const pointer = this.scene.input.activePointer;
    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) {
      this.actionRunner.showToast("You can't play that card there.");
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    if (!enemies.length) {
      this.actionRunner.showToast("No enemy cards in range.");
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    const enoughEnergyForAttack = this.playerManager.canUseCard(this.card);
    if (!enoughEnergyForAttack) {
      this.actionRunner.showToast("You don't have enough energy for that.");
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    this.enemyManager.damageEnemies(enemies, this.damage);
    this.playerManager.useEnergy(this.card.getEnergy());
    emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
  }

  destroy() {
    this.previews.map(sprite => sprite.destroy());
    this.proxy.removeAll();
  }
}
