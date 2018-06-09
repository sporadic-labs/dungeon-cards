import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#FFF"
};

export default class PopupText {
  /**
   * @param {Phaser.Scene} scene
   * @param {string} text
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, text, x, y) {

    this.text = text;
    this.scene = scene;

    this.text = scene.add
      .text(0, 0, text, style)
      .setOrigin(0.5, 0.5);

    this.setPosition(x, y);

    this.scene.tweens.add({
      targets: this.text,
      scaleY: 1.05,
      scaleX: 1.05,
      y: y - 10,
      duration: 800,
      ease: "Quad.easeOut",
      onComplete: () => this.destroy()
    });
  }

  setPosition(x, y) {
    const cx = x + this.text.width / 2;
    const cy = y + this.text.height / 2;
    this.text.x = cx;
    this.text.y = cy;
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.text);
    this.text.destroy();
  }
}
