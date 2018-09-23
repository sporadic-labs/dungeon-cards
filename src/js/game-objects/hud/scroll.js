import { getFontString } from "../../font";
import store from "../../store/index";
import Phaser from "phaser";
import MobXProxy from "../../helpers/mobx-proxy";
import { EventProxy } from "../events/index";

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

    const bodyOpenFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-body-",
      end: 11,
      zeroPad: 5
    });
    const bodyCloseFrames = bodyOpenFrames.slice().reverse();
    const rollerOpenFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-rollers-",
      end: 11,
      zeroPad: 5
    });
    const rollerCloseFrames = rollerOpenFrames.slice().reverse();

    scene.anims.create({ key: "scroll-rollers-open", frames: rollerOpenFrames, frameRate: 30 });
    scene.anims.create({ key: "scroll-rollers-close", frames: rollerCloseFrames, frameRate: 30 });
    scene.anims.create({ key: "scroll-body-open", frames: bodyOpenFrames, frameRate: 30 });
    scene.anims.create({ key: "scroll-body-close", frames: bodyCloseFrames, frameRate: 30 });

    this.scrollBody = scene.add.sprite(0, 0, "assets", bodyOpenFrames[0].frame);
    this.scrollRollers = scene.add.sprite(0, 0, "assets", rollerOpenFrames[0].frame);
    this.text = scene.add.text(0, 0, "", style).setOrigin(0.5, 0.5);
    const cx = x + this.scrollRollers.width / 2;
    const cy = y + this.scrollRollers.height / 2;
    this.scrollRollers.setPosition(cx, cy);
    this.scrollBody.setPosition(cx, cy);
    this.text.setPosition(cx, cy);

    const mask = new Phaser.Display.Masks.BitmapMask(scene, this.scrollBody);
    this.text.setMask(mask);

    // Debounce, wait this long before showing instructions on hover.
    this.debounceTimer = null;
    const debounceTime = 250;

    this.eventProxy = new EventProxy();

    // When a card has been focused, show the instructions (after the debounce, of course!)
    const mobProxy = new MobXProxy();
    mobProxy.observe(store, "focusedPlayerCard", change => {
      this.clearTimers();
      this.debounceTimer = setTimeout(() => {
        const card = change.newValue;
        if (card) {
          this.showInstructions(card);
        } else {
          this.hideInstructions();
        }
        this.debounceTimer = null;
      }, debounceTime);
    });

    // When an enemy card has been focused, show the instructions.
    // NOTE(rex): Favor the enemy card over the player card, if both are focused at the same time.
    mobProxy.observe(store, "focusedEnemyCard", change => {
      const card = change.newValue;
      if (card) console.log("focusedEnemyCard");
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
    this.scrollBody.play("scroll-body-close");
    this.scrollRollers.play("scroll-rollers-close");
    this.eventProxy.once(this.scrollBody, "animationcomplete", this.onClose, this);
  }

  showInstructions(card) {
    this.eventProxy.off(this.scrollBody, "animationcomplete", this.onClose, this);
    this.text.setText(card.cardInfo.description);
    this.scrollBody.play("scroll-body-open");
    this.scrollRollers.play("scroll-rollers-open");
  }

  onClose() {
    this.text.setText("");
  }

  clearTimers() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  destroy() {
    this.clearTimers();
    this.mobProxy.destroy();
    this.eventProxy.removeAll();
    this.scrollRollers.destroy();
    this.scrollBody.destroy();
    this.text.destroy();
  }
}
