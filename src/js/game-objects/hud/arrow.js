import { EventProxy } from "../events/index";

/**
 * Animated arrow with a dynamically placed shadow. It points in the direction it is rotated.
 */
export default class Arrow {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} x
   * @param {*} y
   * @param {*} angle Degrees that the arrow should be rotated
   */
  constructor(scene, x, y, angle) {
    this.shadowSize = 4;
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.angle = angle;

    this.shadow = scene.add
      .sprite(x + this.shadowSize, y + this.shadowSize, "assets", "ui/arrow-shadow")
      .setAngle(angle);
    this.arrow = scene.add.sprite(x, y, "assets", "ui/arrow").setAngle(angle);

    const radians = (angle * Math.PI) / 180;
    const animationLength = 10;
    const dx = animationLength * Math.cos(radians);
    const dy = animationLength * Math.sin(radians);

    scene.tweens.add({
      targets: [this.shadow, this.arrow],
      duration: 300,
      x: `+=${dx}`,
      y: `+=${dy}`,
      ease: Phaser.Math.Easing.Sine.InOut,
      yoyo: true,
      repeat: -1
    });

    this.proxy = new EventProxy();
    this.proxy.on(scene.events, "destroy", this.destroy);
    this.proxy.on(scene.events, "shutdown", this.destroy);
  }

  destroy() {
    this.arrow.destroy();
    this.shadow.destroy();
    this.proxy.removeAll();
  }
}
