/**
 * Isolated shake tween that can be applied to any object with x/y/angle properties. Apply the shake
 * to the target object via applyTo(...) in the game loop.
 */
export default class ShakeEffect {
  /**
   * @param {Phaser.Scene} scene
   * @memberof ShakeEffect
   */
  constructor(scene) {
    this.scene = scene;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
  }

  start() {
    this.stop();
    this.timeline = this.scene.tweens.timeline({
      targets: this,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      loop: -1,
      duration: 60,
      tweens: [
        { x: -1, y: -1, angle: 1 },
        { x: 1, y: 1.5, angle: -1.5 },
        { x: 0.5, y: 1, angle: 0.5 },
        { x: -1.5, y: -0.5, angle: -0.5 }
      ]
    });
  }

  stop() {
    if (this.timeline) this.timeline.stop();
  }

  applyTo(gameObject) {
    gameObject.x += this.x;
    gameObject.y += this.y;
    gameObject.angle += this.angle;
  }

  destroy() {
    this.stop();
  }
}
