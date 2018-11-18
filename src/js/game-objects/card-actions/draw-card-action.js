import { EventProxy, emitter, EVENT_NAMES } from "../events";
import Action from "./action";
import { gameStore } from "../../store";

export default class DrawCardAction extends Action {
  /** @param {Phaser.Scene} scene */
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();

    this.actionRunner = actionRunner;
    this.scene = scene;
    this.card = card;
    this.proxy = new EventProxy();
    this.playerManager = playerManager;
    this.scroll = playerManager.scroll;
    this.sound = this.scene.sound; // TODO: use this.scene.game.globals.sfxPlayer

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onDragEnd, this);
  }

  onDragEnd(pointer) {
    if (gameStore.isTargetingDropZone) {
      // Drawing 3 and discarding 1
      if (this.playerManager.canDraw(2)) {
        this.sound.play("card-place-3");
        this.playerManager.drawCard();
        this.playerManager.drawCard();
        this.playerManager.drawCard();
        emitter.emit(EVENT_NAMES.ACTION_COMPLETE, this.card);
      } else {
        this.sound.play("incorrect");
        this.actionRunner.showToast("You can't draw cards - you'll have too many!");
        emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
      }
    } else {
      this.sound.play("incorrect");
      this.actionRunner.showToast("You can't play that card there.");
      emitter.emit(EVENT_NAMES.ACTION_UNSUCCESSFUL);
    }
  }

  destroy() {
    this.proxy.removeAll();
  }
}
