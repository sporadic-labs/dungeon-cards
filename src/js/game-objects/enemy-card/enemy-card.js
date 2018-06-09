import ENEMY_CARD_TYPES from "./enemy-card-types";
import EVENTS from "../events";

export default class EnemyCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    this.scene = scene;

    const key = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? "strong-enemy" : "weak-enemy";
    this.sprite = scene.add
      .sprite(x, y, "assets", `cards/${key}`)
      .setOrigin(0, 0)
      .setInteractive();

    this.health = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? 2 : 1;

    this.sprite.on("pointerdown", () => this.select());
  }

  isBlocked() {
    return false;
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setPosition(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  select() {
    this.scene.events.emit(EVENTS.SELECT_ENEMY_CARD, this);
  }

  moveTo() {
    // Animate and move to world pixel positions
  }
}
