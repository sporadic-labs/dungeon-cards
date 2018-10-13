import { emitter, EVENT_NAMES } from "../events";
import store from "../../store";
import { autorun, observe } from "mobx";
import { EventProxy } from "../events/index";
import MobXProxy from "../../helpers/mobx-proxy";
import { PLAYER_CARD_TYPES } from "../player-manager/player-card";
import { Math } from "phaser";

/**
 * @export
 * @class DropTarget
 */
export default class DropTarget {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.add.sprite(x, y, "assets", "cards/card-drop-target").setInteractive();

    this.proxy = new EventProxy();

    this.isEnabled = true;
    this.disable();

    this.mobProxy = new MobXProxy();
    this.mobProxy.observe(store, "activePlayerCard", change => {
      const card = change.newValue;
      // TODO: clean this logic up and put it into PLAYER_CARD_INFO
      const isDroppable =
        card && (card.cardInfo.energy > 0 || card.type == PLAYER_CARD_TYPES.DRAW_THREE);
      if (isDroppable) this.enable();
      else this.disable();
    });
    this.mobProxy.observe(store, "isTargetingDropZone", change => {
      const isTargetingDropZone = change.newValue;
      if (this.isEnabled) {
        if (isTargetingDropZone) this.focus();
        else this.defocus();
      }
    });

    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  enable() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.scene.tweens.killTweensOf(this.sprite);
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 1,
        duration: 200,
        ease: "Quad.easeOut"
      });
      this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG, this.onCardDrag, this);
      this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onCardDrag, this);
    }
  }

  disable() {
    store.setTargetingDropZone(false);
    if (this.isEnabled) {
      this.isEnabled = false;
      this.scene.tweens.killTweensOf(this.sprite);
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.25,
        duration: 200,
        ease: "Quad.easeOut"
      });
      this.proxy.off(emitter, EVENT_NAMES.PLAYER_CARD_DRAG, this.onCardDrag, this);
      this.proxy.off(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onCardDrag, this);
    }
  }

  onCardDrag() {
    const pointer = this.scene.input.activePointer;
    const isOver = this.sprite.getBounds().contains(pointer.x, pointer.y);
    store.setTargetingDropZone(isOver);
  }

  focus() {
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  defocus() {
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  destroy() {
    this.mobProxy.destroy();
    this.proxy.removeAll();
    this.sprite.destroy();
  }
}
