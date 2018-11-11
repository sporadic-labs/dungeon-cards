import FlipEffect from "../../shared-components/flip-effect";
import { EventProxy } from "../../events/index";
import TweenEffect from "./tween-effect";

export default class BlankCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.cardFront = scene.add.container(x, y, [
      scene.add.sprite(0, 0, "assets", "cards/card-shadow"),
      scene.add.sprite(0, 0, "assets", "cards/card")
    ]);

    this.cardBack = scene.add.container(x, y, [
      scene.add.sprite(0, 0, "assets", "cards/card-shadow"),
      scene.add.sprite(0, 0, "assets", "cards/card-back")
    ]);

    this.eventProxy = new EventProxy();
    this.flipEffect = new FlipEffect(scene, this.cardFront, this.cardBack).setToBack();
    this.fadeEffect = new TweenEffect(scene, {
      targets: [this.cardFront, this.cardBack],
      duration: 350,
      ease: "Quad.easeOut"
    });
  }

  getPosition() {
    return { x: this.card.x, y: this.card.y };
  }

  fadeIn(delay) {
    this.cardFront.alpha = 0;
    this.cardBack.alpha = 0;
    return this.fadeEffect.to({ alpha: 1, delay });
  }

  fadeOut(delay) {
    return this.fadeEffect.to({ alpha: 0, delay });
  }

  // Move via center
  moveTo(x, y, delay = 0) {
    this.scene.tweens.killTweensOf([this.cardFront, this.cardBack]);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.cardFront, this.cardBack],
        x: x,
        y: y,
        delay: delay,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  flip() {
    return new Promise(resolve => {
      this.eventProxy.once(this.flipEffect.events, "complete", resolve);
      this.flipEffect.flipToFront();
    });
  }

  destroy() {
    this.scene.tweens.killTweensOf([this.cardFront, this.cardBack]);
    this.cardBack.destroy();
    this.cardFront.destroy();
    this.eventProxy.removeAll();
    this.flipEffect.destroy();
    this.fadeEffect.destroy();
  }
}
