import { emitter, EVENT_NAMES } from "../events";
import Button from "./button-sprite";

import { getFontString } from "../../font";

const modalWidth = 600;
const modalHeight = 380;
const modalPadding = 25;
const lineHeight = 24;
const shadowOffset = 5;
const cornerRadius = 20;

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6",
  wordWrap: { width: modalWidth - modalPadding * 2, useAdvancedWrap: true }
};

export default class ModalDialog {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, x, y, titleText, instructionsText, onAction = null, onClose = null) {
    this.scene = scene;

    this.x = x;
    this.y = y;

    // Store these values just in case.
    this.modalWidth = modalWidth;
    this.modalHeight = modalHeight;

    this.actionCallback = onAction;
    this.closeCallback = onClose;

    this.modalBackground = scene.add
      .graphics({
        x: 0,
        y: 0
      })
      .fillStyle(0xffffff, 1.0)
      .fillRoundedRect(0, 0, this.modalWidth, this.modalHeight, cornerRadius);

    this.modalShadow = scene.add
      .graphics({
        x: shadowOffset,
        y: shadowOffset
      })
      .fillStyle(0xb5b5b5, 1.0)
      .fillRoundedRect(0, 0, this.modalWidth, this.modalHeight, cornerRadius);

    this.titleText = scene.add
      .text(this.modalWidth / 2, lineHeight + modalPadding, titleText, style)
      .setOrigin(0.5, 0.5);

    this.contentText = scene.add
      .text(this.modalWidth / 2, this.modalHeight / 2, instructionsText, style)
      .setOrigin(0.5, 0.5);

    this.actionButton = new Button(
      scene,
      this.modalWidth / 2,
      this.modalHeight - 2 * modalPadding,
      {
        framePrefix: "ui/next-instruction-",
        // onDown: () => emitter.emit(EVENT_NAMES.INSTRUCTIONS_NEXT)
        onDown: () => (this.actionCallback ? this.actionCallback() : null)
      }
    );

    this.closeButton = new Button(scene, this.modalWidth - 1.4 * modalPadding, 1.4 * modalPadding, {
      framePrefix: "ui/close-button-",
      // onDown: () => emitter.emit(EVENT_NAMES.INSTRUCTIONS_CLOSE)
      onDown: () => (this.closeCallback ? this.closeCallback() : null)
    });

    this.dialog = scene.add
      .container(x - this.modalWidth / 2, y - this.modalHeight / 2, [
        this.modalShadow,
        this.modalBackground,
        this.contentText,
        this.titleText,
        this.actionButton,
        this.closeButton
      ])
      .setSize(this.modalWidth, this.modalHeight)
      .setInteractive();
  }

  setTitle(value) {
    if (value && value !== "") {
      this.titleText.setText(value);
    }
  }

  setContent(value) {
    if (value && value !== "") {
      this.contentText.setText(value);
    }
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.dialog.setPosition(x - this.modalWidth / 2, y - this.modalHeight / 2);
  }

  setActionFrame(frame) {
    this.actionButton.setFrame("assets", frame);
  }

  onAction(cb) {
    this.actionButton.onDown = cb;
  }

  onClose(cb) {
    this.closeButton.onDown = cb;
  }

  destroy() {
    this.cardFront.destroy();
  }
}
