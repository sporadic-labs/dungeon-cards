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

    // this.isActive = false;
    this.isActive = true;

    // TODO: add card bg
    this.sprite = scene.add
      .sprite(0, 0, "assets", `cards/card-contents-reclaim`)
      .setOrigin(0.5, 0.5)
      .setAlpha(0.9)
      .setScale(0.8, 0.8)
      .setInteractive();

    this.sprite.setPosition(x, y);

    this.sprite.on("pointerdown", () => {
      this.select();
    });

    this.sprite.on("pointerover", () => {
      this.sprite.setAlpha(1);
      this.sprite.setScale(0.85);
    });

    this.sprite.on("pointerout", () => {
      this.sprite.setAlpha(0.9);
      this.sprite.setScale(0.8);
    });
  }

  select() {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DISCARD);
  }

  activate() {
    this.sprite.setVisible(true);
  }

  deactivate() {
    this.sprite.setVisible(false);
  }
}
