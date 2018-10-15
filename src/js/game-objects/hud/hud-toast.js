import Phaser from "phaser";
import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "18px", weight: 600 }),
  backgroundColor: "#E5E0D6",
  fill: "#3C3E42",
  padding: { left: 20, right: 20, top: 10, bottom: 10 }
};

export default class HudToast {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    this.x = scene.sys.game.config.width / 2;
    this.y = 0;

    this.timeline = null;
    this.messages = [];

    this.messageQueue = [];
  }

  setMessage(text) {
    const textObject = this.scene.add.text(0, 0, text, style).setOrigin(0.5, 1);
    const { width: w, height: h } = textObject;

    const textShadow = this.scene.add.graphics();
    const shadowOffset = 5;
    textShadow.fillStyle(0x474643, 0.2);
    textShadow.fillRect(-w / 2 + shadowOffset, -h + shadowOffset, w, h); // Match text origin

    // XY of container is the (middle, bottom) of the text
    const container = this.scene.add.container(this.x, this.y, [textShadow, textObject]);

    this.messages.push(container);
    this.messages.forEach((m, i) => m.setDepth(1000 + i));
    this.tweenToast();
    this.tweenLastToastOut();
  }

  tweenToast() {
    // Note: getBounds() doesn't factor in the graphics object (shadow), which is what we want
    const message = this.messages[this.messages.length - 1];
    this.timeline = this.scene.tweens.timeline({
      targets: message,
      tweens: [
        { y: message.getBounds().height, duration: 200, ease: Phaser.Math.Easing.Cubic.Out },
        { y: 0, duration: 200, ease: Phaser.Math.Easing.Cubic.In, delay: 4000 }
      ],
      onComplete: () => this.onTweenComplete(message)
    });
  }

  tweenLastToastOut() {
    if (this.messages.length > 1) {
      const message = this.messages[this.messages.length - 2];
      this.scene.tweens.killTweensOf(message);
      this.scene.tweens.add({
        targets: message,
        y: 0,
        duration: 200,
        ease: Phaser.Math.Easing.Cubic.In,
        onComplete: () => this.onTweenComplete(message)
      });
    }
  }

  onTweenComplete(message) {
    this.messages = this.messages.filter(m => m !== message);
    this.scene.tweens.killTweensOf(message);
    message.destroy();
  }

  destroy() {
    this.messages.forEach(message => {
      this.scene.tweens.killTweensOf(message);
      message.destroy();
    });
    this.messages = [];
  }
}
