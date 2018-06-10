import ENEMY_CARD_TYPES from "./enemy-card-types";
import { emitter, EVENT_NAMES } from "../events";
import { emitter as gameEmitter, EVENT_NAMES as GAME_EVENT_NAMES } from "../../game-runner";

export default class EnemyCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    this.scene = scene;
    this.type = type;

    const key = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? "strong-enemy" : "weak-enemy";
    this.sprite = scene.add
      .sprite(x, y, "assets", `cards/${key}`)
      .setOrigin(0, 0)
      .setInteractive();

    this.health = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? 2 : 1;

    this.selected = false;
    this.focused = false;
    this.blocked = false;

    // TODO: this should only be enabled after the card as tweened into position. It shouldn't start
    // enabled.
    this.enableFocusing();
  }

  setBlocked(shouldBeBlocked = true) {
    // TODO: this could be an animation, or cards could be built more modularly, so that we can have
    // a blocked overlay.
    if (this.blocked !== shouldBeBlocked) {
      this.blocked = shouldBeBlocked;
      let key = this.type === ENEMY_CARD_TYPES.STRONG_ENEMY ? "strong-enemy" : "weak-enemy";
      if (this.blocked) key += "-blocked";
      this.sprite.setTexture("assets", `cards/${key}`);
    }

    // Unblock after the end of the next enemy turn
    if (this.blocked) {
      gameEmitter.once(GAME_EVENT_NAMES.ENEMY_TURN_END, () => this.setBlocked(false));
    }
  }

  isBlocked() {
    return this.blocked;
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

  onPointerOut = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_DEFOCUS, this);

  onPointerDown = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_SELECT, this);

  focus() {
    if (this.focused) return;
    this.focused = true;
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;
  }

  fadeIn(delay) {
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setAlpha(0);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 1,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  moveTo(x, y, delay = 0) {
    this.scene.tweens.killTweensOf(this.sprite);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: x,
        y: y,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  destroy() {
    this.sprite.destroy();
  }
}
