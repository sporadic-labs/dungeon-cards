import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";

export default class DrawCardAction extends Action {
  /** @param {Phaser.Scene} scene */
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.card = card;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.scroll = playerManager.scroll;

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onDragEnd, this);
  }

  onDragEnd(pointer) {
    this.playerManager.drawCard();
    this.playerManager.drawCard();
    this.playerManager.drawCard();
    emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
  }

  destroy() {
    this.proxy.removeAll();
  }
}
