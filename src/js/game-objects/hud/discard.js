import { emitter, EVENT_NAMES } from "../events";
import store from "../../store";
import { autorun } from "mobx";

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

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-reclaim-shadow");
    this.card = scene.add.sprite(0, 0, "assets", `cards/card-reclaim`).setInteractive();

    this.container = scene.add.container(x, y, [this.cardShadow, this.card]);

    this.pointerOver = false;

    this.card.on("pointerup", () => this.select());
    this.card.on("pointerover", () => store.setReclaimActive(true));
    this.card.on("pointerout", () => store.setReclaimActive(false));

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
  }

  select() {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DISCARD);
  }

  activate() {
    this.card.setVisible(true);
    this.cardShadow.setVisible(true);
  }

  deactivate() {
    this.card.setVisible(false);
    this.cardShadow.setVisible(false);
  }

  destroy() {
    this.container.destroy();
    this.dispose();
  }
}
