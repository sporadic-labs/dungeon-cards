import { emitter, EVENT_NAMES } from "../events";
import store from "../../store";
import { autorun } from "mobx";
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

    this.pointerOver = false;

    this.proxy = new EventProxy();
    this.proxy.on(this.cardOutline, "pointerup", () => this.select());
    this.proxy.on(this.cardOutline, "pointerover", () => store.setReclaimActive(true));
    this.proxy.on(this.cardOutline, "pointerout", () => store.setReclaimActive(false));

    this.dispose = autorun(() => {
      if (store.isReclaimActive) {
        this.scene.tweens.killTweensOf(this.container);
        this.scene.tweens.add({
          targets: this.container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
          ease: "Quad.easeOut"
        });
      } else {
        this.scene.tweens.killTweensOf(this.container);
        this.scene.tweens.add({
          targets: this.container,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: "Quad.easeOut"
        });
      }
    });

    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  select() {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DISCARD);
  }

  activate() {
    this.container.setVisible(true);
  }

  deactivate() {
    this.container.setVisible(false);
  }

  destroy() {
    this.proxy.removeAll();
    this.container.destroy();
    this.dispose();
  }
}
