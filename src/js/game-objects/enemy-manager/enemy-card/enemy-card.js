import ENEMY_CARD_TYPES from "./enemy-card-types";
import { emitter, EVENT_NAMES } from "../events";

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

    this.selected = false;
    this.focused = false;

    // TODO: this should only be enabled after the card as tweened into position. It shouldn't start
    // enabled.
    this.enableFocusing();

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

  enableFocusing() {
    this.sprite.on("pointerover", this.onPointerOver);
    this.sprite.on("pointerout", this.onPointerOut);
  }

  disableFocusing() {
    this.sprite.off("pointerover", this.onPointerOver);
    this.sprite.off("pointerout", this.onPointerOut);
  }

  enableSelecting() {
    this.sprite.on("pointerdown", this.onPointerDown);
  }

  disableSelecting() {
    this.sprite.off("pointerdown", this.onPointerDown);
  }

  onPointerOver = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_FOCUS, this);

  onPointerOut = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_DEFOCUS, this);

  onPointerDown = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_SELECT, this);

  focus() {
    if (this.focused) return;
    this.focused = true;
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;
  }

  moveTo() {
    // Animate and move to world pixel positions
  }

  destroy() {
    this.sprite.destroy();
  }

}
