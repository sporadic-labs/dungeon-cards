import { emitter, EVENT_NAMES } from "../events";
import Button from "./button";

import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6"
};

export default class ModalDialog {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, x, y, text) {
    this.scene = scene;

    this.x = x;
    this.y = y;

    this.modalWidth = 400;
    this.modalHeight = 200;
    const shadowOffset = 5;
    const cornerRadius = 20;

    this.modalBackground = scene.add
      .graphics({
        x: x - this.modalWidth / 2,
        y: y - this.modalHeight / 2
      })
      .fillStyle(0xffffff, 1.0)
      .fillRoundedRect(0, 0, this.modalWidth, this.modalHeight, cornerRadius);

    this.modalShadow = scene.add
      .graphics({
        x: x - this.modalWidth / 2 + shadowOffset,
        y: y - this.modalHeight / 2 + shadowOffset
      })
      .setAlpha(0.4)
      .fillStyle(0xffffff, 1.0)
      .fillRoundedRect(0, 0, this.modalWidth, this.modalHeight, cornerRadius);

    this.contentText = scene.add.text(x, y, text, style).setOrigin(0.5, 0.5);

    this.closeButton = new Button(scene, this.modalWidth - 10, 10, {
      framePrefix: "ui/end-turn-",
      origin,
      onDown: () => emitter.emit(EVENT_NAMES.PLAYER_TURN_ATTEMPT_COMPLETE)
    });

    this.actionButton = new Button(scene, x, y, {
      framePrefix: "ui/end-turn-",
      origin,
      onDown: () => emitter.emit(EVENT_NAMES.PLAYER_TURN_ATTEMPT_COMPLETE)
    });

    this.dialog = scene.add
      .container(x, y, [
        this.modalShadow,
        this.modalBackground,
        this.contentText,
        this.actionButton,
        this.closeButton
      ])
      .setSize(this.card.width, this.card.height)
      .setInteractive();
  }

  setContent(value) {
    if (value && value !== "") {
      this.contentText.setText(value);
    }
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  destroy() {
    this.cardFront.destroy();
  }
}
