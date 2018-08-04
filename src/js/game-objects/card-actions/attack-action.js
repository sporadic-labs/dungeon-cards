import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import logger from "../../helpers/logger";
import { PopupText } from "../hud";

export default class AttackAction extends Action {
  constructor(scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.card = card;
    this.attackPattern = card.cardInfo.cells;
    this.damage = 1;
    this.board = gameBoard;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;

    this.showMessage = true; // Any better ideas?

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerdown", this.onPointerDown, this);

    this.attackPreviews = this.attackPattern.map(() => {
      return scene.add
        .sprite(100, 100, "assets", "attacks/player-attack")
        .setAlpha(0.9)
        .setVisible(false);
    });
  }

  onPointerMove(pointer) {
    this.focusWithinRange(this.board, this.enemyManager, pointer, this.attackPattern);
    const positions = this.getBoardPositionsWithinRange(this.board, pointer, this.attackPattern);
    positions.map((position, i) => {
      const enemy = this.board.getAt(position.x, position.y);
      if (enemy) {
        this.attackPreviews[i].setPosition(enemy.container.x, enemy.container.y).setVisible(true);
      } else {
        const worldPos = this.board.getWorldPosition(position.x, position.y);
        this.attackPreviews[i]
          .setPosition(
            worldPos.x + this.board.cellWidth / 2,
            worldPos.y + this.board.cellHeight / 2
          )
          .setVisible(true);
      }
    });
  }

  onPointerDown(pointer) {
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
          const { width, height } = this.scene.sys.game.config;
          new PopupText(this.scene, "You don't have enough energy!", width / 4, 20, null, () => {
            this.showMessage = true;
          });
        }
      }
    }
  }

  destroy() {
    this.attackPreviews.map(sprite => sprite.destroy());
    this.proxy.removeAll();
  }
}
