import { emitter, EVENT_NAMES } from "../events";
import store from "../../store";
import { autorun, observe } from "mobx";
import { EventProxy } from "../events/index";

/**
 * @export
 * @class DiscardPile
 */
export default class DiscardPile {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.cardOutline = scene.add.sprite(0, 0, "assets", "cards/card-drop-target").setInteractive();
    this.reclaim = scene.add.sprite(0, 0, "assets", "cards/card-reclaim");
    this.container = scene.add.container(x, y, [this.cardOutline, this.reclaim]);

    this.proxy = new EventProxy();

    this.isEnabled = true;
    this.disable();

    this.disposers = [];
    this.disposers.push(
      observe(store, "activePlayerCard", change => {
        const card = change.newValue;
        const isReclaimable = card && card.cardInfo.energy > 0;
        if (isReclaimable) this.enable();
        else this.disable();
      })
    );
    this.disposers.push(
      observe(store, "isTargetingReclaim", change => {
        const isTargetingReclaim = change.newValue;
        if (this.isEnabled) {
          if (isTargetingReclaim) this.focus();
          else this.defocus();
        }
      })
    );

    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  enable() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        duration: 200,
        ease: "Quad.easeOut"
      });
      this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG, this.onCardDrag, this);
      this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_END, this.onCardDrag, this);
    }
  }

  disable() {
    if (this.isEnabled) {
      this.isEnabled = false;
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
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
    const isOver = this.container.getBounds().contains(pointer.x, pointer.y);
    store.setTargetingReclaim(isOver);
  }

  focus() {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  defocus() {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  destroy() {
    this.proxy.removeAll();
    this.container.destroy();
    this.disposers.forEach(fn => fn());
  }
}
