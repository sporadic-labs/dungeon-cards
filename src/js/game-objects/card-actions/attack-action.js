import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import logger from "../../helpers/logger";
import { PopupText } from "../hud";
import store from "../../store";

export default class AttackAction extends Action {
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.damage = 1;
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.discardPile = playerManager.discardPile;

    this.showMessage = true; // Any better ideas?

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerup", this.onPointerUp, this);

    this.previews = this.attackPattern.map(() => {
      return scene.add
        .sprite(0, 0, "assets", "attacks/player-attack")
        .setAlpha(0.9)
        .setVisible(false);
    });
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
  }

  onPointerUp(pointer) {
    if (!this.board.isWorldPointInBoard(pointer.x, pointer.y)) {
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      return;
    }

    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    if (enemies.length) {
      const enoughEnergyForAttack = this.playerManager.canUseCard(this.card);
      if (enoughEnergyForAttack) {
        this.enemyManager.damageEnemies(enemies, this.damage);
        this.playerManager.useEnergy(this.card.getEnergy());
        emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
      } else {
        if (this.showMessage) {
          this.showMessage = false;
          // Some UI to indicate player can't play this card.
          const { width } = this.scene.sys.game.config;
          new PopupText(this.scene, "You don't have enough energy!", width / 4, 20, null, () => {
            this.showMessage = true;
          });
        }
        emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      }
    } else {
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
    }
  }

  destroy() {
    this.previews.map(sprite => sprite.destroy());
    this.proxy.removeAll();
  }
}
