import { getFontString } from "../../font";
import store from "../../store/index";
import MobXProxy from "../../helpers/mobx-proxy";

const style = {
  font: getFontString("Chivo", { size: "12px", weight: 600 }),
  fill: "#000",
  wordWrap: { width: 100 }
};

/**
 * @export
 * @class Scroll
 */
export default class Scroll {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.scrollBackground = scene.add.sprite(0, 0, "assets", "scroll/scroll").setInteractive();
    this.text = scene.add.text(0, 0, "", style).setOrigin(0.5, 0.5);

    this.container = scene.add.container(
      x + this.scrollBackground.width / 2,
      y + this.scrollBackground.height / 2,
      [this.scrollBackground, this.text]
    );

    const mobProxy = new MobXProxy();
    mobProxy.observe(store, "focusedPlayerCard", change => {
      const card = change.newValue;
      if (card === null) this.hideInstructions();
      else this.text.setText(card.cardInfo.description);
    });
  }

  hideInstructions() {
    this.text.setText("");
  }

  showInstructions(card) {
    this.text.setText(card.type);
  }

  destroy() {
    this.mobProxy.destroy();
    this.container.destroy();
  }
}
