import ENEMY_CARD_TYPES from "./enemy-card-types";
import { emitter, EVENT_NAMES } from "../../events";

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
      .sprite(0, 0, "assets", `cards/${key}`)
      .setOrigin(0.5, 0.5)
      .setInteractive();
    this.setPosition(x, y);

    this.health = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? 2 : 1;

    this.selected = false;
    this.focused = false;
    this.blocked = false;
    this.turnsBlocked = null;

    // TODO: this should only be enabled after the card as tweened into position. It shouldn't start
    // enabled.
    this.enableFocusing();
  }

  setBlocked(shouldBeBlocked = true) {
    // TODO: this could be an animation, or cards could be built more modularly, so that we can have
    // a blocked overlay.
    if (this.blocked !== shouldBeBlocked) {
      this.blocked = shouldBeBlocked;
      this.turnsBlocked = 0;
      this.updateTexture();
    }

    // Unblock after the end of the next enemy turn
    if (this.blocked) {
      emitter.once(EVENT_NAMES.ENEMY_TURN_END, () => this.setBlocked(false));
    }
  }

  updateTexture() {
    let key = this.health === 2 ? "strong-enemy" : "weak-enemy";
    if (this.blocked) key += "-blocked";
    this.sprite.setTexture("assets", `cards/${key}`);
  }

  isBlocked() {
    return this.blocked;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health > 0) this.updateTexture();
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setPosition(x, y) {
    this.sprite.x = x + this.sprite.width / 2;
    this.sprite.y = y + this.sprite.height / 2;
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

    this.scene.tweens.killTweensOf(this.sprite);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;

    this.scene.tweens.killTweensOf(this.sprite);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
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

  fadeOut(delay) {
    this.scene.tweens.killTweensOf(this.sprite);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  die(delay) {
    this.disableFocusing();
    this.disableSelecting();
    return this.fadeOut(delay);
  }

  moveTo(x, y, delay = 0) {
    this.scene.tweens.killTweensOf(this.sprite);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: x + this.sprite.width / 2,
        y: y + this.sprite.height / 2,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  update() {
    if (this.blocked) {
      this.turnsBlocked++;
      if (this.turnsBlocked === 1) this.setBlocked(false);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
