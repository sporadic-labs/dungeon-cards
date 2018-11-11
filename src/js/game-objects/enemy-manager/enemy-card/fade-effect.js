/**
 * Isolated fade tween that can be applied to any number of target objects with "alpha" properties.
 * Applies the effect directly to the object(s).
 */
export default class FadeEffect {
  /**
   * @param {Phaser.Scene} scene
   * @param {GameObject|GameObject[]} target Object(s) to apply the fade effect to. They should have
   * an "alpha" property
   */
  constructor(scene, target) {
    this.scene = scene;
    this.target = target;
    this.fadeTween = null;
  }

  /**
   * Fade from the objects current alpha to 1.
   *
   * @param {number} [delay=0]
   * @returns A promise that resolves when the fade is done
   */
  fadeIn(delay = 0) {
    this.stop();
    return new Promise(resolve => {
      this.fadeTween = this.scene.tweens.add({
        targets: this.target,
        alpha: 1,
        delay,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  /**
   * Fade from the objects current alpha to 0.
   *
   * @param {number} [delay=0]
   * @returns A promise that resolves when the fade is done
   */
  fadeOut(delay = 0) {
    this.stop();
    return new Promise(resolve => {
      this.fadeTween = this.scene.tweens.add({
        targets: this.target,
        alpha: 0,
        delay,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  stop() {
    if (this.fadeTween) this.fadeTween.stop();
  }

  destroy() {
    this.stop();
  }
}
