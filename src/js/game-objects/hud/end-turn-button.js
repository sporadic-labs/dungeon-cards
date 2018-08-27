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
      .setInteractive();

    this.sprite.setPosition(x, y);
  }

  enableInteractivity() {
    this.sprite.setTexture("assets", "ui/end-turn-normal");
    this.sprite.on("pointerdown", this.onPointerDown, this);
    this.sprite.on("pointerover", this.onPointerOver, this);
    this.sprite.on("pointerout", this.onPointerOut, this);
  }

  disableInteractivity() {
    this.sprite.setTexture("assets", "ui/end-turn-normal");
    this.sprite.off("pointerdown", this.onPointerDown, this);
    this.sprite.off("pointerover", this.onPointerOver, this);
    this.sprite.off("pointerout", this.onPointerOut, this);
  }

  onPointerDown() {
    emitter.emit(EVENT_NAMES.PLAYER_TURN_ATTEMPT_COMPLETE);
  }

  onPointerOver() {
    this.sprite.setTexture("assets", "ui/end-turn-pressed");
  }

  onPointerOut() {
    this.sprite.setTexture("assets", "ui/end-turn-normal");
  }

  activate() {
    this.sprite.setAlpha(1);
    this.enableInteractivity();
  }

  deactivate() {
    this.sprite.setAlpha(0.8);
    this.disableInteractivity();
  }
}
