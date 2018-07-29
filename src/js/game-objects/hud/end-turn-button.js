import { emitter, EVENT_NAMES } from "../events";

/**
 * @export
 * @class EndTurnButton
 */
export default class EndTurnButton {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.add
      .sprite(0, 0, "assets", "ui/end-turn-normal")
      .setOrigin(0.5, 0.5)
      .setAlpha(0.9)
      .setScale(0.8, 0.8)
      .setVisible(false)
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
    // emitter.emit(EVENT_NAMES.PLAYER_TURN_END);
    emitter.emit(EVENT_NAMES.PLAYER_TURN_ATTEMPT_COMPLETE);
  }

  activate() {
    this.sprite.setVisible(true);
  }

  deactivate() {
    this.sprite.setVisible(false);
  }
}
