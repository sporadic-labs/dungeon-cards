import Logger from "../../helpers/logger";

export class GameBoardCell {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @memberof GameBoardCell
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.card = null;

    this.sprite = scene.add.sprite(0, 0, "assets", "cards/back");

    this.sprite
      .setOrigin(0, 0)
      .setPosition(x, y)
      .setInteractive(); // Enables pointer events but not drag
  }

  /**
   * Return the current card, if it exists.
   */
  getCard() {
    return this.card;
  }

  /**
   * Set the current card.
   * @param {any} card
   */
  setCard(card) {
    this.card = card;
  }

  isEmpty() {
    return this.card === null;
  }

  /**
   * Remove the current card.
   */
  clearCard() {
    this.card = null;
  }
}
