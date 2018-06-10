import { getFontString } from "../../font";

const defaultStyle = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#FFC936"
};

export default class PopupText {
  /**
   * @param {Phaser.Scene} scene
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {Phaser.GameObjects.Text.TextStyle} style
   */
  constructor(scene, text, x, y, style) {
    this.text = text;
    this.scene = scene;
    this.style = style || defaultStyle;

    this.text = scene.add.text(0, 0, text, this.style).setOrigin(0.5, 0.5);

    this.setPosition(x, y);

    this.scene.tweens.add({
      targets: this.text,
      scaleY: 1.02,
      scaleX: 1.02,
      y: y - 2,
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
