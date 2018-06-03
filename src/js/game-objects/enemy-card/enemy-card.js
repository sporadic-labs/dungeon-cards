import { ENEMY_CARD_TYPES } from "../../card-types";

export default class EnemyCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    const key = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? "strong-enemy" : "weak-enemy";
    this.sprite = scene.add.sprite(x, y, "assets", `cards/${key}`).setOrigin(0, 0);

    this.health = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? 2 : 1;
  }

  moveTo() {
    // Animate and move to world pixel positions
  }
}
