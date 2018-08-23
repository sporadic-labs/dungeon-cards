import { autorun } from "mobx";
import { getFontString } from "../../font";
import store from "../../store";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6"
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
    this.previewText = scene.add.text(x, y - 30, "", style).setOrigin(0.5, 0.5);

    this.dispose = autorun(() => {
      const card = store.activePlayerCard;
      if (card && store.isReclaimActive) {
        this.previewText.setText(`+${card.getEnergy()}`);
      } else this.previewText.setText("");
    });
  }

  setEnergy(value) {
    this.text.setText(value);
  }

  destroy() {
    this.dispose();
    this.sprite.destroy();
    this.text.destroy();
    this.previewText.destroy();
  }
}
