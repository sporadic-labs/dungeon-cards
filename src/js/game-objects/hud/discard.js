import { emitter, EVENT_NAMES } from "../events";

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

    this.card.on("pointerdown", () => this.select());

    this.card.on("pointerover", () => {
      this.pointerOver = true;
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: "Quad.easeOut"
      });
    });

    this.card.on("pointerout", () => {
      this.pointerOver = false;
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Quad.easeOut"
      });
    });
  }

  select() {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DISCARD);
  }

  isPointerOver() {
    return this.pointerOver;
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
  }
}
