import ENEMY_CARD_TYPES from "./enemy-card-types";
import { emitter, EVENT_NAMES } from "../../events";

export default class EnemyCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    scene.lifecycle.add(this);

    this.scene = scene;
    this.type = type;
    this.health = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? 2 : 1;

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");

    const key = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? "big" : "small";
    this.cardContents = scene.add
      .sprite(0, 0, "assets", `cards/card-contents-enemy-${key}`)
      .setInteractive();

    const healthFrame = `cards/card-contents-enemy-health-${this.health}`;
    this.healthDisplay = scene.add.sprite(0, 0, "assets", healthFrame);

    this.container = scene.add.container(x + this.card.width / 2, y + this.card.height / 2, [
      this.cardShadow,
      this.card,
      this.cardContents,
      this.healthDisplay
    ]);

    this.selected = false;
    this.focused = false;
    this.blocked = false;
    this.turnsBlocked = null;

    // TODO: this should only be enabled after the card as tweened into position. It shouldn't start
    // enabled.
    this.enableFocusing();
  }

  setBlocked(shouldBeBlocked = true) {
    if (this.blocked === shouldBeBlocked) return;

    this.blocked = shouldBeBlocked;
    this.turnsBlocked = 0;

    // Unblock after the end of the next enemy turn
    if (this.blocked) {
      if (!this.blockedOverlay) {
        this.blockedOverlay = this.scene.add.sprite(0, 0, "assets", "attacks/block");
        this.container.add(this.blockedOverlay);
      }
      this.blockedOverlay.visible = true;
      emitter.once(EVENT_NAMES.ENEMY_TURN_END, () => this.setBlocked(false));
    } else {
      if (this.blockedOverlay) this.blockedOverlay.visible = false;
    }
  }

  isBlocked() {
    return this.blocked;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health > 0) {
      const key = this.health >= 2 ? "big" : "small";
      this.cardContents.setTexture("assets", `cards/card-contents-enemy-${key}`);
      const healthFrame = `cards/card-contents-enemy-health-${this.health}`;
      this.healthDisplay.setTexture("assets", healthFrame);
    }
  }

  getPosition() {
    return { x: this.cardContents.x, y: this.cardContents.y };
  }

  // Set via top left
  setPosition(x, y) {
    this.x = x + this.cardContents.width / 2;
    this.y = y + this.cardContents.height / 2;
  }

  enableFocusing() {
    this.cardContents.on("pointerover", this.onPointerOver);
    this.cardContents.on("pointerout", this.onPointerOut);
  }

  disableFocusing() {
    this.cardContents.off("pointerover", this.onPointerOver);
    this.cardContents.off("pointerout", this.onPointerOut);
  }

  enableSelecting() {
    this.cardContents.on("pointerdown", this.onPointerDown);
  }

  disableSelecting() {
    this.cardContents.off("pointerdown", this.onPointerDown);
  }

  onPointerOver = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_FOCUS, this);

  onPointerOut = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_DEFOCUS, this);

  onPointerDown = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_SELECT, this);

  focus() {
    if (this.focused) return;
    this.focused = true;

    this.scene.tweens.killTweensOf(this.container);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;

    this.scene.tweens.killTweensOf(this.container);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  fadeIn(delay) {
    this.scene.tweens.killTweensOf(this.container);
    this.alpha = 0;
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  fadeOut(delay) {
    this.scene.tweens.killTweensOf(this.container);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
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

  // Move via top left
  moveTo(x, y, delay = 0) {
    this.scene.tweens.killTweensOf(this.container);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        x: x + this.card.width / 2,
        y: y + this.card.height / 2,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  beforeTurnEnd() {
    if (this.blocked) {
      this.turnsBlocked++;
      if (this.turnsBlocked === 1) this.setBlocked(false);
    }
  }

  destroy() {
    this.scene.lifecycle.remove(this);
    this.container.destroy();
  }
}
