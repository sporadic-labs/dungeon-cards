import PLAYER_CARD_TYPES from "./player-card-types";

const typeToKey = {
  [PLAYER_CARD_TYPES.ATTACK_ONE]: "player-attack-one",
  [PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL]: "player-attack-three-horizontal",
  [PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL]: "player-attack-three-vertical",
  [PLAYER_CARD_TYPES.ATTACK_GRID]: "player-attack-grid",
  [PLAYER_CARD_TYPES.BLOCK]: "player-block",
  [PLAYER_CARD_TYPES.DRAW]: "player-draw",
  [PLAYER_CARD_TYPES.ENERGY]: "player-energy",
  [PLAYER_CARD_TYPES.SHIFT_LEFT]: "player-shift-left",
  [PLAYER_CARD_TYPES.SHIFT_RIGHT]: "player-shift-right"
};

export default class PlayerCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    // TODO: this is just a simple wrapper to get the assets in the game. We need different classes
    // or components for each type of card to handle the specialized logic
    const key = typeToKey[type];
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
}
