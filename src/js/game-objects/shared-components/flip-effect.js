import Phaser from "phaser";

/**
 * This currently only does a horizontal flip, but we can extend to a vertical flip later if needed.
 */
export default class FlipEffect {
  /**
   * @param {Phaser.Scene} scene
   * @param {GameObject} front
   * @param {GameObject} back
   */
  constructor(scene, front, back, { frontScale = 1, backScale = 1 } = {}) {
    this.scene = scene;
    this.front = front;
    this.back = back;
    this.frontScale = frontScale;
    this.backScale = backScale;
    this.flipTween = null;

    /**
     * flipProgress is a value between 1 (front facing up) and -1 (back facing up). It starts in a
     * neutral state so that the effect doesn't actually manipulate the game objects until the user
     * tells it to.
     */
    this.flipProgress = 0;

    /** Emits flip events for "start" & "complete" */
    this.events = new Phaser.Events.EventEmitter();
  }

  setToBack() {
    this.flipProgress = -1;
    this.onFlipUpdate();
    return this;
  }

  setToFront() {
    this.flipProgress = 1;
    this.onFlipUpdate();
    return this;
  }

  flipToBack() {
    if (this.flipTween) this.flipTween.stop();
    this.flipTween = this.scene.tweens.add({
      targets: this,
      flipProgress: -1,
      duration: 300,
      ease: "Quad.easeOut",
      onStart: this.onFlipStart,
      onStartScope: this,
      onUpdate: this.onFlipUpdate,
      onUpdateScope: this,
      onComplete: this.onFlipComplete,
      onCompleteScope: this
    });
    return this;
  }

  flipToFront() {
    if (this.flipTween) this.flipTween.stop();
    this.flipTween = this.scene.tweens.add({
      targets: this,
      flipProgress: 1,
      duration: 300,
      ease: "Quad.easeOut",
      onStart: this.onFlipStart,
      onStartScope: this,
      onUpdate: this.onFlipUpdate,
      onUpdateScope: this,
      onComplete: this.onFlipComplete,
      onCompleteScope: this
    });
    return this;
  }

  flip() {
    if (this.flipProgress > 0) this.flipToBack();
    else this.flipToBack();
    return this;
  }

  onFlipUpdate() {
    if (this.flipProgress > 0) {
      this.front.scaleX = this.flipProgress * this.frontScale;
      this.back.setVisible(false);
      this.front.setVisible(true);
    } else {
      this.back.scaleX = -this.flipProgress * this.backScale;
      this.back.setVisible(true);
      this.front.setVisible(false);
    }
  }

  onFlipStart() {
    this.events.emit("start", this);
  }

  onFlipComplete() {
    this.events.emit("complete", this);
  }

  destroy() {
    this.scene = undefined;
    this.front = undefined;
    this.back = undefined;
    if (this.flipTween) this.flipTween.stop();
  }
}
