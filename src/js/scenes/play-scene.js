import Phaser from "phaser";
import DraggableCard from "../game-objects/draggable-card";
import Deck from "../game-objects/deck/deck";

export default class PlayScene extends Phaser.Scene {
  create() {
    this.add
      .tileSprite(0, 0, 750, 750, "assets", "subtle-pattern-ep-natural-black")
      .setOrigin(0, 0);

    new DraggableCard(this, 100, 100);
    new DraggableCard(this, 300, 100);
    new DraggableCard(this, 500, 100);

    const ENEMY_CARD_TYPES = {
      WEAK_ENEMY: 0,
      STRONG_ENEMY: 1,
      BLANK: 2
    };

    const composition = [
      { id: ENEMY_CARD_TYPES.WEAK_ENEMY, quantity: 17 },
      { id: ENEMY_CARD_TYPES.STRONG_ENEMY, quantity: 3 },
      { id: ENEMY_CARD_TYPES.BLANK, quantity: 30 }
    ];

    const deck = new Deck(composition);
  }

  update(time, delta) {}
}
