import { EVENTS } from "../events";

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

    // this.isActive = false;
    this.isActive = true;

    this.sprite = scene.add
      .sprite(0, 0, "assets", `end-turn-button`)
      .setOrigin(0.5, 0.5)
      .setScale(0.8, 0.8)
      .setInteractive();

    this.sprite.setPosition(x, y);

    this.sprite.on("pointerdown", () => {
      if (this.isActive) {
        this.select();
      }
    });
  }

  select() {
    this.scene.events.emit(EVENTS.END_PLAYER_TURN);
    // this.deactivate();
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }
}
