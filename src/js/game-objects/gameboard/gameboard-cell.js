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

    this.sprite.on("pointerdown", () => {
      Logger.log(
        `Row: ${this.row} Column: ${this.column} is ${
          this.card ? "occupied by" + this.card : "empty!"
        }`
      );
    });
    // NOTE(rex): Need this to work when you are holding a card as well.
    this.sprite.on("pointerover", () => {
      Logger.log(`Hovering over Row: ${this.row} Column: ${this.column}!`);
    });
    this.sprite.on("pointerout", () => {
      Logger.log(`No longer hovering over Row: ${this.row} Column: ${this.column}`);
    });
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

  /**
   * Remove the current card.
   */
  clearCard() {
    this.card = null;
  }
}
