import { getFontString } from "../../font";
import store from "../../store/index";
import Phaser from "phaser";
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

    const maskOpenFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-body-",
      end: 11,
      zeroPad: 5
    });
    const openFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-",
      end: 11,
      zeroPad: 5
    });
    const closeFrames = openFrames.slice().reverse();

    scene.anims.create({ key: "scroll-open", frames: openFrames, frameRate: 30 });
    scene.anims.create({ key: "scroll-close", frames: closeFrames, frameRate: 30 });
    scene.anims.create({ key: "scroll-mask-open", frames: maskOpenFrames, frameRate: 30 });

    this.scroll = scene.add.sprite(0, 0, "assets", openFrames[0].frame);
    this.text = scene.add.text(0, 0, "", style).setOrigin(0.5, 0.5);
    this.scroll.setPosition(x + this.scroll.width / 2, y + this.scroll.height / 2);
    this.text.setPosition(this.scroll.x, this.scroll.y);

    // Note: an element inside of a container cannot be masked, so scroll and text must be separate
    // objects that are manually aligned
    this.maskSprite = scene.make.sprite({
      x: x + this.scroll.width / 2,
      y: y + this.scroll.height / 2,
      key: "assets",
      frame: maskOpenFrames[0].frame,
      add: false
    });
    const mask = new Phaser.Display.Masks.BitmapMask(scene, this.maskSprite);
    this.text.setMask(mask);

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
    this.text.setText("");
    this.scroll.play("scroll-close");
  }

  showInstructions(card) {
    this.text.setText(card.cardInfo.description);
    this.scroll.play("scroll-open");
    this.maskSprite.play("scroll-mask-open");
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
