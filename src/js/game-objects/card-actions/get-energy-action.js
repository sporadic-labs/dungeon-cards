import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";

export default class GetEnergyAction extends Action {
  /** @param {Phaser.Scene} scene */
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.card = card;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.scroll = playerManager.scroll;

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerup", this.onPointerUp, this);
  }

  onPointerMove(pointer) {
    const isOverValidTarget = this.scroll.isInBounds(pointer.x, pointer.y);
  }

  onPointerUp(pointer) {
    if (this.card.isInBounds(pointer.x, pointer.y)) {
      this.playerManager.addEnergy(this.card.getEnergy());
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    }
  }

  destroy() {
    this.proxy.removeAll();
  }
}
