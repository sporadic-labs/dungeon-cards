import Phaser from "phaser";

export default class InstructionsArrow {
  /** @param {Phaser.Scene} scene */
  constructor(scene, x, y, angle) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.angle = angle;

    this.sprite = scene.add.sprite(x, y, "assets", "ui/look-here-down");
    this.sprite.setOrigin(0.5, 0.5);
    // this.sprite.setScale(0.8, 0.8);
    this.sprite.setRotation(angle);

    this.timeline = this.scene.tweens.timeline({
      targets: this.sprite,
      tweens: [
        {
          y: "+=" + this.sprite.height / 4,
          duration: 720,
          ease: Phaser.Math.Easing.Quadratic.InOut,
          yoyo: true,
          repeat: -1
        }
      ]
    });
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
  }

  setRotation(angle) {
    // In radians.
    this.sprite.setRotation(angle);
  }

  lookRight() {
    this.setTexture("assets", "ui/look-here-right");
  }

  lookLeft() {
    this.setTexture("assets", "ui/look-here-left");
  }

  lookUp() {
    this.setTexture("assets", "ui/look-here-up");
  }

  lookDown() {
    this.setTexture("assets", "ui/look-here-down");
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.timeline);
    this.sprite.destroy();
  }
}
