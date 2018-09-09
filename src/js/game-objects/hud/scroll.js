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

    const openFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-",
      end: 11,
      zeroPad: 5
    });
    const closeFrames = openFrames.slice().reverse();

    this.scrollBackground = scene.add.sprite(0, 0, "assets", openFrames[0].frame).setInteractive();
    this.text = scene.add.text(0, 0, "", style).setOrigin(0.5, 0.5);

    scene.anims.create({ key: "scroll-open", frames: openFrames, frameRate: 30 });
    scene.anims.create({ key: "scroll-close", frames: closeFrames, frameRate: 30 });

    this.container = scene.add.container(
      x + this.scrollBackground.width / 2,
      y + this.scrollBackground.height / 2,
      [this.scrollBackground, this.text]
    );

    // Debounce, wait this long before showing instructions on hover.
    this.debounceTimer = null;
    const debounceTime = 250;

    // Hide, wait this long with no change before hiding the instructions.
    this.hideTimer = null;
    const hideTime = 10000;

    // When a card has been focused, show the instructions (after the debounce, of course!)
    const mobProxy = new MobXProxy();
    mobProxy.observe(store, "focusedPlayerCard", change => {
      this.clearTimers();
      this.debounceTimer = setTimeout(() => {
        const card = change.newValue;
        if (card) this.showInstructions(card);
        this.debounceTimer = null;
        this.hideTimer = setTimeout(() => {
          this.hideInstructions();
        }, hideTime);
      }, debounceTime);
    });

    // When a card has been played, hide the instructions.
    mobProxy.observe(store, "activePlayerCard", change => {
      const card = change.newValue;
      if (!card) {
        this.hideInstructions();
        this.clearTimers();
      }
    });
  }

  hideInstructions() {
    // TODO(rex): Animate the instructions scroll.
    this.text.setText("");
    this.scrollBackground.play("scroll-close", false);
  }

  showInstructions(card) {
    // TODO(rex): Animate the instructions scroll.
    this.text.setText(card.cardInfo.description);
    this.scrollBackground.play("scroll-open", false);
  }

  clearTimers() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  destroy() {
    this.clearTimers();
    this.mobProxy.destroy();
    this.container.destroy();
  }
}
