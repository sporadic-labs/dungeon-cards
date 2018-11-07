import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import { gameStore } from "../../store";

export default class GetEnergyAction extends Action {
  /** @param {Phaser.Scene} scene */
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.scene = scene;
    this.sound = this.scene.sound; // TODO: use this.scene.game.globals.sfxPlayer
    this.card = card;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.scroll = playerManager.scroll;

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onDragEnd, this);
  }

  onDragEnd(pointer) {
    if (gameStore.isTargetingDropZone) {
      this.sound.play("card-place-3");
      this.playerManager.addEnergy(this.card.getEnergy());
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
    } else {
      this.sound.play("incorrect");
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
    }
  }

  destroy() {
    this.proxy.removeAll();
  }
}
