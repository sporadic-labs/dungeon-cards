import { EventProxy, emitter, EVENT_NAMES } from "../events";
import { getFontString } from "../../font";
import gameStore from "../../store/index";

const style = {
  font: getFontString("Chivo", { size: "12px", weight: 600 }),
  fill: "#000"
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
    this.proxy = new EventProxy();

    this.focused = false;
    this.displayCard = null;

    this.scrollBackground = scene.add.sprite(0, 0, "assets", "scroll/scroll").setInteractive();
    this.text = scene.add.text(0, 0, "Instructions", style).setOrigin(0.5, 0.5);

    this.container = scene.add.container(
      x + this.scrollBackground.width / 2,
      y + this.scrollBackground.height / 2,
      [this.scrollBackground, this.text]
    );

    this.enableFocusing();
  }

  isInBounds(x, y) {
    const bounds = this.container.getBounds();
    const x1 = bounds.x;
    const x2 = bounds.x + bounds.width;
    const y1 = bounds.y;
    const y2 = bounds.y + bounds.height;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  enableFocusing() {
    this.scrollBackground.on("pointerover", this.onPointerOver);
    this.scrollBackground.on("pointerout", this.onPointerOut);
  }

  disableFocusing() {
    this.scrollBackground.off("pointerover", this.onPointerOver);
    this.scrollBackground.off("pointerout", this.onPointerOut);
  }

  enableSelecting() {
    this.scrollBackground.on("pointerdown", this.onPointerDown);
    this.scene.input.on("pointerup", this.onPointerRelease);
  }

  disableSelecting() {
    this.scrollBackground.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointerup", this.onPointerRelease);
  }

  onPointerOver = () => {
    emitter.emit(EVENT_NAMES.INSTRUCTIONS_FOCUS);
    if (this.focused) return;
    this.focused = true;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: "Quad.easeOut"
    });
  };

  onPointerOut = () => {
    emitter.emit(EVENT_NAMES.INSTRUCTIONS_DEFOCUS);
    if (!this.focused) return;
    this.focused = false;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 200,
      ease: "Quad.easeOut"
    });
  };

  onPointerDown = () => {
    console.log("clicking on the scroll!");
  };

  onPointerRelease = () => {
    const selectedCard = gameStore.activeCard;
    if (selectedCard) this.showInstructions(selectedCard);
    emitter.emit(EVENT_NAMES.INSTRUCTIONS_SELECT, selectedCard);
  };

  showInstructions(selectedCard) {
    this.text.setText(selectedCard.type);
  }

  destroy() {
    this.proxy.removeAll();
    this.scene.input.off("pointerup", this.onPointerRelease);
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
