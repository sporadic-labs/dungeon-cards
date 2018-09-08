import { autorun } from "mobx";
import { getFontString } from "../../font";
import store from "../../store";
import { EventProxy } from "../events/index";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6"
};

const previewTextStyle = Object.assign({}, style, {
  font: getFontString("Chivo", { size: "36px", weight: 600 })
});

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

    this.previewText = scene.add
      .text(x + 10, y - 30, "", previewTextStyle)
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.dispose = autorun(() => {
      const card = store.activePlayerCard;
      if (card && card.getEnergy() > 0 && store.isTargetingDropZone) {
        this.previewText.setText(`+${card.getEnergy()}`);
        this.showPreviewText();
      } else this.hidePreviewText();
    });

    this.proxy = new EventProxy();
    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  showPreviewText() {
    if (this.timeline) this.timeline.destroy();
    this.timeline = this.scene.tweens
      .createTimeline()
      .add({
        targets: this.previewText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        ease: "Bounce.In"
      })
      .add({
        targets: this.previewText,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: "Quad.Out"
      })
      .play();
  }

  hidePreviewText() {
    this.previewText.setText("").setScale(0);
  }

  setEnergy(value) {
    this.text.setText(value);
  }

  destroy() {
    if (this.timeline) this.timeline.destroy();
    this.dispose();
    this.sprite.destroy();
    this.text.destroy();
    this.previewText.destroy();
    this.proxy.removeAll();
  }
}
