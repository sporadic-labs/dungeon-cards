export class GameBoardCell {
  constructor(scene, column, row) {
    this.scene = scene;

    this.column = column;
    this.row = row;

    this.card = null;

    this.sprite = scene.add.sprite(0, 0, "assets", "cardBack_blue5").setInteractive(); // Enables pointer events but not drag

    const x = this.column * this.sprite.displayWidth;
    const y = this.row * this.sprite.displayHeight;
    this.sprite.setPosition(x, y);

    this.sprite.on("pointerdown", () => {
      console.log(
        `Row: ${this.row} Column: ${this.column} is ${
          this.card ? "occupied by" + this.card : "empty!"
        }`
      );
    });
    // NOTE(rex): Need this to work when you are holding a card as well.
    this.sprite.on("pointerover", () => {
      console.log(`Hovering over Row: ${this.row} Column: ${this.column}!`);
    });
    this.sprite.on("pointerout", () => {
      console.log(`No longer hovering over Row: ${this.row} Column: ${this.column}`);
    });
  }

  getCard() {
    return this.card;
  }

  setCard(card) {
    this.card = card;
  }

  clearCard() {
    this.card = null;
  }
}
