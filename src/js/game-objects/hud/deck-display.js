import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6"
};

export default class DeckDisplay {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, x, y, text) {
    this.scene = scene;

    this.sprite = scene.add
      .sprite(x, y, "assets", `ui/deck-3-cards`)
      .setOrigin(0.5, 0.5)
      .setInteractive();

    this.text = scene.add
      .text(x, y, text, style)
      .setOrigin(0.5, 0.5)
      .setInteractive();
  }

  setValue(value) {
    this.text.setText(value);
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setPosition(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.text.x = this.sprite.width / 2;
    this.text.y = this.sprite.height / 2;
  }

  destroy() {
    this.text.destroy();
    this.sprite.destroy();
  }
}
