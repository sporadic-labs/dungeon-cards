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
    const message = this.scene.add
      .text(this.x, this.y, text, style)
      .setOrigin(0.5, 1)
      .setDepth();
    this.messages.push(message);
    this.messages.forEach((m, i) => m.setDepth(1000 + i));
    this.tweenToast();
    this.tweenLastToastOut();
  }

  tweenToast() {
    const message = this.messages[this.messages.length - 1];
    this.timeline = this.scene.tweens.timeline({
      targets: message,
      tweens: [
        { y: message.height, duration: 200, ease: Phaser.Math.Easing.Cubic.Out },
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
