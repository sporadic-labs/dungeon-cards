/**
 * General purpose tween effect that wraps around Phaser.Tweens.Tween. This allows us to create
 * multiple, independent tweens on a single game object and easily stop them individually (e.g. one
 * for fading in/out and another for focusing in/out).
 *
 * Note: unlike ShakeEffect, which applies the effects to a internal object, this applies the tween
 * directly to the specified object(s).
 */
export default class TweenEffect {
  /**
   * Initialize the effect with any default options that will be passed when the tween is created,
   * e.g. you can specify what the targets of the tween will be.
   * @param {Phaser.Scene} scene
   * @param {object} defaultTweenOptions Default tween options that will be applied within
   * TweenEffect#to, the same parameters that you would pass to Phaser.Tweens.add, e.g. targets,
   * duration, delay.
   */
  constructor(scene, defaultTweenOptions) {
    this.scene = scene;
    this.defaultTweenOptions = defaultTweenOptions;
    this.tween = null;
  }

  /**
   * Start the tween, and stop any previous tweens.
   * @param {object} [tweenOptions] Any options to be passed to the tween that will be created.
   * Anything you can pass to Phaser.Tweens.add can be passed in here.
   * @returns A promise that resolves when the tween is done
   */
  to(tweenOptions) {
    this.stop();
    return new Promise(resolve => {
      const options = Object.assign({}, this.defaultTweenOptions, tweenOptions, {
        onComplete: resolve
      });
      this.tween = this.scene.tweens.add(options);
    });
  }

  stop() {
    if (this.tween) this.tween.stop();
  }

  destroy() {
    this.stop();
  }
}
