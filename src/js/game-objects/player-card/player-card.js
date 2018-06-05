import { PLAYER_CARD_INFO } from "./player-card-info";

export default class PlayerCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    this.type = type;

    // TODO: this is just a simple wrapper to get the assets in the game. We need different classes
    // or components for each type of card to handle the specialized logic
    const key = PLAYER_CARD_INFO[type].key;
    this.sprite = scene.add.sprite(x, y, "assets", `cards/${key}`).setOrigin(0, 0);
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setPosition(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  moveTo() {
    // Animate and move to world pixel positions
  }

  destroy() {
    this.sprite.destroy();
  }
}
