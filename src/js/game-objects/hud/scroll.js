import { getFontString } from "../../font";
import store from "../../store/index";
import Phaser from "phaser";
import MobXProxy from "../../helpers/mobx-proxy";
import { EventProxy } from "../events/index";

const descriptionStyle = {
  font: getFontString("Chivo", { size: "12px", weight: 400 }),
  fill: "#3C3E42",
  align: "center",
  wordWrap: { width: 120 }
};

const titleStyle = {
  font: getFontString("Chivo", { size: "13px", weight: 600 }),
  fill: "#3C3E42",
  wordWrap: { width: 120 }
};

const STATE = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CLOSING: "CLOSING",
  OPENING: "OPENING"
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

    const bodyFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-body-",
      end: 11,
      zeroPad: 5
    });
    const rollerFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-rollers-",
      end: 11,
      zeroPad: 5
    });

    scene.anims.create({ key: "rollers-open", frames: rollerFrames, frameRate: 40 });
    scene.anims.create({ key: "body-open", frames: bodyFrames, frameRate: 40 });

    this.scrollBody = scene.add.sprite(0, 0, "assets", bodyFrames[0].frame);
    this.scrollRollers = scene.add.sprite(0, 0, "assets", rollerFrames[0].frame);

    const cx = x + this.scrollRollers.width / 2;
    const cy = y + this.scrollRollers.height / 2;
    this.scrollRollers.setPosition(cx, cy);
    this.scrollBody.setPosition(cx, cy);

    this.cx = cx;
    this.cy = cy;
    this.textSpacing = 12;
    this.descriptionText = scene.add.text(cx, cy, "", descriptionStyle).setOrigin(0.5, 0.5);
    this.titleText = scene.add.text(0, 0, "", titleStyle).setOrigin(0.5, 1);
    this.titleText.setPosition(
      cx,
      cy - this.textSpacing - this.descriptionText.getBounds().height / 2
    );

    const mask = new Phaser.Display.Masks.BitmapMask(scene, this.scrollBody);
    this.titleText.setMask(mask);
    this.descriptionText.setMask(mask);

    // Debounce, wait this long before showing instructions on hover.
    this.debounceTimer = null;
    const debounceTime = 250;

    this.eventProxy = new EventProxy();

    // When a card has been focused, show the instructions (after the debounce, of course!)
    this.mobProxy = new MobXProxy();
    this.mobProxy.observe(store, "focusedPlayerCard", change => {
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
    this.mobProxy.observe(store, "focusedEnemyCard", change => {
      const card = change.newValue;
      if (card) console.log("focusedEnemyCard");
    });

    // When a card has been played, hide the instructions.
    this.mobProxy.observe(store, "activePlayerCard", change => {
      const card = change.newValue;
      if (!card) {
        this.hideInstructions();
        this.clearTimers();
      }
    });

    // Internal emitter for responding to state changes
    this.emitter = new Phaser.Events.EventEmitter();
    // Hook state into the animation stages
    this.state = STATE.CLOSED;
    this.eventProxy.on(this.scrollBody, "animationstart", (anim, frame) => {
      this.state = this.scrollBody.anims.forward ? STATE.OPENING : STATE.CLOSING;
      this.emitter.emit(this.state);
    });
    this.eventProxy.on(this.scrollBody, "animationcomplete", (anim, frame) => {
      this.state = frame.isLast ? STATE.OPEN : STATE.CLOSED;
      this.emitter.emit(this.state);
    });

    this.eventProxy.once(scene.events, "shutdown", this.destroy, this);
    this.eventProxy.once(scene.events, "destroy", this.destroy, this);
  }

  hideInstructions() {
    if (this.state === STATE.CLOSED || this.state === STATE.CLOSING) return;

    if (this.state === STATE.OPENING) {
      // Reverse in place
      this.scrollBody.anims.reverse("body-open");
      this.scrollRollers.anims.reverse("rollers-open");
    } else if (this.state === STATE.OPEN) {
      // Play from start
      this.scrollBody.anims.playReverse("body-open");
      this.scrollRollers.anims.playReverse("rollers-open");
    }

    this.emitter.once(STATE.CLOSED, this.clearText, this);
  }

  showInstructions(card) {
    if (this.state === STATE.CLOSED) {
      this.updateText(card);
      this.scrollBody.anims.play("body-open");
      this.scrollRollers.anims.play("rollers-open");
    } else {
      // Close and then show
      this.hideInstructions();
      this.emitter.once(STATE.CLOSED, () => this.showInstructions(card));
    }
  }

  updateText(card) {
    this.titleText.setText(card.cardInfo.title);
    this.descriptionText.setText(card.cardInfo.description);
    this.titleText.y = this.cy - this.textSpacing - this.descriptionText.getBounds().height / 2;
  }

  clearText() {
    this.titleText.setText("");
    this.descriptionText.setText("");
  }

  clearTimers() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  destroy() {
    this.mobProxy.destroy();
    this.eventProxy.removeAll();
    this.emitter.destroy();
    this.clearTimers();
    this.scrollRollers.destroy();
    this.scrollBody.destroy();
    this.text.destroy();
  }
}
