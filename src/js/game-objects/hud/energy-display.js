import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#FFF"
};

export default class EnergyDisplay {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.add.sprite(x, y, "assets", "ui/energy-background").setOrigin(0.5, 0.5);
    this.text = scene.add.text(x, y, "0", style).setOrigin(0.5, 0.5);
  }

  setEnergy(value) {
    this.text.setText(value);
  }

  destroy() {
    this.sprite.destroy();
    this.text.destroy();
  }
}
