/**
 * A manager that keeps track of unique tweens for an object. This allows you to add and stop a
 * tween by specifying a key. Thus a method for tweening a card to the player's hand can kill the
 * previous "cardToHand" tween and start a new "cardToHand" tween easily.
 *
 * The initial motivation for this is that Phaser 3 methods for killing tweens are a bit buggy. If
 * you create a tween and try to killAllTweens on the same tick, the tween won't be killed.
 *
 * @export
 * @class TweenManager
 */
export default class TweenManager {
  constructor(scene) {
    this.scene = scene;
    this.tweens = new Map();
  }

  /**
   * Add a tween under the given key. This will override (but not stop) any existing tween with the
   * same key.
   *
   * @param {*} key
   * @param {*} args The args that Scene#TweenManager#add takes.
   */
  add(key, ...args) {
    const tween = this.scene.tweens.add(...args);
    this.tweens.set(key, tween);
  }

  /**
   * Stop the tween under the given key (if it exists).
   *
   * @param {*} key
   */
  stop(key) {
    const tween = this.tweens.get(key);
    if (tween) {
      tween.stop();
      this.tweens.delete(key);
    }
  }

  /**
   * Stop all tweens.
   */
  stopAll() {
    this.tweens.forEach(tween => tween.stop());
    this.tweens.clear();
  }

  destroy() {
    console.log("destroyed");
    this.stopAll();
    this.scene = undefined;
  }
}
