import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";

export default class GetEnergyAction extends Action {
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.card = card;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.scroll = playerManager.scroll;

    this.proxy.on(scene.input, "pointermove", this.onPointerMove, this);
    this.proxy.on(scene.input, "pointerup", this.onPointerUp, this);

    const p = card.getPosition(0.5, 0.1);
    this.arrow = actionRunner.arrow
      .setStartPoint(p)
      .setEndPoint(p)
      .setColor(0x9e2828, 0x7c2323)
      .setVisible(true);
  }

  onPointerMove(pointer) {
    const isOverValidTarget = this.scroll.isInBounds(pointer.x, pointer.y);
    this.arrow.setEndPoint(pointer);
    this.arrow.setHighlighted(isOverValidTarget);
  }

  onPointerUp(pointer) {
    if (this.card.isInBounds(pointer.x, pointer.y)) {
      this.playerManager.addEnergy(this.card.getEnergy());
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    }
  }

  destroy() {
    this.arrow.setVisible(false);
    this.proxy.removeAll();
  }
}
