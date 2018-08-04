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

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");

    // TODO: add card bg
    this.cardContents = scene.add
      .sprite(0, 0, "assets", `cards/card-contents-reclaim`)
      .setInteractive();

    this.container = scene.add.container(x, y, [this.cardShadow, this.card, this.cardContents]);

    this.cardContents.on("pointerdown", () => this.select());

    this.cardContents.on("pointerover", () => {
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Quad.easeOut"
      });
    });

    this.cardContents.on("pointerout", () => {
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

  activate() {
    this.cardContents.setVisible(true);
  }

  deactivate() {
    this.cardContents.setVisible(false);
  }

  destroy() {
    this.container.destroy();
  }
}
