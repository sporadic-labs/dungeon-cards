import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import logger from "../../helpers/logger";
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
  }

  onPointerMove(pointer) {
    const positions = this.getBoardPositionsWithinRange(this.board, pointer, this.attackPattern);
    emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, positions);
  }

  onPointerDown(pointer) {
    const enemies = this.getEnemiesWithinRange(this.board, pointer, this.attackPattern);
    if (enemies.length) {
      console.log(enemies);
      const enoughEnergyForAttack = this.playerManager.canUseCard(this.card);
      if (enoughEnergyForAttack) {
        this.enemyManager.shiftEnemies(enemies, this.direction);
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
    this.proxy.removeAll();
  }
}
