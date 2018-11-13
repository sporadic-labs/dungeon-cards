import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6"
};

export default class DeckDisplay {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, x, y, text) {
    this.scene = scene;

    this.x = x;
    this.y = y;
    this.maxCards = 8;
    this.spacing = 1;

    const offset = this.maxCards - 1 * this.spacing;
    this.emptyDeckSprite = scene.add
      .sprite(x + offset, y + offset, "assets", "cards/card-back")
      .setAlpha(0.4);

    this.cards = []; // First element is the leftmost card in the deck
    for (let i = 0; i < this.maxCards; i += 1) {
      const offset = (this.maxCards - 1 - i) * this.spacing;
      const shadow = scene.add.sprite(x + offset, y + offset, "assets", "cards/card-shadow");
      const back = scene.add.sprite(x + offset, y + offset, "assets", "cards/card-back");
      this.cards.push({ shadow, back });
    }
    // Array created in reverse for z sorting reasons - don't want to explicitly set depth here,
    // since then newly drawn cards won't be on top of this deck display. (TODO: global z sorting.)
    this.cards.reverse();

    this.text = scene.add.text(x, y, text, style).setOrigin(0.5, 0.5);
  }

  setValue(value) {
    // First card in array (leftmost card on screen) that is visible
    const visibleIndex = value < this.maxCards ? this.maxCards - value : 0;

    this.cards.forEach(({ shadow, back }, i) => {
      shadow.setVisible(i >= visibleIndex);
      back.setVisible(i >= visibleIndex);
    });

    if (value === 0) this.text.setVisible(false);
    else {
      this.text.setText(value);

      // Center text above the last visible card
      this.text.setPosition(this.cards[visibleIndex].back.x, this.cards[visibleIndex].back.y);
    }
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  destroy() {
    this.cards.forEach(({ shadow, back }) => {
      shadow.destroy();
      back.destroy();
    });
    this.text.destroy();
  }
}
